import {Component, Input, OnInit} from '@angular/core';
import {JsonEditorOptions} from "@maaxgr/ang-jsoneditor";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../services/api.service";
import {NgxSpinnerService} from "ngx-spinner";

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

  title = 'formatjson';

  public editorOptions: JsonEditorOptions;
  public editorOptions_view: JsonEditorOptions;
  public initialData: any;
  public visibleData: any = null;
  public id: any;
  public showFiller = false;

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
      const init = {
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
      };
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
    localStorage.setItem('preview', `${prev}`);
    this.preview = prev;
  }

  showJson(d: Event) {
    if (!d.isTrusted) {
      this.visibleData = d;
    }
  }
}
