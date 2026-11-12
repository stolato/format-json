import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * Estrutura padrão de todos os modais do app.
 *
 * ```html
 * <app-modal title="Título" subtitle="Opcional" icon="mat_icon">
 *   <div modal-toolbar>busca, ações da lista…</div>   <!-- opcional -->
 *   …conteúdo…
 *   <ng-container modal-actions>                       <!-- opcional -->
 *     <button mat-button>Cancelar</button>
 *     <button mat-flat-button class="primary-action">Ação</button>
 *   </ng-container>
 * </app-modal>
 * ```
 *
 * - O botão X fecha o modal (ou emite `(close)`, se o pai precisar devolver um resultado).
 * - Toolbar e rodapé somem automaticamente quando nada é projetado neles.
 * - Abra sempre via `ModalService.open(Componente, 'sm' | 'md' | 'lg')`.
 */
@Component({
  selector: 'app-modal',
  encapsulation: ViewEncapsulation.None,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatIconButton, MatIcon, MatTooltip],
  template: `
    <header class="app-modal-header">
      @if (icon) {
        <span class="app-modal-icon" [class.danger]="tone === 'danger'" aria-hidden="true">
          <mat-icon>{{ icon }}</mat-icon>
        </span>
      }
      <div class="app-modal-heading">
        <h2 mat-dialog-title class="app-modal-title">{{ title }}</h2>
        @if (subtitle) {
          <p class="app-modal-subtitle">{{ subtitle }}</p>
        }
      </div>
    </header>
    <div class="app-modal-toolbar"><ng-content select="[modal-toolbar]"></ng-content></div>
    <mat-dialog-content class="app-modal-body">
      <ng-content></ng-content>
    </mat-dialog-content>
    <mat-dialog-actions class="app-modal-actions" align="end"><ng-content select="[modal-actions]"></ng-content></mat-dialog-actions>
    @if (closable) {
      <!-- Último no DOM: o foco inicial vai para o conteúdo; visualmente fica no topo. -->
      <button mat-icon-button type="button" class="app-modal-close" (click)="onClose()"
        aria-label="Fechar" matTooltip="Fechar (Esc)">
        <mat-icon>close</mat-icon>
      </button>
    }
  `,
})
export class ModalComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() tone: 'default' | 'danger' = 'default';
  @Input() closable = true;
  /** Se houver listener, o X emite em vez de fechar (o pai decide o resultado). */
  @Output() close = new EventEmitter<void>();

  constructor(private dialogRef: MatDialogRef<unknown>) {}

  onClose() {
    if (this.close.observed) this.close.emit();
    else this.dialogRef.close();
  }
}
