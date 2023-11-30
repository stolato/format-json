import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {OpenFileComponent} from "../open-file/open-file.component";
import {MatDialog} from "@angular/material/dialog";
import {SharedComponent} from "../shared/shared.component";
import {ApiService} from "../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
import {DialogLoginComponent} from "../dialog-login/dialog-login.component";
import {DialogRegisterComponent} from "../dialog-register/dialog-register.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{
  constructor(
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    private loading: NgxSpinnerService,
  ) {
  }

  private save_preview = localStorage.getItem('preview');
  @Output() json = new EventEmitter<string>();
  @Output() preview = new EventEmitter<boolean>();
  @Output() openSideBar = new EventEmitter<boolean>();
  @Input() current_json = '';
  @Input() id = '';
  @Input() sideBarStatus = false;
  @Output() updateSideBar = new EventEmitter<boolean>();

  public nameUser = '';
  public isChecked = this.save_preview ? JSON.parse(this.save_preview) : false;

  openUpload() {
    const open = this.bottomSheet.open(OpenFileComponent)
    open.afterDismissed().subscribe((data) => {
      if (data) {
        this.json.emit(data);
      }
    })
  }

  open() {
    window.open('https://github.com/stolato/format-json', '_blank');
  }

  shareJson() {
    this.dialog.open(SharedComponent, {
      width: '550px',
      disableClose: true,
      data: {json: this.current_json, id: this.id},
    }).afterClosed().subscribe((resp) => {
      if (resp) {
        this.router.navigate([resp]).then(r => r);
        this.id = resp;
      }
    });
  }

  test() {
    this.preview.emit(this.isChecked);
  }

  saveJson() {
    this.loading.show();
    this.apiService.updateJson(this.id, this.current_json).subscribe(() => {
      this.snackBar.open('json salvo!!', 'Ok', {
        duration: 3000,
      })
      this.updateSideBar.emit(true);
      this.loading.hide();
    }, () => {
      this.loading.hide();
    });
  }

  openSidebarClick(){
    this.sideBarStatus = !this.sideBarStatus;
    this.openSideBar.emit(this.sideBarStatus);
  }

  openLogin(){
    const loginDialog = this.dialog.open(DialogLoginComponent,{
      width: '550px',
      disableClose: false,
    });
    loginDialog.afterClosed().subscribe({
      next: (resp) => {
        if(resp) {
          this.nameUser = resp.name;
          this.updateSideBar.emit(true);
        }
      }
    })
  }

  openRegister(){
    this.dialog.open(DialogRegisterComponent,{
      width: '550px',
      disableClose: false,
    });
  }

  ngOnInit(): void {
    this.nameUser = localStorage.getItem("name") || '';
  }

  logout(){
    this.nameUser = '';
    localStorage.clear();
    this.updateSideBar.emit(true);
  }
}


