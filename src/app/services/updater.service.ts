import { Injectable, signal, inject } from '@angular/core';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UpdaterService {
  private snackBar = inject(MatSnackBar);

  readonly updateAvailable = signal<Update | null>(null);
  readonly installing = signal(false);
  readonly checking = signal(false);

  readonly isTauri = !!(window as any).__TAURI_INTERNALS__;

  async checkForUpdates(showFeedback = false): Promise<void> {
    if (!this.isTauri) return;
    this.checking.set(true);
    try {
      const update = await check();
      if (update?.available) {
        this.updateAvailable.set(update);
        this.snackBar.open(
          `Nova versão ${update.version} disponível!`,
          'Atualizar',
          { duration: 8000, panelClass: 'blue' }
        ).onAction().subscribe(() => this.installUpdate());
      } else if (showFeedback) {
        this.snackBar.open('O app já está na versão mais recente.', 'Ok', { duration: 3000 });
      }
    } catch {
      if (showFeedback) {
        this.snackBar.open('Não foi possível verificar atualizações.', 'Ok', { duration: 3000 });
      }
    } finally {
      this.checking.set(false);
    }
  }

  async installUpdate(): Promise<void> {
    const update = this.updateAvailable();
    if (!update) return;
    this.installing.set(true);

    let downloaded = 0;
    let total = 0;

    try {
      await update.downloadAndInstall((progress) => {
        if (progress.event === 'Started') {
          total = progress.data.contentLength ?? 0;
          this.snackBar.open('Baixando atualização...', undefined, { duration: undefined });
        } else if (progress.event === 'Progress') {
          downloaded += progress.data.chunkLength;
          if (total > 0) {
            const pct = Math.round((downloaded / total) * 100);
            this.snackBar.open(`Baixando atualização... ${pct}%`, undefined, { duration: undefined });
          }
        } else if (progress.event === 'Finished') {
          this.snackBar.open('Instalando... o app vai reiniciar.', undefined, { duration: undefined });
        }
      });
      await relaunch();
    } catch {
      this.installing.set(false);
      this.snackBar.open('Erro ao instalar a atualização.', 'Ok', { duration: 4000 });
    }
  }
}
