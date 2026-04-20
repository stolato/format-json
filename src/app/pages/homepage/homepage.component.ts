import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
  ChangeDetectorRef,
  HostListener,
} from "@angular/core";
import { JsonEditorOptions, AngJsoneditorModule } from "@maaxgr/ang-jsoneditor";
import { Clipboard } from "@angular/cdk/clipboard";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { SocketService } from "../../services/socket.service";
import { NgxSpinnerService, NgxSpinnerComponent } from "ngx-spinner";
import { JsonDefault } from "../../services/json-default";
import { AuthService } from "../../services/auth.service";
import { Subscription } from "rxjs";
import { HeaderComponent } from "../../components/header/header.component";
import { JsonChartComponent } from "../../components/json-chart/json-chart.component";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { PrettyJsonPipe } from "../../pipes/prettyjson.pipe";

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.scss"],
  imports: [
    HeaderComponent,
    AngJsoneditorModule,
    MatIconButton,
    MatTooltip,
    MatIcon,
    NgxSpinnerComponent,
    PrettyJsonPipe,
    JsonChartComponent,
  ],
})
export class HomepageComponent implements OnInit, OnDestroy {
  public dummyJsonObject = {};

  @Output() idChange = new EventEmitter<string>();
  @Input() json = "";
  @Input() preview = false;
  @Input() darkMode = false;

  private subs = new Subscription();

  @HostListener("window:beforeunload", ["$event"])
  unloadNotification($event: any) {
    if (this.isUnsaved && this.id) {
      $event.returnValue = true;
    }
  }

  timeOut = 0;
  title = "formatjson";
  write = 0;
  json_old = {};

  public editorOptions: JsonEditorOptions;
  public editorOptions_view: JsonEditorOptions;
  public initialData: any;
  public visibleData: any = null;
  public id: any;
  public showFiller = false;
  public sidebar: boolean = false;
  public hasData: boolean = false;
  public isUnsaved: boolean = false;
  public showChart: boolean = false;

  public date = new Date().getFullYear();

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loading: NgxSpinnerService,
    private socket: SocketService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = "code";
    this.editorOptions.modes = ["code", "tree"];
    this.editorOptions.indentation = 3;

    this.editorOptions_view = new JsonEditorOptions();
    this.editorOptions_view.mode = "view";
    this.editorOptions_view.expandAll = true;

    this.initialData = this.json;
    this.visibleData = this.initialData;
  }

  ngOnInit(): void {
    this.subs.add(
      this.auth.settings$.subscribe((settings) => {
        this.preview = settings.preview;
        this.darkMode = settings.dark_mode;
        this.cdr.detectChanges();
      }),
    );

    this.id = this.route.snapshot.paramMap.get("id");
    if (this.id) {
      this.loading.show();
      this.joinChannel();
      this.apiService.getJson(this.id).subscribe({
        next: (resp: any) => {
          this.initialData = JSON.parse(resp.json);
          this.visibleData = JSON.parse(resp.json);
          this.hasData = true;
          this.isUnsaved = false;
          this.loading.hide();
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading.hide();
          this.snackBar.open(
            "Ops, não foi possivel recuperar o json solicitado",
            "Ok",
            { duration: 3000 },
          );
        },
      });
    } else {
      const init = JsonDefault.default();
      this.initialData = init;
      this.visibleData = init;
      this.hasData = true;
      this.cdr.detectChanges();
    }
  }

  copy() {
    this.clipboard.copy(JSON.stringify(this.visibleData));
    this.snackBar.open("JSON copiado!!", "OK", {
      duration: 3000,
    });
  }

  newJson(data: string) {
    this.hasData = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.visibleData = JSON.parse(data);
      this.initialData = JSON.parse(data);
      this.hasData = true;
      this.isUnsaved = false;
      this.cdr.detectChanges();
    });
  }

  setPreview(prev: boolean) {
    this.preview = prev;
    this.cdr.detectChanges();
  }

  showJson(d: Event) {
    if (!d.isTrusted) {
      console.log(d);
      if (this.id) {
        this.socket.sendMessage("", this.id, "write");
        window.clearTimeout(this.timeOut);
        this.timeOut = window.setTimeout(() => {
          this.socket.sendMessage(JSON.stringify(d), this.id, "new-json");
        }, 1000);
      }
      this.visibleData = d;
      if (this.id) {
        this.isUnsaved = true;
      }
    }
  }

  onSaved() {
    this.isUnsaved = false;
    this.cdr.detectChanges();
  }

  joinChannel() {
    this.socket.joinChannel(this.id);
    this.subs.add(
      this.socket.getMessage("new-json").subscribe((resp: any) => {
        setTimeout(() => {
          if (!this.timeOut) {
            this.initialData = JSON.parse(resp);
            this.snackBar.open("atualizado", "OK", {
              duration: 1000,
            });
          }
          this.visibleData = JSON.parse(resp);
          this.isUnsaved = false;
          this.write = 0;
          this.timeOut = 0;
          this.cdr.detectChanges();
        });
      }),
    );
    this.subs.add(
      this.socket.getMessage("write").subscribe(() => {
        if (!this.timeOut && !this.write) {
          this.snackBar.open("alguem esta digitando...", "", {
            verticalPosition: "top",
            panelClass: ["blue"],
          });
          this.write = 1;
        }
      }),
    );
  }

  changeId($event: string) {
    if (this.id) {
      this.socket.disconnectChannel(this.id);
    }
    this.id = $event;

    this.joinChannel();
  }

  setDark($event: boolean) {
    this.darkMode = $event;
    this.cdr.detectChanges();
  }

  setChart($event: boolean) {
    this.showChart = $event;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.id) {
      this.socket.disconnectChannel(this.id);
    }
  }

  open() {
    window.open("https://github.com/stolato/format-json", "_blank");
  }
}
