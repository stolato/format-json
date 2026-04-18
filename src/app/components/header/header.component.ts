import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, HostListener, Optional } from "@angular/core";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { OpenFileComponent } from "../open-file/open-file.component";
import { MatDialog } from "@angular/material/dialog";
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
import { AuthService } from "../../services/auth.service";
import { UpdaterService } from "../../services/updater.service";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { MatMenuTrigger, MatMenu, MatMenuItem } from "@angular/material/menu";
import { MatDivider } from "@angular/material/divider";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"],
    imports: [MatToolbar, MatIconButton, MatTooltip, MatIcon, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider]
})
export class HeaderComponent implements OnInit {
  constructor(
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
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
  @Output() setDarkMode = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  @HostListener('window:keydown.control.s', ['$event'])
  saveShortcut(event: Event) {
    if (this.id) {
      event.preventDefault();
      this.saveJson();
    }
  }

  public nameUser = "";
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
    const open = this.bottomSheet.open(OpenFileComponent);
    open.afterDismissed().subscribe((data) => {
      if (data) {
        setTimeout(() => {
          this.json.emit(data);
        });
      }
    });
  }

  shareJson() {
    this.dialog
      .open(SharedComponent, {
        width: "550px",
        disableClose: true,
        data: { json: this.current_json, id: this.id },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.router.navigate([resp]).then((r) => r);
          this.id = resp;
        }
      });
  }

  test() {
    this.isChecked = !this.isChecked;
    this.preview.emit(this.isChecked);
    this.auth.updateSettings({ dark_mode: this.DarkMode, preview: this.isChecked });
  }

  saveJson() {
    this.loading.show();
    this.apiService.updateJson(this.id, this.current_json).subscribe({
      next: () => {
        this.snackBar.open("json salvo!!", "Ok", {
          duration: 3000,
        });
        this.saved.emit();
        this.loading.hide();
      },
      error: () => {
        this.loading.hide();
      }
    });
  }

  openLogin() {
    const loginDialog = this.dialog.open(DialogLoginComponent, {
      width: "550px",
      disableClose: false,
    });
    loginDialog.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.nameUser = resp.name;
          this.cdr.detectChanges();
          this.auth.loadSettings();
        }
      },
    });
  }

  openRegister() {
    this.dialog.open(DialogRegisterComponent, {
      width: "550px",
      disableClose: false,
    });
  }

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      this.nameUser = user?.name || localStorage.getItem("name") || "";
      this.cdr.detectChanges();
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
      const dialog = this.dialog.open(DialogConfirmComponent, {
        data: {
          title: "Descartar alterações?",
          text: "Você possui edições que ainda não foram salvas. Deseja realmente sair e perder os dados?",
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

  newJson() {
    const dialog = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: "Novo",
        text: "Tem certeza que deseja iniciar um novo json?",
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
    console.log(this.DarkMode);
    this.setDarkMode.emit(this.DarkMode);
    this.auth.updateSettings({ dark_mode: this.DarkMode, preview: this.isChecked });
  }

  openList(){
    const list = this.dialog.open(DialogListJsonComponent, {
      width: "70%",
      disableClose: false,
    });
    list.afterClosed().subscribe({
      next: (resp) => {
        if (resp?.item) {
          setTimeout(() => {
            const item = JSON.parse(resp.item);
            this.json.emit(item.json);
            this.router.navigate([item.id]).then((r) => r);
            this.id = item.id;
            this.newId.emit(this.id);
          });
        }
      }
    })
  }

  openOrg() {
    this.dialog.open(DialogOrganizationComponent, {
      width: "80%",
      height: "80%",
      disableClose: false,
    })
  }
}
