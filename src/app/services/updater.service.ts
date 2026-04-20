import { Injectable, signal, inject } from '@angular/core';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UpdaterService {
  private snackBar = inject(MatSnackBar);

  readonly updateAvailable = signal<string | null>(null);
  readonly checking = signal(false);
  readonly isUpdating = signal(false);
  
  private pendingUpdate: Update | null = null;

  readonly isTauri = !!(window as any).__TAURI_INTERNALS__;

  async checkForUpdates(showFeedback = false): Promise<void> {
    if (!this.isTauri) return;
    this.checking.set(true);
    try {
      const update = await check();
      
      if (update?.available) {
        this.pendingUpdate = update;
        this.updateAvailable.set(update.version);
        
        this.snackBar.open(
          `Nova versão ${update.version} disponível!`,
          'Instalar',
          { duration: 15000, panelClass: 'blue' }
        ).onAction().subscribe(() => this.installUpdate());
      } else if (showFeedback) {
        this.snackBar.open('O app já está na versão mais recente.', 'Ok', { duration: 3000 });
      }
    } catch (error) {
      console.error('Update error:', error);
      if (showFeedback) {
        this.snackBar.open('Não foi possível verificar atualizações.', 'Ok', { duration: 3000 });
      }
    } finally {
      this.checking.set(false);
    }
  }

  async installUpdate(): Promise<void> {
    if (!this.pendingUpdate || this.isUpdating()) return;
    
    this.isUpdating.set(true);
    const snack = this.snackBar.open('Baixando e instalando atualização...', '', { duration: 0 }); // indefinite
    
    try {
      await this.pendingUpdate.downloadAndInstall();
      
      snack.dismiss();
      this.snackBar.open('Atualização concluída! Reiniciando...', '', { duration: 2000 });
      setTimeout(() => relaunch(), 1500);
      
    } catch (error) {
      console.error('Install error:', error);
      snack.dismiss();
      this.snackBar.open('Erro ao instalar atualização.', 'Ok', { duration: 5000 });
    } finally {
      this.isUpdating.set(false);
    }
  }
}
