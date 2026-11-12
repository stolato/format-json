import { Injectable, NgZone } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { IAuthResponse } from '../models/api-types';

export const TOKEN_KEY = 'key';
export const REFRESH_KEY = 'refresh';

/**
 * Guarda o par access/refresh token e faz a renovação.
 *
 * - O refresh token é de uso único: sempre substituímos os dois tokens.
 * - Só uma renovação por vez, inclusive entre abas (Web Locks + localStorage).
 * - Usa um HttpClient sem interceptors para não entrar em loop no 401.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private http: HttpClient;
  private refreshing: Promise<string> | null = null;

  /** Emite o novo access token (ou null) sempre que a sessão muda, nesta ou em outra aba. */
  readonly tokenChanged$ = new Subject<string | null>();
  /** Emite quando a sessão expirou e não foi possível renovar. */
  readonly sessionExpired$ = new Subject<void>();

  constructor(backend: HttpBackend, zone: NgZone) {
    this.http = new HttpClient(backend);
    window.addEventListener('storage', (e) => {
      if (e.key === TOKEN_KEY || e.key === null) {
        zone.run(() => this.tokenChanged$.next(this.token));
      }
    });
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  setTokens(token: string, refreshToken: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    this.tokenChanged$.next(token);
  }

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.tokenChanged$.next(null);
  }

  /** Renova os tokens. Rejeita com 'SESSION_EXPIRED' quando não é possível. */
  refresh(): Promise<string> {
    this.refreshing ??= this.refreshAcrossTabs().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  private async refreshAcrossTabs(): Promise<string> {
    const usedRefresh = this.refreshToken;
    const locks = (navigator as any).locks;
    if (locks?.request) {
      return locks.request('jsonedit-refresh-token', () => this.doRefresh(usedRefresh));
    }
    return this.doRefresh(usedRefresh);
  }

  private async doRefresh(usedRefresh: string | null): Promise<string> {
    // Outra aba já renovou enquanto esperávamos o lock: usa o par novo.
    const current = this.refreshToken;
    if (current && current !== usedRefresh && this.token) {
      return this.token;
    }
    if (!current) {
      this.clear();
      this.sessionExpired$.next();
      throw new Error('SESSION_EXPIRED');
    }
    try {
      const resp = await firstValueFrom(
        this.http.post<IAuthResponse>(`${environment.apiUrl}/refresh`, { refresh_token: current }),
      );
      this.setTokens(resp.token, resp.refresh_token);
      return resp.token;
    } catch (err: any) {
      // Erro de rede/limite não derruba a sessão; 400/401 sim.
      if (err?.status === 400 || err?.status === 401) {
        this.clear();
        this.sessionExpired$.next();
      }
      throw new Error('SESSION_EXPIRED');
    }
  }
}
