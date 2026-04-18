import { Injectable, signal } from '@angular/core';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/api/process';

@Injectable({ providedIn: 'root' })
export class UpdaterService {
  readonly updateAvailable = signal<Update | null>(null);
  readonly installing = signal(false);

  readonly isTauri = !!(window as any).__TAURI_INTERNALS__;

  async checkForUpdates(): Promise<void> {
    if (!this.isTauri) return;
    try {
      const update = await check();
      if (update?.available) {
        this.updateAvailable.set(update);
      }
    } catch {
      // silently ignore — sem conexão ou endpoint não configurado
    }
  }

  async installUpdate(): Promise<void> {
    const update = this.updateAvailable();
    if (!update) return;
    this.installing.set(true);
    try {
      await update.downloadAndInstall();
      await relaunch();
    } catch {
      this.installing.set(false);
    }
  }
}
