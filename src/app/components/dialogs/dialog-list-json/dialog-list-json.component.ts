import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { ModalComponent } from "../../modal/modal.component";
import { ModalService } from "../../../services/modal.service";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from "@angular/material/table";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ApiService} from "../../../services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DialogConfirmComponent} from "../dialog-confirm/dialog-confirm.component";
import {JsonDefault} from "../../../services/json-default";
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, CommonModule } from '@angular/common';
import { IJsonItem, IPaginatedResponse, itemKey } from '../../../models/api-types';
import { apiErrorMessage } from '../../../services/api-errors';
import { SessionService } from '../../../services/session.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-dialog-list-json',
    templateUrl: './dialog-list-json.component.html',
    styleUrls: ['./dialog-list-json.component.scss'],
    imports: [
      ModalComponent,
      MatProgressSpinner,
      CommonModule,
      FormsModule,
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
      MatDivider,
      MatHeaderRowDef,
      MatHeaderRow,
      MatRowDef,
      MatRow,
      DatePipe,
      MatPaginatorModule,
      MatFormFieldModule,
      MatInputModule
    ]
})

export class DialogListJsonComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'view', "org", "options"];

  public token: string | null = '';
  public list = new MatTableDataSource<any>();
  public isLoading: boolean = false;
  public searchTerm: string = '';

  // Pagination
  public totalItems = 0;
  public pageSize = 20;
  public pageIndex = 0;

  constructor(
    private dialog: MatDialogRef<DialogListJsonComponent>,
    private api: ApiService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private modal: ModalService,
    private cdr: ChangeDetectorRef,
    private session: SessionService,
  ) {
  }

  ngOnInit(): void {
    this.getAll();
  }

  edit(element: any){
    this.dialog.close({ item: JSON.stringify(element)})
  }

  copyLink(element: IJsonItem) {
    this.clipboard.copy(`https://jsonedit.com.br/${itemKey(element)}`);
    this.snackBar.open('Link copiado!', 'OK', { duration: 2500 });
  }

  ngAfterViewInit() {
  }

  getAll() {
    this.isLoading = true;
    this.token = this.session.token;
    if (this.token) {
      this.api.allItems(this.pageIndex, this.pageSize).subscribe({
        next: (resp: IPaginatedResponse<IJsonItem>) => {
          this.list.data = resp.data;
          this.totalItems = resp.total_items;
          this.pageIndex = resp.page;
          this.pageSize = resp.limit;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.snackBar.open(apiErrorMessage(err, "Erro ao carregar lista de JSONs"), "ok", { duration: 3000 });
        }
      })
    } else {
      this.list.data = [];
      this.isLoading = false;
    }
  }

  applyFilter() {
    // A paginação da API geralmente filtra no backend, 
    // mas se quisermos busca instantânea na página atual:
    const filterValue = this.searchTerm.toLowerCase();
    this.list.filter = filterValue.trim().toLowerCase();
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getAll();
  }

  deleteItem(items: any) {
    const dialog = this.modal.open(DialogConfirmComponent, 'sm', {
      data: {
        title: 'Excluir JSON',
        text: `Tem certeza que deseja excluir "${items?.name || 'JSON sem nome'}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        danger: true,
      }
    })
    dialog.afterClosed().subscribe({
      next: (resp: any) => {
        if (resp) {
          const key = itemKey(items);
          this.api.deleteItem(key).subscribe({
            next: () => {
              this.snackBar.open("JSON Removido com sucesso.", "Ok", { duration: 3000 })
              this.getAll();
              this.clear(key)
            },
            error: (err) => {
              this.snackBar.open(apiErrorMessage(err, "Não foi possível remover o JSON."), "Ok", { duration: 3000 });
            }
          })
        }
      }
    })
  }

  key(item: IJsonItem): string {
    return itemKey(item);
  }

  clear(id: string){
    const url_id = this.route.snapshot.paramMap.get('id');
    if(id === url_id) {
      window.location.href = "/";
    }
  }
}
