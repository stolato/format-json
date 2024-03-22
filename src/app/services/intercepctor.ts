import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';

import {BehaviorSubject, Observable, switchMap, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {ApiService} from "./api.service";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private api: ApiService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem("key");
    req = req.clone({
      withCredentials: false,
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(req).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('auth') &&
          error.status === 401
        ) {
          return this.handle401Error(req, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const token = localStorage.getItem("key");
      const refresh = localStorage.getItem("refresh");
      return this.api.refreshToken(token, refresh).pipe(
        switchMap((token: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(token.token);
            localStorage.setItem("key", token.token);
            localStorage.setItem("refresh", token.refresh_token);
            return next.handle(this.addToken(request, token.token));
        }),
        catchError(() => {
          localStorage.clear();
          return next.handle(request);
        }),
      );
    } else {
      return next.handle(request);
    }
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
