import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ApiService} from "../../../services/api.service";
import { MatDialog, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog";
import {DialogAddUserOrgComponent} from "../dialog-add-user-org/dialog-add-user-org.component";
import {DialogConfirmComponent} from "../dialog-confirm/dialog-confirm.component";
import {DialogAddOrgComponent} from "../dialog-add-org/dialog-add-org.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dialog-organization',
    templateUrl: './dialog-organization.component.html',
    styleUrls: ['./dialog-organization.component.scss'],
    imports: [
      CommonModule,
      FormsModule,
      MatDialogTitle,
      CdkScrollable,
      MatDialogContent,
      MatButton,
      MatAccordion,
      MatExpansionPanel,
      MatExpansionPanelHeader,
      MatExpansionPanelTitle,
      MatExpansionPanelDescription,
      MatTable,
      MatColumnDef,
      MatHeaderCellDef,
      MatHeaderCell,
      MatCellDef,
      MatCell,
      MatIconButton,
      MatMenuTrigger,
      MatIcon,
      MatMenu,
      MatMenuItem,
      MatHeaderRowDef,
      MatHeaderRow,
      MatRowDef,
      MatRow,
      MatDialogActions,
      MatDialogClose,
      MatFormFieldModule,
      MatInputModule,
      MatBadgeModule
    ]
})
export class DialogOrganizationComponent implements OnInit {

  constructor(private api: ApiService, private dialog: MatDialog, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) { }

  public organization: any[] = [];
  public filteredOrganizations: any[] = [];
  public searchTerm: string = '';
  public isLoading: boolean = false;

  displayedColumns: string[] = ['avatar', 'name', 'email', 'symbol'];
  public token: string | any

  ngOnInit() {
    this.token = localStorage.getItem("key")
    if (this.token) {
      this.initOrgs();
    }
  }

  initOrgs(){
    this.isLoading = true;
    this.api.getOrganization(this.token).subscribe({
      next: (resp: any) => {
        this.organization = resp;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(`Erro ao carregar organizações`, 'ok', { duration: 2000 });
        console.log(err);
      }
    })
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredOrganizations = [...this.organization];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredOrganizations = this.organization.filter(org =>
        org.name.toLowerCase().includes(search)
      );
    }
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
        if (resp) {
          this.initOrgs()
        }
      }
    })
  }

  deleteOrg(org_id: string){
    const confirm = this.dialog.open(DialogConfirmComponent, {
      data: { title: "Remover organização", text: `Deseja remover a organização? Esta ação não pode ser desfeita.` },
    })
    confirm.afterClosed().subscribe({ next: (resp) => {
        if(resp){
          this.api.deleteOrganization(this.token, org_id).subscribe({
            next: () => {
              this.snackBar.open('Organização removida', 'ok', { duration: 2000 });
              this.initOrgs()
            },
            error: (err) => {
              this.snackBar.open(`Erro ${err.error.message}`, 'ok', { duration: 2000 });
            }
          });
        }
      }});
  }

  removeUser(org_id: string, user: any){
    const confirm = this.dialog.open(DialogConfirmComponent, {
      data: { title: "Remover usuário", text: `Deseja remover o usuário ${user.name} de sua organização?` },
    })
    confirm.afterClosed().subscribe({ next: (resp) => {
      if(resp){
        this.api.removeUserToOrganization(this.token, org_id, user.id).subscribe({
          next: () => {
            this.snackBar.open('Usuário removido', 'ok', { duration: 2000 });
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
