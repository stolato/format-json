import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { MatButton } from '@angular/material/button';
import { ModalComponent } from '../../modal/modal.component';

export interface ConfirmDialogData {
  title: string;
  text: string;
  /** Texto do botão de confirmação (padrão: "Confirmar"). */
  confirmLabel?: string;
  /** Texto do botão de cancelar (padrão: "Cancelar"). */
  cancelLabel?: string;
  /** Ação destrutiva: botão vermelho e foco inicial em "Cancelar". */
  danger?: boolean;
  /** Ícone do cabeçalho (padrão: "warning" se danger, "help" caso contrário). */
  icon?: string;
}

@Component({
    selector: 'app-dialog-confirm',
    templateUrl: './dialog-confirm.component.html',
    styleUrls: ['./dialog-confirm.component.scss'],
    imports: [ModalComponent, MatButton, MatDialogClose]
})
export class DialogConfirmComponent {
  public title: string;
  public text: string;
  public confirmLabel: string;
  public cancelLabel: string;
  public danger: boolean;
  public icon: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: ConfirmDialogData) {
    this.title = data.title;
    this.text = data.text;
    this.confirmLabel = data.confirmLabel ?? 'Confirmar';
    this.cancelLabel = data.cancelLabel ?? 'Cancelar';
    this.danger = !!data.danger;
    this.icon = data.icon ?? (this.danger ? 'warning' : 'help_outline');
  }
}
