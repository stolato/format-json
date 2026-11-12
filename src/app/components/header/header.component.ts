import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, HostListener, Optional } from "@angular/core";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { OpenFileComponent } from "../open-file/open-file.component";
import { ModalService } from "../../services/modal.service";
import { SharedComponent } from "../dialogs/shared/shared.component";
import { ApiService } from "../../services/api.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { DialogLoginComponent } from "../dialogs/dialog-login/dialog-login.component";
import { DialogRegisterComponent } from "../dialogs/dialog-register/dialog-register.component";
import { JsonDefault } from "../../services/json-default";
import { DialogConfirmComponent } from "../dialogs/dialog-confirm/dialog-confirm.component";
import {DialogListJsonComponent} from "../dialogs/dialog-list-json/dialog-list-json.component";
import {DialogOrganizationComponent} from "../dialogs/dialog-organization/dialog-organization.component";
import { DialogShortcutsComponent } from "../dialogs/dialog-shortcuts/dialog-shortcuts.component";
import { AuthService } from "../../services/auth.service";
import { UpdaterService } from "../../services/updater.service";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatDivider } from "@angular/material/divider";
import { apiErrorMessage } from "../../services/api-errors";
import { itemKey } from "../../models/api-types";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"],
    imports: [MatToolbar, MatIconButton, MatTooltip, MatIcon, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider]
})
export class HeaderComponent implements OnInit {
  constructor(
    private modal: ModalService,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    private loading: NgxSpinnerService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    public updater: UpdaterService
  ) {}

  @Output() json = new EventEmitter<string>();
  @Output() preview = new EventEmitter<boolean>();
  @Output() openSideBar = new EventEmitter<boolean>();
  @Input() current_json = "";
  @Input() id = "";
  @Input() isChecked = false;
  @Input() DarkMode = false;
  @Input() unsaved = false;
  /** Item de visualização única: sem salvar/editar. */
  @Input() readOnly = false;
  @Output() setDarkMode = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();
  @Output() toggleChart = new EventEmitter<boolean>();

  public chartActive = false;

  /** Rótulo do modificador de atalhos exibido nos tooltips (⌘ no macOS, Ctrl nos demais). */
  public mod = /mac/i.test(navigator.userAgent) ? '⌘' : 'Ctrl+';

  @HostListener('window:keydown', ['$event'])
  shortcuts(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
    if (this.modal.openCount) return;
    const key = event.key.toLowerCase();
    if (key === '/') {
      event.preventDefault();
      this.openShortcuts();
    } else if (key === 's') {
      event.preventDefault();
      if (this.id && !this.readOnly) this.saveJson();
      else if (!this.id) this.shareJson();
    } else if (key === 'o') {
      event.preventDefault();
      this.openUpload();
    }
  }

  public nameUser = "";
  /** false enquanto o e-mail do usuário logado não for confirmado. */
  public emailVerified = true;
  private saving = false;
  private resending = false;
  public isTauri = false;
  public userPlatform: 'mac' | 'windows' | 'linux' | 'other' = 'other';
  private appWindow: any;
  @Output() newId = new EventEmitter<string>();

  downloadLinks = {
    mac:     '',
    windows: '',
    linux:   '',
  };

  private async loadDownloadLinks(): Promise<void> {
    try {
      const res = await fetch('https://api.github.com/repos/stolato/format-json/releases/latest');
      const { tag_name } = await res.json();
      const v = tag_name.replace('v', '');
      const base = `https://github.com/stolato/format-json/releases/latest/download`;
      this.downloadLinks = {
        mac:     `${base}/JSONEdit_${v}_universal.dmg`,
        windows: `${base}/JSONEdit_${v}_x64-setup.exe`,
        linux:   `${base}/JSONEdit_${v}_amd64.deb`,
      };
    } catch {
      // fallback: abre a página de releases
      const page = 'https://github.com/stolato/format-json/releases/latest';
      this.downloadLinks = { mac: page, windows: page, linux: page };
    }
  }

  openUpload() {
    const open = this.modal.open(OpenFileComponent, 'md');
    open.afterClosed().subscribe((data) => {
      if (data) {
        setTimeout(() => {
          this.json.emit(data);
        });
      }
    });
  }

