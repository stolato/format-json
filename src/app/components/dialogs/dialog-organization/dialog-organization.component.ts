import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../../services/api.service";
import {MatDialog} from "@angular/material/dialog";
import {DialogAddUserOrgComponent} from "../dialog-add-user-org/dialog-add-user-org.component";
import {DialogConfirmComponent} from "../dialog-confirm/dialog-confirm.component";
import {DialogAddOrgComponent} from "../dialog-add-org/dialog-add-org.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-dialog-organization',
  templateUrl: './dialog-organization.component.html',
  styleUrls: ['./dialog-organization.component.scss']
})
export class DialogOrganizationComponent implements OnInit {

  constructor(private api: ApiService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  public organization: [] | any;

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  public token: string | any

  ngOnInit() {
    this.token = localStorage.getItem("key")
    if (this.token) {
      this.initOrgs()
    }
  }

  initOrgs(){
    this.api.getOrganization(this.token).subscribe({
      next: (resp) => {
        this.organization = resp;
        console.log(resp);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  addUser(org_id: any){
    const adduser = this.dialog.open(DialogAddUserOrgComponent, {
      disableClose: true,
      data: {
        id: org_id
      }
    })
    adduser.afterClosed().subscribe({
      next: (resp) => {
        console.log(resp);
        if (resp) {
          this.initOrgs()
        }
      }
    })
  }

  addOrg(){
    const addorg = this.dialog.open(DialogAddOrgComponent, {
      disableClose: false,
    })
    addorg.afterClosed().subscribe({
      next: (resp) => {
        console.log(resp);
        if (resp) {
          this.initOrgs()
        }
      }
    })
  }

  removeUser(org_id: string, user: any){
    const confirm = this.dialog.open(DialogConfirmComponent, {
      data: { title: "Remover usuario", text: `Deseja remover o usuario ${user.name} de sua organizacao?` },
    })
    confirm.afterClosed().subscribe({ next: (resp) => {
      if(resp){
        this.api.removeUserToOrganization(this.token, org_id, user.id).subscribe({
          next: (resp) => {
            console.log(resp);
            this.initOrgs()
          },
          error: (err) => {
            this.snackBar.open(`Erro ${err.error.message}`, 'ok', { duration: 2000 });
          }
        });
      }
    }});
  }
}
