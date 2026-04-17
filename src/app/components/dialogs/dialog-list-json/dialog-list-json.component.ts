import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent } from "@angular/material/dialog";
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ApiService} from "../../../services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DialogConfirmComponent} from "../dialog-confirm/dialog-confirm.component";
import {JsonDefault} from "../../../services/json-default";
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
    selector: 'app-dialog-list-json',
    templateUrl: './dialog-list-json.component.html',
    styleUrls: ['./dialog-list-json.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIconButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DatePipe]
})

export class DialogListJsonComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["id", 'name', 'view', "org", "options"];

  public token: string | null = '';
  public list = new MatTableDataSource<any>();

  constructor(
    private dialog: MatDialogRef<DialogListJsonComponent>,
    private api: ApiService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialogService: MatDialog,
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getAll();
    }, 100);
  }

  edit(element: any){
    this.dialog.close({ item: JSON.stringify(element)})
  }

  ngAfterViewInit() {
  }

  getAll() {
    this.token = localStorage.getItem("key")
    if (this.token) {
      this.api.allItems(this.token).subscribe({
        next: (resp) => {
          this.list.data = resp.data;
        }
      })
    } else {
      this.list.data = [];
    }
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
