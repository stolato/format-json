import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, HostListener } from "@angular/core";
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
    private cdr: ChangeDetectorRef
  ) {}

  @Output() json = new EventEmitter<string>();
  @Output() preview = new EventEmitter<boolean>();
  @Output() openSideBar = new EventEmitter<boolean>();
  @Input() current_json = "";
  @Input() id = "";
  @Input() isChecked = false;
  @Input() DarkMode = false;
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
  @Output() newId = new EventEmitter<string>();

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
