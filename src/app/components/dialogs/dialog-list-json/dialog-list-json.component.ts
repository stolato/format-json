import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ApiService} from "../../../services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DialogConfirmComponent} from "../dialog-confirm/dialog-confirm.component";
import {JsonDefault} from "../../../services/json-default";

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-dialog-list-json',
  templateUrl: './dialog-list-json.component.html',
  styleUrls: ['./dialog-list-json.component.scss']
})

export class DialogListJsonComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["id", 'name', 'view', "org", "options"];

  public token: string | null = '';
  public list: any = []

  constructor(
    private dialog: MatDialogRef<DialogListJsonComponent>,
    private api: ApiService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialogService: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.getAll()
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
          this.list = resp.data;
        }
      })
    } else {
      this.list = [];
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
