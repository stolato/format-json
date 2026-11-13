import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ModalComponent } from '../../modal/modal.component';
import { CHANGELOG, ChangeTag } from '../../../data/changelog';

const TAG_LABELS: Record<ChangeTag, string> = {
  novo: 'Novo',
  seguranca: 'Segurança',
  design: 'Design',
  melhoria: 'Melhoria',
  correcao: 'Correção',
};

@Component({
  selector: 'app-dialog-changelog',
  imports: [ModalComponent, MatButton, MatDialogClose, MatIcon, DatePipe],
  template: `
    <app-modal title="Novidades da versão {{ current.version }}" [subtitle]="current.summary ?? ''" icon="auto_awesome">
      <ul class="highlights">
        @for (h of current.highlights; track h.title) {
          <li class="card">
            <span class="card-icon" [attr.data-tag]="h.tag" aria-hidden="true"><mat-icon>{{ h.icon }}</mat-icon></span>
            <div class="card-body">
              <div class="card-title">
                <h3>{{ h.title }}</h3>
                <span class="tag" [attr.data-tag]="h.tag">{{ tagLabel[h.tag] }}</span>
              </div>
              <p>{{ h.description }}</p>
            </div>
          </li>
        }
      </ul>

      @if (current.fixes?.length) {
        <details class="section">
          <summary>Correções e ajustes ({{ current.fixes!.length }})</summary>
          <ul class="fixes">
            @for (f of current.fixes; track f) { <li>{{ f }}</li> }
          </ul>
        </details>
      }

      @if (previous.length) {
        <details class="section">
          <summary>Versões anteriores</summary>
          @for (entry of previous; track entry.version) {
            <div class="older">
              <h4>{{ entry.version }} <time [attr.datetime]="entry.date">{{ entry.date | date: 'dd/MM/yyyy' }}</time></h4>
              <ul>
                @for (h of entry.highlights; track h.title) { <li><strong>{{ h.title }}:</strong> {{ h.description }}</li> }
                @for (f of entry.fixes ?? []; track f) { <li>{{ f }}</li> }
              </ul>
            </div>
          }
        </details>
      }

      <ng-container modal-actions>
        <button mat-flat-button class="primary-action" mat-dialog-close>Entendi</button>
      </ng-container>
    </app-modal>
  `,
  styles: [`
    .highlights { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .card {
      display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; border-radius: 12px;
      background: var(--mat-sys-surface-container); border: 1px solid var(--mat-sys-outline-variant);
    }
    .card-icon {
      display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container);
    }
    .card-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .card-icon[data-tag='seguranca'] { background: var(--mat-sys-tertiary-container); color: var(--mat-sys-on-tertiary-container); }
    .card-icon[data-tag='design'] { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
    .card-body { min-width: 0; }
    .card-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    h3 { margin: 0; font-size: 14px; font-weight: 600; color: var(--mat-sys-on-surface); }
    .card-body p { margin: 4px 0 0; font-size: 13px; line-height: 1.45; color: var(--mat-sys-on-surface-variant); }
    .tag {
      font-size: 10.5px; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase;
      padding: 1px 7px; border-radius: 999px; border: 1px solid currentColor; color: var(--mat-sys-primary);
    }
    .tag[data-tag='seguranca'] { color: var(--mat-sys-tertiary); }
    .tag[data-tag='design'] { color: var(--mat-sys-secondary); }

    .section { margin-top: 14px; }
    .section summary {
      cursor: pointer; font-size: 13px; font-weight: 500; color: var(--mat-sys-primary);
      padding: 4px 0; border-radius: 4px;
    }
    .section summary:focus-visible { outline: 2px solid var(--primary-accent); outline-offset: 2px; }
    .fixes, .older ul { margin: 6px 0 0; padding-left: 20px; font-size: 13px; line-height: 1.5; color: var(--mat-sys-on-surface-variant); }
    .older { margin-top: 10px; }
    .older h4 { margin: 0; font-size: 13px; font-weight: 600; color: var(--mat-sys-on-surface); }
    .older time { margin-left: 6px; font-weight: 400; color: var(--mat-sys-on-surface-variant); }
  `],
})
export class DialogChangelogComponent {
  readonly current = CHANGELOG[0];
  readonly previous = CHANGELOG.slice(1);
  readonly tagLabel = TAG_LABELS;
}
