import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { IAuthResponse, ISettings, IUser } from '../models/api-types';
import { ApiService } from './api.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private settingsKey = 'settings';

  public token$: BehaviorSubject<string | null>;
  /** Sem preferência salva, o tema inicial segue o sistema operacional. */
  private static systemDark(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  }

  public settings$ = new BehaviorSubject<ISettings>({ dark_mode: AuthService.systemDark(), preview: false });
  public user$ = new BehaviorSubject<IUser | null>(null);

  constructor(private apiService: ApiService, private session: SessionService) {
    this.token$ = new BehaviorSubject<string | null>(session.token);

    // Mantém o estado em sincronia (renovação, logout em outra aba, sessão expirada).
    this.session.tokenChanged$.subscribe((token) => {
      const hadToken = !!this.token$.value;
      this.token$.next(token);
      if (!token) {
        this.resetUser();
      } else if (!hadToken) {
        this.loadSettings();
      }
    });

    this.loadSettings();
  }

  get sessionExpired$(): Observable<void> {
    return this.session.sessionExpired$;
  }

  login(email: string, password: string): Observable<IAuthResponse> {
    return this.apiService.auth(email, password).pipe(
      tap((resp) => this.setTokens(resp.token, resp.refresh_token)),
    );
  }

  setTokens(token: string, refreshToken: string) {
    // tokenChanged$ dispara o loadSettings() quando é um login novo.
    this.session.setTokens(token, refreshToken);
  }

  /** Encerra a sessão no servidor (ou todas, com `all`) e limpa o estado local. */
  async logout(all = false) {
    const refresh = this.session.refreshToken;
    try {
      if (all) {
        await firstValueFrom(this.apiService.logoutAll());
      } else if (refresh) {
        await firstValueFrom(this.apiService.logout(refresh));
      }
    } catch (e) {
      // Mesmo se o servidor falhar, a sessão local é encerrada.
      console.error(e);
    } finally {
      localStorage.removeItem('name');
      localStorage.removeItem(this.settingsKey);
      this.session.clear();
      this.resetUser();
    }
  }

  private resetUser() {
    localStorage.removeItem('name');
    this.user$.next(null);
    this.settings$.next({ dark_mode: AuthService.systemDark(), preview: false });
  }

  refreshUser() {
    if (!this.session.token) return;
    this.apiService.me().subscribe({
      next: (user) => {
        localStorage.setItem('name', user.name);
        this.user$.next(user);
      },
      error: (err) => console.error(err),
    });
  }

  public loadSettings() {
    const token = this.session.token;
    const localSet = localStorage.getItem(this.settingsKey);

    if (localSet) {
      try {
        this.settings$.next(JSON.parse(localSet));
      } catch (e) {}
    }

    if (token) {
      this.apiService.getSettings().subscribe({
        next: (resp) => {
          if (resp && resp.settings) {
            try {
              const parsedSettings = typeof resp.settings === 'string' ? JSON.parse(resp.settings) : resp.settings;
              localStorage.setItem(this.settingsKey, typeof resp.settings === 'string' ? resp.settings : JSON.stringify(resp.settings));
              this.settings$.next(parsedSettings);
            } catch (e) {
              console.error("Falha ao efetuar parse de configs", e);
            }
          }
        },
        error: (err) => console.error(err)
      });
      this.refreshUser();
    }
  }

  updateSettings(settings: ISettings) {
    this.settings$.next(settings);
    localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    if (this.session.token) {
      this.apiService.setSettings(settings).subscribe({
        error: (err) => console.error(err)
      });
    }
  }
}
