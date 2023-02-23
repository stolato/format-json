import {Component, Input} from '@angular/core';
import {JsonEditorOptions} from "@maaxgr/ang-jsoneditor";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  public dummyJsonObject = {};
  @Input() json = '';

  title = 'formatjson';

  public editorOptions: JsonEditorOptions;
  public initialData: any;
  public visibleData: any;

  constructor(private clipboard: Clipboard, private snackBar: MatSnackBar) {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.mode = 'code';
    this.editorOptions.modes = ['code', 'tree'];
    this.editorOptions.indentation = 3;

    this.initialData = this.json || {"products":[{"name":"car","product":[{"name":"honda","model":[{"id":"civic","name":"civic"},{"id":"accord","name":"accord"},{"id":"crv","name":"crv"},{"id":"pilot","name":"pilot"},{"id":"odyssey","name":"odyssey"}]}]}]}
    this.visibleData = this.initialData;
  }

  copy(){
    this.clipboard.copy(JSON.stringify(this.visibleData));
    this.snackBar.open('JSON copiado!!','OK', {
      duration: 3000
    })
  }

  newJson(data: string){
    this.visibleData = data;
    this.initialData = data;
  }

  showJson(d: Event) {
    if(!d.isTrusted) {
      this.visibleData = d;
    }
  }
}
