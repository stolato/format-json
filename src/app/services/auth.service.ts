import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISettings, IUser } from '../models/api-types';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'key';
  private settingsKey = 'settings';

  public token$ = new BehaviorSubject<string | null>(localStorage.getItem(this.tokenKey));
  public settings$ = new BehaviorSubject<ISettings>({ dark_mode: false, preview: false });
  public user$ = new BehaviorSubject<IUser | null>(null);

  constructor(private apiService: ApiService) {
    this.loadSettings();
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.token$.next(token);
    this.loadSettings();
  }

  logout() {
    localStorage.clear();
    this.token$.next(null);
    this.user$.next(null);
    this.settings$.next({ dark_mode: false, preview: false });
  }

  public loadSettings() {
    const token = this.token$.value;
    const localSet = localStorage.getItem(this.settingsKey);
    
    if (localSet) {
      try {
        this.settings$.next(JSON.parse(localSet));
      } catch (e) {}
    }

    if (token) {
      this.apiService.getSettings(token).subscribe({
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
      // Try to load user data here too:
      this.apiService.me(token).subscribe({
        next: (user) => {
           this.user$.next(user);
        }
      });
    }
  }

  updateSettings(settings: ISettings) {
    this.settings$.next(settings);
    localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    const token = this.token$.value;
    if (token) {
      this.apiService.setSettings(token, settings).subscribe({
        error: (err) => console.error(err)
      });
    }
  }
}
