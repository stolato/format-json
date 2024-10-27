import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfirmComponent} from "../dialogs/dialog-confirm/dialog-confirm.component";
import {JsonDefault} from "../../services/json-default";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  panelOpenState = false;
  showFiller = false;
  public list: any = []
  @Output() json = new EventEmitter<string>();
  @Output() id = new EventEmitter<string>();
  @Input() updateSideBar: any = false;
  public token: string | null = '';

  ngOnInit(): void {
    this.getAll()
  }

  ngOnChanges() {
    this.getAll()
  }

  edit(item: any) {
    this.json.emit(JSON.parse(item.json));
    this.id.emit(item.id)
    this.router.navigate([item.id]).then(r => r);
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
    const dialog = this.dialog.open(DialogConfirmComponent, {
      data: {
        title: 'Excluir',
        text: 'Tem certeza que deseja excluir este json?'
      }
    })
    dialog.afterClosed().subscribe({
      next: (resp) => {
        if (resp) {
          this.token = localStorage.getItem("key")
          console.log(this.token)
          if (this.token) {
            this.api.deleteItem(items.id, this.token).subscribe({
              next: () => {
                this.snack.open("JSON Removido com sucesso.")
                this.getAll();
                this.clear(items.id);
              }
            })
          }
        }
      }
    })
  }

  private clear(id: string){
    const url_id = this.route.snapshot.paramMap.get('id');
    if(id === url_id) {
      this.id.emit('');
      this.router.navigate(['/']).then(r => r);
      this.json.emit(JSON.stringify(JsonDefault.default()));
    }
  }
}
