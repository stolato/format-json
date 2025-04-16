import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {JsonEditorOptions} from "@maaxgr/ang-jsoneditor";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../services/api.service";
import {NgxSpinnerService} from "ngx-spinner";
import {JsonDefault} from "../../services/json-default";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  public dummyJsonObject = {};
  private settings = {
    dark_mode: false,
    preview: false,
  };

  @Output() idChange = new EventEmitter<string>;
  @Input() json = '';
  @Input() preview = this.settings?.preview || false;
  @Input() darkMode = this.settings?.dark_mode || false;

  title = 'formatjson';

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
    if (this.id) {
      this.loading.show();
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
    this.visibleData = JSON.parse(data);
    this.initialData = JSON.parse(data);
  }

  setPreview(prev: boolean) {
    this.preview = prev;
  }

  showJson(d: Event) {
    if (!d.isTrusted) {
      this.visibleData = d;
    }
  }

  changeId($event: string){
    this.id = $event
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

  open() {
    window.open("https://github.com/stolato/format-json", "_blank");
  }
}
