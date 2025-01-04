import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {JsonEditorOptions} from "@maaxgr/ang-jsoneditor";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../services/api.service";
import {SocketService} from "../../services/socket.service";
import {NgxSpinnerService} from "ngx-spinner";
import {JsonDefault} from "../../services/json-default";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  public dummyJsonObject = {};
  private settings = JSON.parse(<string>localStorage.getItem('settings'));
  @Output() sidebarStatus = new EventEmitter<boolean>;
  public updateSidebar = false;
  @Output() idChange = new EventEmitter<string>;
  @Input() json = '';
  @Input() preview = this.settings?.preview || false;
  @Input() darkMode = this.settings?.dark_mode || false;

  timeOut = 0;
  title = 'formatjson';
  write = 0;
  json_old = {};

  public editorOptions: JsonEditorOptions;
  public editorOptions_view: JsonEditorOptions;
  public initialData: any;
  public visibleData: any = null;
  public id: any;
  public showFiller = false;
  public sidebar: boolean = false;

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loading: NgxSpinnerService,
    private socket: SocketService,
  ) {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.mode = 'code';
    this.editorOptions.modes = ['code', 'tree'];
    this.editorOptions.indentation = 3;

    this.editorOptions_view = new JsonEditorOptions()
    this.editorOptions_view.mode = 'view';
    this.editorOptions_view.expandAll = true;

    this.initialData = this.json;
    this.visibleData = this.initialData;
  }

  ngOnInit(): void {
    this.getSettings();
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id){
      this.loading.show();
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
        this.initialData = JSON.parse(resp.json);
        this.visibleData = JSON.parse(resp.json);
        this.loading.hide();
      }, () => {
        this.loading.hide();
        this.snackBar.open(
          'Ops, não foi possivel recuperar o json solicitado',
          'Ok',
          {duration: 3000}
        );
      });
    }else{

      const init = JsonDefault.default();
      this.initialData = init;
      this.visibleData = init;
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

  openSideBarEvent($event: boolean) {
    this.sidebarStatus.emit($event);
    this.sidebar = $event
  }

  changeId($event: string){
    this.id = $event
  }

  updateSideBarFunc() {
    this.updateSidebar = !this.updateSidebar;
  }

  setDark($event: boolean) {
    this.darkMode = $event;
  }

  getSettings(){
    const token = localStorage.getItem("key")
    if (token) {
      this.apiService.getSettings(token).subscribe((resp) => {
        localStorage.setItem("settings", resp.settings);
        const settings = JSON.parse(resp.settings);
        if(settings.preview) {
          this.preview = settings.preview;
        }
        if(settings.dark_mode) {
          this.darkMode = settings.dark_mode;
        }
      });
    }
  }
}
