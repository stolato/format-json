import { Injectable, signal } from '@angular/core';
import { APP_VERSION } from '../data/changelog';
import { ModalService } from './modal.service';
import { DialogChangelogComponent } from '../components/dialogs/dialog-changelog/dialog-changelog.component';

const LAST_SEEN_KEY = 'changelog-last-seen';
/** Chave que só existe para quem já usou o app antes do changelog existir. */
const LEGACY_USER_KEY = 'welcome-dismissed';

@Injectable({ providedIn: 'root' })
export class ChangelogService {
  readonly version = APP_VERSION;
  /** Há novidades que o usuário ainda não viu (para o ponto no rodapé). */
  readonly hasUnseen = signal(localStorage.getItem(LAST_SEEN_KEY) !== APP_VERSION);

  constructor(private modal: ModalService) {}

  /**
   * Abre o modal automaticamente uma única vez por versão.
   * Instalação nova não vê changelog: a versão é só registrada.
   */
  showIfUpdated(): void {
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    if (lastSeen === APP_VERSION) return;

    const isReturningUser = lastSeen !== null || localStorage.getItem(LEGACY_USER_KEY) !== null;
    if (!isReturningUser) {
      this.markSeen();
      return;
    }
    this.open();
  }

  open(): void {
    if (this.modal.isOpen('changelog')) return;
    this.modal.open(DialogChangelogComponent, 'md', { id: 'changelog', autoFocus: 'dialog' });
    this.markSeen();
  }

  private markSeen(): void {
    localStorage.setItem(LAST_SEEN_KEY, APP_VERSION);
    this.hasUnseen.set(false);
  }
}
