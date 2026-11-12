import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ApiService} from "../../../services/api.service";
import { ModalComponent } from "../../modal/modal.component";
import { ModalService } from "../../../services/modal.service";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import {DialogAddUserOrgComponent} from "../dialog-add-user-org/dialog-add-user-org.component";
import {DialogConfirmComponent} from "../dialog-confirm/dialog-confirm.component";
import {DialogAddOrgComponent} from "../dialog-add-org/dialog-add-org.component";
import {MatSnackBar} from "@angular/material/snack-bar";
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
import { apiErrorMessage } from '../../../services/api-errors';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';

@Component({
    selector: 'app-dialog-organization',
    templateUrl: './dialog-organization.component.html',
    styleUrls: ['./dialog-organization.component.scss'],
    imports: [
      ModalComponent,
      MatProgressSpinner,
      CommonModule,
      FormsModule,
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
      MatFormFieldModule,
      MatInputModule,
      MatBadgeModule
    ]
})
export class DialogOrganizationComponent implements OnInit {

  constructor(private api: ApiService, private modal: ModalService, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef, private session: SessionService, private auth: AuthService) { }

  /** Só o dono pode convidar, remover membros e excluir a organização. */
  isOwner(org: any): boolean {
    const me = this.auth.user$.value?.id;
    // Usuário ainda não carregado: mantém as ações visíveis (o backend valida).
    return !me || org?.owner_id === me;
  }

  public organization: any[] = [];
  public filteredOrganizations: any[] = [];
  public searchTerm: string = '';
  public isLoading: boolean = false;

  displayedColumns: string[] = ['avatar', 'name', 'email', 'symbol'];
  public token: string | any

  ngOnInit() {
    this.token = this.session.token
    if (this.token) {
      this.initOrgs();
    }
  }

  initOrgs(){
    this.isLoading = true;
    this.api.getOrganization().subscribe({
      next: (resp: any) => {
        this.organization = resp;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open(apiErrorMessage(err, `Erro ao carregar organizações`), 'ok', { duration: 3000 });
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
    const adduser = this.modal.open(DialogAddUserOrgComponent, 'sm', {
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
    const addorg = this.modal.open(DialogAddOrgComponent, 'sm')
    addorg.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.initOrgs()
        }
      }
    })
  }

  deleteOrg(org_id: string){
    const confirm = this.modal.open(DialogConfirmComponent, 'sm', {
      data: { title: "Excluir organização", text: `Os JSONs dela passarão a ser privados de quem os criou e os demais membros perderão o acesso. Esta ação não pode ser desfeita.`, confirmLabel: "Excluir", danger: true },
    })
    confirm.afterClosed().subscribe({ next: (resp) => {
        if(resp){
          this.api.deleteOrganization(org_id).subscribe({
            next: () => {
              this.snackBar.open('Organização removida', 'ok', { duration: 2000 });
              this.initOrgs()
            },
            error: (err) => {
              this.snackBar.open(apiErrorMessage(err, 'Erro ao remover organização'), 'ok', { duration: 3000 });
            }
          });
        }
      }});
  }

  removeUser(org_id: string, user: any){
    const confirm = this.modal.open(DialogConfirmComponent, 'sm', {
      data: { title: "Remover membro", text: `Deseja remover ${user.name} da organização? Essa pessoa perderá o acesso aos JSONs da equipe.`, confirmLabel: "Remover", danger: true },
    })
    confirm.afterClosed().subscribe({ next: (resp) => {
      if(resp){
        this.api.removeUserToOrganization(org_id, user.id).subscribe({
          next: () => {
            this.snackBar.open('Usuário removido', 'ok', { duration: 2000 });
            this.initOrgs()
          },
          error: (err) => {
            this.snackBar.open(apiErrorMessage(err, 'Erro ao remover usuário'), 'ok', { duration: 3000 });
          }
        });
      }
    }});
  }
}
