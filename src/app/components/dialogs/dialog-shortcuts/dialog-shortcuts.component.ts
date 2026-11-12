import { Component } from '@angular/core';
import { ModalComponent } from '../../modal/modal.component';

/** `alt`: teclas alternativas (qualquer uma), não uma combinação. */
interface Shortcut { keys: string[]; label: string; alt?: boolean; }
interface Group { title: string; items: Shortcut[]; }

@Component({
  selector: 'app-dialog-shortcuts',
  imports: [ModalComponent],
  template: `
    <app-modal title="Atalhos de teclado" icon="keyboard">
      @for (group of groups; track group.title) {
        <h3 class="group-title">{{ group.title }}</h3>
        <dl class="list">
          @for (s of group.items; track s.label) {
            <div class="row">
              <dt>{{ s.label }}</dt>
              <dd>
                @for (k of s.keys; track $index) {
                  @if ($index > 0 && !s.alt) { <span class="plus" aria-hidden="true">+</span> }
                  <kbd>{{ k }}</kbd>
                }
              </dd>
            </div>
          }
        </dl>
      }
    </app-modal>
  `,
  styles: [`
    .group-title {
      margin: 16px 0 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.8px;
      text-transform: uppercase; color: var(--mat-sys-on-surface-variant);
    }
    .group-title:first-of-type { margin-top: 0; }
    .list { margin: 0; }
    .row {
      display: flex; justify-content: space-between; align-items: center; gap: 24px;
      padding: 8px 0; border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .row:last-child { border-bottom: none; }
    dt { color: var(--mat-sys-on-surface); }
    dd { margin: 0; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
    kbd {
      font-family: 'JetBrains Mono', monospace; font-size: 12px; min-width: 22px; text-align: center;
      padding: 2px 6px; border-radius: 4px; border: 1px solid var(--mat-sys-outline-variant);
      border-bottom-width: 2px; background: var(--mat-sys-surface-container-highest); color: var(--mat-sys-on-surface);
    }
    .plus { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
  `],
})
export class DialogShortcutsComponent {
  private mod = /mac/i.test(navigator.userAgent) ? '⌘' : 'Ctrl';

  groups: Group[] = [
    {
      title: 'Arquivo',
      items: [
        { keys: [this.mod, 'S'], label: 'Salvar (ou compartilhar, se ainda não salvo)' },
        { keys: [this.mod, 'Shift', 'S'], label: 'Baixar JSON (.json)' },
        { keys: [this.mod, 'O'], label: 'Abrir arquivo' },
        { keys: [this.mod, '/'], label: 'Mostrar atalhos' },
      ],
    },
    {
      title: 'Editor',
      items: [
        { keys: ['Ctrl', 'I'], label: 'Formatar JSON' },
        { keys: ['Ctrl', 'Shift', 'I'], label: 'Compactar JSON' },
        { keys: [this.mod, 'F'], label: 'Buscar' },
        { keys: [this.mod, 'Z'], label: 'Desfazer' },
        { keys: [this.mod, 'Shift', 'Z'], label: 'Refazer' },
      ],
    },
    {
      title: 'Gráfico',
      items: [
        { keys: ['←', '↑', '→', '↓'], label: 'Mover', alt: true },
        { keys: ['+', '−'], label: 'Aumentar / diminuir zoom', alt: true },
        { keys: ['0'], label: 'Enquadrar na tela' },
      ],
    },
  ];
}
