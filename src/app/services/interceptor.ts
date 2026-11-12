import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { from, Observable, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SessionService } from './session.service';

/** Rotas em que um 401 não deve disparar renovação de token. */
const NO_REFRESH = ['/auth', '/refresh', '/logout', '/register', '/verify-email'];

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private session: SessionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Só envia o token para a nossa API (nunca para ipify, github etc.)
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    const sentToken = this.session.token;
    const authReq = this.withToken(req, sentToken);

    return next.handle(authReq).pipe(
      catchError((error) => {
        const path = req.url.slice(environment.apiUrl.length).split('?')[0];
        const skip = NO_REFRESH.some((p) => path === p || path.startsWith(p + '/'));
        if (error instanceof HttpErrorResponse && error.status === 401 && !skip && sentToken) {
          return this.handle401(req, next, sentToken, error);
        }
        return throwError(() => error);
      }),
    );
  }

  private withToken(req: HttpRequest<any>, token: string | null) {
    return token
      ? req.clone({ withCredentials: false, setHeaders: { Authorization: `Bearer ${token}` } })
      : req.clone({ withCredentials: false });
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler, sentToken: string, original: HttpErrorResponse) {
    // Outra requisição/aba já renovou: só repete com o token atual.
    const current = this.session.token;
    const tokenPromise = current && current !== sentToken ? Promise.resolve(current) : this.session.refresh();

    return from(tokenPromise.then(
      (token): string | null => token,
      // Sessão encerrada: segue como anônimo (itens públicos continuam abrindo).
      () => {
        if (this.session.token) throw original;
        return null;
      },
    )).pipe(
      // Repete uma única vez; se falhar de novo, o erro sobe normalmente.
      switchMap((token) => next.handle(this.withToken(req, token))),
    );
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