  shareJson() {
    this.modal
      .open(SharedComponent, 'md', {
        disableClose: true,
        data: { json: this.current_json, id: this.id },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp?.login) {
          this.openLogin();
          return;
        }
        // Visualização única: não abre o item (o editor mostraria o conteúdo vazio).
        if (resp?.slug && !resp.viewOnce) {
          this.router.navigate([resp.slug]).then((r) => r);
          this.id = resp.slug;
        }
      });
  }

  test() {
    this.isChecked = !this.isChecked;
    if (this.isChecked && this.chartActive) {
      this.chartActive = false;
      this.toggleChart.emit(false);
    }
    this.preview.emit(this.isChecked);
    this.auth.updateSettings({ dark_mode: this.DarkMode, preview: this.isChecked });
  }

  openChart() {
    this.chartActive = !this.chartActive;
    if (this.chartActive && this.isChecked) {
      this.isChecked = false;
      this.preview.emit(false);
      this.auth.updateSettings({ dark_mode: this.DarkMode, preview: false });
    }
    this.toggleChart.emit(this.chartActive);
  }

  saveJson() {
    if (this.saving || this.readOnly) return;
    this.saving = true;
    this.loading.show();
    this.apiService.updateJson(this.id, this.current_json).subscribe({
      next: () => {
        this.snackBar.open("json salvo!!", "Ok", {
          duration: 3000,
        });
        this.saved.emit();
        this.loading.hide();
        this.saving = false;
      },
      error: (err) => {
        this.loading.hide();
        this.saving = false;
        const msg = err?.status === 404
          ? "Não foi possível salvar: JSON não encontrado ou sem permissão."
          : apiErrorMessage(err, "Não foi possível salvar o JSON.");
        this.snackBar.open(msg, "Ok", { duration: 4000 });
      }
    });
  }

  openLogin() {
    const loginDialog = this.modal.open(DialogLoginComponent, 'md');
    loginDialog.afterClosed().subscribe({
      next: (resp) => {
        if (resp?.switchTo === 'register') {
          this.openRegister();
        } else if (resp?.name) {
          this.nameUser = resp.name;
          this.cdr.detectChanges();
        }
      },
    });
  }

  openRegister() {
    this.modal.open(DialogRegisterComponent, 'md').afterClosed().subscribe((resp) => {
      if (resp?.switchTo === 'login') this.openLogin();
    });
  }

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      this.nameUser = user?.name || (this.auth.token$.value ? localStorage.getItem("name") : "") || "";
      this.emailVerified = user ? user.email_verified !== false : true;
      this.cdr.detectChanges();
    });
    this.auth.sessionExpired$.subscribe(() => {
      this.nameUser = "";
      this.cdr.detectChanges();
      this.snackBar
        .open("Sua sessão expirou. Faça login novamente.", "Login", { duration: 6000 })
        .onAction()
        .subscribe(() => this.openLogin());
    });
    this.auth.settings$.subscribe(settings => {
      this.isChecked = settings.preview;
      this.DarkMode = settings.dark_mode;
      this.cdr.detectChanges();
    });

    this.isTauri = !!(window as any).__TAURI_INTERNALS__;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac'))        this.userPlatform = 'mac';
    else if (ua.includes('win'))   this.userPlatform = 'windows';
    else if (ua.includes('linux')) this.userPlatform = 'linux';

    if (!this.isTauri) {
      this.loadDownloadLinks();
    }

    if (this.isTauri) {
      try {
        this.appWindow = getCurrentWindow();
      } catch (e) {
        console.warn('Tauri API fail:', e);
      }
      this.updater.checkForUpdates();
    }
  }

  minimize() {
    this.appWindow?.minimize();
  }

  toggleMaximize() {
    this.appWindow?.toggleMaximize();
  }

  closeApp() {
    if (this.unsaved && this.id) {
      const dialog = this.modal.open(DialogConfirmComponent, 'sm', {
        data: {
          title: "Descartar alterações?",
          text: "Você possui edições que ainda não foram salvas. Deseja realmente sair e perder os dados?",
          confirmLabel: "Descartar",
          danger: true,
        },
      });
      dialog.afterClosed().subscribe({
        next: (resp) => {
          if (resp) {
            this.appWindow?.close();
          }
        },
      });
    } else {
      this.appWindow?.close();
    }
  }

  logout() {
    this.nameUser = "";
    this.auth.logout();
  }

  logoutAll() {
    const dialog = this.modal.open(DialogConfirmComponent, 'sm', {
      data: {
        title: "Sair de todos os dispositivos",
        text: "Todas as suas sessões serão encerradas, inclusive nesta aba. Deseja continuar?",
        confirmLabel: "Sair de todos",
      },
    });
    dialog.afterClosed().subscribe((resp) => {
      if (resp) {
        this.nameUser = "";
        this.auth.logout(true);
      }
    });
  }

  resendVerification() {
    if (this.resending) return;
    this.resending = true;
    this.apiService.resendVerifyEmail().subscribe({
      next: () => {
        this.resending = false;
        this.snackBar.open("E-mail de confirmação enviado. Verifique sua caixa de entrada.", "Ok", { duration: 4000 });
      },
      error: (err) => {
        this.resending = false;
        if (err?.error?.message === "ALREADY_VERIFIED") {
          this.auth.refreshUser();
        }
        this.snackBar.open(apiErrorMessage(err, "Não foi possível reenviar o e-mail."), "Ok", { duration: 4000 });
      },
    });
  }

  newJson() {
    const dialog = this.modal.open(DialogConfirmComponent, 'sm', {
      data: {
        title: "Novo JSON",
        text: "O editor será limpo para um novo JSON. Deseja continuar?",
        confirmLabel: "Novo JSON",
      },
    });
    dialog.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.clear();
        }
      },
    });
  }

  private clear() {
    this.id = "";
    this.router.navigate(["/"]).then((r) => r);
    this.json.emit(JSON.stringify(JsonDefault.default()));
  }

  setDark() {
    this.DarkMode = !this.DarkMode;
    this.setDarkMode.emit(this.DarkMode);
    this.auth.updateSettings({ dark_mode: this.DarkMode, preview: this.isChecked });
  }

  openList(){
    const list = this.modal.open(DialogListJsonComponent, 'lg');
    list.afterClosed().subscribe({
      next: (resp) => {
        if (resp?.item) {
          setTimeout(() => {
            const item = JSON.parse(resp.item);
            const key = itemKey(item);
            if (item.view_once) {
              // Conteúdo vem vazio na listagem: a página do item mostra o "Revelar".
              this.router.navigate([key]).then((r) => r);
              return;
            }
            this.json.emit(item.json);
            this.router.navigate([key]).then((r) => r);
            this.id = key;
            this.newId.emit(this.id);
          });
        }
      }
    })
  }

  openInApp() {
    const a = document.createElement('a');
    a.href = 'jsonedit://' + this.id;
    a.click();
  }

  openShortcuts() {
    if (this.modal.isOpen('shortcuts')) return;
    this.modal.open(DialogShortcutsComponent, 'md', { id: 'shortcuts', autoFocus: 'dialog' });
  }

  openOrg() {
    this.modal.open(DialogOrganizationComponent, 'lg');
  }
}
