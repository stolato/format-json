import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog";
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from "@angular/material/table";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ApiService} from "../../../services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DialogConfirmComponent} from "../dialog-confirm/dialog-confirm.component";
import {JsonDefault} from "../../../services/json-default";
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, CommonModule } from '@angular/common';
import { IJsonItem, IPaginatedResponse } from '../../../models/api-types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-dialog-list-json',
    templateUrl: './dialog-list-json.component.html',
    styleUrls: ['./dialog-list-json.component.scss'],
    imports: [
      CommonModule,
      FormsModule,
      MatDialogTitle,
      MatDialogContent,
      MatDialogActions,
      MatDialogClose,
      CdkScrollable,
      MatTable,
      MatColumnDef,
      MatHeaderCellDef,
      MatHeaderCell,
      MatCellDef,
      MatCell,
      MatIconButton,
      MatButton,
      MatMenuTrigger,
      MatIcon,
      MatMenu,
      MatMenuItem,
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
  displayedColumns: string[] = ["id", 'name', 'view', "org", "options"];

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
    private dialogService: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.getAll();
  }

  edit(element: any){
    this.dialog.close({ item: JSON.stringify(element)})
  }

  ngAfterViewInit() {
  }

  getAll() {
    this.isLoading = true;
    this.token = localStorage.getItem("key")
    if (this.token) {
      this.api.allItems(this.token, this.pageIndex, this.pageSize).subscribe({
        next: (resp: IPaginatedResponse<IJsonItem>) => {
          this.list.data = resp.data;
          this.totalItems = resp.total_items;
          this.pageIndex = resp.page;
          this.pageSize = resp.limit;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open("Erro ao carregar lista de JSONs", "ok", { duration: 2000 });
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
    const dialog = this.dialogService.open(DialogConfirmComponent, {
      data: {
        title: 'Excluir',
        text: 'Tem certeza que deseja excluir este json?'
      }
    })
    dialog.afterClosed().subscribe({
      next: (resp: any) => {
        if (resp) {
          const token = localStorage.getItem("key")
          if (token) {
            this.api.deleteItem(items.id, token).subscribe({
              next: () => {
                this.snackBar.open("JSON Removido com sucesso.")
                this.getAll();
                this.clear(items.id)
              }
            })
          }
        }
      }
    })
  }

  clear(id: string){
    const url_id = this.route.snapshot.paramMap.get('id');
    if(id === url_id) {
      window.location.href = "/";
    }
  }
}
