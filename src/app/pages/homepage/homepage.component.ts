import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {JsonEditorOptions} from "@maaxgr/ang-jsoneditor";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../services/api.service";
import {SocketService} from "../../services/socket.service";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  public dummyJsonObject = {};
  private save_preview = localStorage.getItem('preview');
  @Input() json = '';
  @Input() preview = this.save_preview ? JSON.parse(this.save_preview) : false;

  timeOut = 0;
  title = 'formatjson';
  write = 0;
  json_old = {};

  public editorOptions: JsonEditorOptions;
  public editorOptions_view: JsonEditorOptions;
  public initialData: any;
  public visibleData: any = null;
  public id: any;

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private socket: SocketService,
  ) {
    console.log(Boolean(localStorage.getItem('preview')));
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.mode = 'code';
    this.editorOptions.modes = ['code', 'tree'];
    this.editorOptions.indentation = 3;

    this.editorOptions_view = new JsonEditorOptions()
    this.editorOptions_view.mode = 'view';
    this.editorOptions_view.expandAll = true;

    this.initialData = this.json || {
      "products": [{
        "name": "car",
        "product": [{
          "name": "honda",
          "model": [{"id": "civic", "name": "civic"}, {"id": "accord", "name": "accord"}, {
            "id": "crv",
            "name": "crv"
          }, {"id": "pilot", "name": "pilot"}, {"id": "odyssey", "name": "odyssey"}]
        }]
      }]
    }
    this.visibleData = this.initialData;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id){
      this.socket.joinChannel(this.id);
      this.socket.getMessage('new-json').subscribe((resp: any) => {
        if(!this.timeOut){
          this.initialData = JSON.parse(resp);
          this.snackBar.open('atulizado', 'OK', {
            duration: 1000,
          })
        }
        this.visibleData = JSON.parse(resp);
        this.write = 0;
        this.timeOut = 0;
      })
      this.socket.getMessage('write').subscribe(() => {
        if(!this.timeOut && !this.write){
          this.snackBar.open('alguem esta digitando...', '', {
            verticalPosition: "top",
            panelClass: ['blue']
          });
          this.write = 1;
        }
      })
      this.apiService.getJson(this.id).subscribe((resp: any) => {
        console.log(resp);
        this.initialData = JSON.parse(resp.json);
        this.visibleData = JSON.parse(resp.json);
      });
    }
  }

  copy() {
    this.clipboard.copy(JSON.stringify(this.visibleData));
    this.snackBar.open('JSON copiado!!', 'OK', {
      duration: 3000
    })
  }

  newJson(data: string) {
    this.visibleData = data;
    this.initialData = data;
  }

  setPreview(prev: boolean) {
    localStorage.setItem('preview', `${prev}`);
    this.preview = prev;
  }

  showJson(d: Event) {
    if (!d.isTrusted) {
      if(this.id) {
        this.socket.sendMessage('', this.id, 'write');
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(()=> {
          this.socket.sendMessage(JSON.stringify(d), this.id, 'new-json');
        }, 1000);
      }
      this.visibleData = d;
    }
  }
}
