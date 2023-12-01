import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfirmComponent} from "../dialog-confirm/dialog-confirm.component";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit{
  constructor(private api: ApiService, private router: Router, private snack: MatSnackBar, private dialog: MatDialog) {}
  panelOpenState = false;
  showFiller = false;
  public list:any = []
  @Output() json = new EventEmitter<string>();
  @Output() id = new EventEmitter<string>();
  @Input() updateSideBar: any = false;
  public token: string | null = '';

  ngOnInit(): void {
   this.getAll()
  }

  ngOnChanges(){
    this.getAll()
  }

  edit(item: any) {
    this.json.emit(JSON.parse(item.json));
    this.id.emit(item.id)
    this.router.navigate([item.id]).then(r => r);
  }

  getAll(){
    this.token = localStorage.getItem("key")
    if(this.token) {
      this.api.allItems(this.token).subscribe({
        next: (resp) => {
          this.list = resp;
        }
      })
    } else {
      this.list = [];
    }
  }

  deleteItem(items: any) {
    const dialog = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Excluir',
        text: 'Tem certeza que deseja excluir este json?'
      }
    })
    dialog.afterClosed().subscribe({
      next: (resp) => {
        if(resp) {
          if(resp) {
            this.token = localStorage.getItem("key")
            if(this.token) {
              this.api.deleteItem(items.id, this.token).subscribe({
                next: () => {
                  this.snack.open("JSON Removido com sucesso.")
                  this.getAll();
                }
              })
            }
          }
        }
      }
    })

  }
}
