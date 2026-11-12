import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

export type ModalSize = 'sm' | 'md' | 'lg';

const WIDTHS: Record<ModalSize, string> = {
  sm: '420px', // confirmações e formulários de um campo
  md: '560px', // formulários e conteúdo curto
  lg: '960px', // listas e gerenciamento
};

/** Abre modais com tamanho, foco e classes padronizados. */
@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(private dialog: MatDialog) {}

  open<T, D = any, R = any>(component: ComponentType<T>, size: ModalSize = 'md', config: MatDialogConfig<D> = {}): MatDialogRef<T, R> {
    const panelClass = ['app-modal-panel', `app-modal-${size}`, ...([] as string[]).concat(config.panelClass ?? [])];
    return this.dialog.open<T, D, R>(component, {
      width: WIDTHS[size],
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      ...config,
      panelClass,
    });
  }

  get openCount(): number {
    return this.dialog.openDialogs.length;
  }

  isOpen(id: string): boolean {
    return !!this.dialog.getDialogById(id);
  }
}
