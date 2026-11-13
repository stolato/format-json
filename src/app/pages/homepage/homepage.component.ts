import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
  ChangeDetectorRef,
  HostListener,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { JsonEditorOptions, AngJsoneditorModule } from "@stolato/ang-jsoneditor";
import { Clipboard } from "@angular/cdk/clipboard";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { SocketService } from "../../services/socket.service";
import { NgxSpinnerService, NgxSpinnerComponent } from "ngx-spinner";
import { JsonDefault } from "../../services/json-default";
import { AuthService } from "../../services/auth.service";
import { Subscription, skip } from "rxjs";
import { IJsonItem } from "../../models/api-types";
import { apiErrorMessage } from "../../services/api-errors";
import { HeaderComponent } from "../../components/header/header.component";
import { JsonChartComponent } from "../../components/json-chart/json-chart.component";
import { MatIconButton, MatButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { PrettyJsonPipe } from "../../pipes/prettyjson.pipe";
import { DecimalPipe } from "@angular/common";
import { ModalService } from "../../services/modal.service";
import { DialogShortcutsComponent } from "../../components/dialogs/dialog-shortcuts/dialog-shortcuts.component";
import { ChangelogService } from "../../services/changelog.service";

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.scss"],
  // Classe usada pelos overrides globais do jsoneditor (src/styles/_jsoneditor.scss).
  host: { class: "homepage" },
  imports: [
    HeaderComponent,
    AngJsoneditorModule,
    MatIconButton,
    MatButton,
    MatTooltip,
    MatIcon,
    NgxSpinnerComponent,
    PrettyJsonPipe,
    JsonChartComponent,
    DecimalPipe,
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
    if ((this.isUnsaved && this.id && this.viewOnce === 'none') || this.viewOnce === 'revealed') {
      $event.returnValue = true;
    }
  }

  timeOut = 0;
  title = "formatjson";
  json_old = {};

  public editorOptions: JsonEditorOptions;
  public editorOptions_view: JsonEditorOptions;
  public initialData: any;
  private _visibleData: any = null;
  public get visibleData(): any { return this._visibleData; }
  public set visibleData(v: any) {
    this._visibleData = v;
    this.updateStats();
  }

  /** Estatísticas exibidas no footer. */
  public stats = { size: '0 B', keys: 0 };
  /** Erro de sintaxe do editor (null = JSON válido). */
  public jsonError: { message: string; line?: number } | null = null;

  /** Largura do painel do editor em % (divisor arrastável). */
  public split = Number(localStorage.getItem('split')) || 50;
  public dragOver = false;
  /** Dica de primeiro acesso (some depois de dispensada). */
  public showWelcome = !localStorage.getItem('welcome-dismissed');
  public mod = /mac/i.test(navigator.userAgent) ? '⌘' : 'Ctrl+';
  /** Outra pessoa está editando este JSON em tempo real. */
  public remoteEditing = false;
  private remoteEditingTimer = 0;
  private dragDepth = 0;
  @ViewChild('content') contentRef?: ElementRef<HTMLElement>;
  public id: any;
  public showFiller = false;
  public sidebar: boolean = false;
  public hasData: boolean = false;
  public isUnsaved: boolean = false;
  public showChart: boolean = false;
  /** Visualização única: none | locked (aguardando "Revelar") | revealed | gone (já visto). */
  public viewOnce: 'none' | 'locked' | 'revealed' | 'gone' = 'none';
  public revealing = false;
  private loadFailed = false;
  private lastWriteSent = 0;

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
    private modal: ModalService,
    public changelog: ChangelogService,
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = "code";
    this.editorOptions.modes = ["code", "tree"];
    this.editorOptions.indentation = 3;
    this.editorOptions.language = 'pt-BR';
    this.editorOptions.onValidationError = (errors: any[]) => {
      const err = errors?.find((e) => e?.type === 'error') ?? errors?.[0];
      const next = err
        ? { message: err.message ?? 'JSON inválido', line: err.line != null ? err.line : undefined }
        : null;
      if (JSON.stringify(next) !== JSON.stringify(this.jsonError)) {
        this.jsonError = next;
        this.cdr.detectChanges();
      }
    };

    this.editorOptions_view = new JsonEditorOptions();
    this.editorOptions_view.mode = "view";
    this.editorOptions_view.expandAll = true;
    this.editorOptions_view.language = 'pt-BR';

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

    this.listenSocket();

    // Novidades da versão: só na tela inicial, para não cobrir um JSON compartilhado.
    if (!this.route.snapshot.paramMap.get('id')) {
      setTimeout(() => this.changelog.showIfUpdated(), 600);
    }

    // Item privado/de organização que falhou sem login: tenta de novo após logar.
    this.subs.add(
      this.auth.token$.pipe(skip(1)).subscribe((token) => {
        if (token && this.id && this.loadFailed) this.loadItem(this.id);
      }),
    );

    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        const newId = params.get('id');
        if (newId === this.id) return;
        if (this.id) this.socket.disconnectChannel(this.id);
        this.id = newId;
        this.resetViewOnce();
        if (this.id) {
          this.loadItem(this.id);
        } else {
          const init = JsonDefault.default();
          this.initialData = init;
          this.visibleData = init;
          this.hasData = true;
          this.cdr.detectChanges();
        }
      })
    );
  }

  /** `id` é o valor da URL: slug (novo) ou _id (links antigos). */
  private loadItem(id: string) {
    this.loading.show();
    this.loadFailed = false;
    this.apiService.getJson(id).subscribe({
      next: (item: IJsonItem) => {
        this.loading.hide();
        if (id !== this.id) return;
        if (item.view_once) {
          // Não consome nada: só mostra o aviso e o botão "Revelar".
          this.viewOnce = 'locked';
          this.hasData = false;
          this.isUnsaved = false;
          this.cdr.detectChanges();
          return;
        }
        this.initialData = JSON.parse(item.json);
        this.visibleData = JSON.parse(item.json);
        this.hasData = true;
        this.isUnsaved = false;
        this.socket.joinChannel(id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading.hide();
        this.loadFailed = true;
        this.snackBar.open(
          err?.status === 404
            ? "JSON não encontrado ou você não tem permissão para acessá-lo."
            : apiErrorMessage(err, "Ops, não foi possivel recuperar o json solicitado"),
          "Ok",
          { duration: 4000 },
        );
      },
    });
  }

  reveal() {
    if (!this.id || this.revealing) return;
    this.revealing = true;
    this.loading.show();
    this.apiService.revealJson(this.id).subscribe({
      next: (item) => {
        this.loading.hide();
        this.revealing = false;
        const data = JSON.parse(item.json);
        this.initialData = data;
        this.visibleData = data;
        this.viewOnce = 'revealed';
        this.hasData = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading.hide();
        this.revealing = false;
        if (err?.status === 404) {
          this.viewOnce = 'gone';
        } else {
          this.snackBar.open(apiErrorMessage(err, "Não foi possível revelar o conteúdo."), "Ok", { duration: 4000 });
        }
        this.cdr.detectChanges();
      },
    });
  }

  private resetViewOnce() {
    this.viewOnce = 'none';
    this.revealing = false;
  }

  copy() {
    this.clipboard.copy(JSON.stringify(this.visibleData, null, 2));
    this.snackBar.open("JSON copiado!", "OK", {
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
      if (this.viewOnce !== 'none') {
        this.visibleData = d;
        return;
      }
      if (this.id) {
        // Throttle: no máximo um "write" a cada 2s (limite de 30 eventos/s no servidor).
        const now = Date.now();
        if (now - this.lastWriteSent > 2000) {
          this.lastWriteSent = now;
          this.socket.sendMessage("", this.id, "write");
        }
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

  /** Listeners do socket: registrados uma única vez. */
  private listenSocket() {
    this.subs.add(
      this.socket.getMessage("new-json").subscribe((resp: any) => {
        setTimeout(() => {
          if (!this.timeOut) {
            this.initialData = JSON.parse(resp);
          }
          this.setRemoteEditing(false);
          this.visibleData = JSON.parse(resp);
          this.isUnsaved = false;
          this.timeOut = 0;
          this.cdr.detectChanges();
        });
      }),
    );
    this.subs.add(
      this.socket.getMessage("write").subscribe(() => {
        if (!this.timeOut) this.setRemoteEditing(true);
      }),
    );
    this.subs.add(
      this.socket.errors$.subscribe(({ error }) => {
        if (error === 'TOO_MANY_REQUESTS') {
          console.warn('Socket: limite de eventos atingido');
        } else if (error === 'NOT_JOINED' && this.id && this.viewOnce === 'none') {
          this.socket.joinChannel(this.id);
        }
      }),
    );
  }

  /** Indicador discreto no footer (substitui os snackbars que cobriam o editor). */
  private setRemoteEditing(on: boolean) {
    window.clearTimeout(this.remoteEditingTimer);
    this.remoteEditing = on;
    if (on) {
      this.remoteEditingTimer = window.setTimeout(() => {
        this.remoteEditing = false;
        this.cdr.detectChanges();
      }, 4000);
    }
    this.cdr.detectChanges();
  }

  changeId($event: string) {
    if (this.id === $event) return;
    if (this.id) {
      this.socket.disconnectChannel(this.id);
    }
    this.id = $event;
    this.resetViewOnce();
    this.socket.joinChannel(this.id);
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
    window.clearTimeout(this.remoteEditingTimer);
    this.subs.unsubscribe();
    if (this.id) {
      this.socket.disconnectChannel(this.id);
    }
  }

  open() {
    window.open("https://github.com/stolato/format-json", "_blank");
  }

  dismissWelcome() {
    this.showWelcome = false;
    localStorage.setItem('welcome-dismissed', '1');
  }

  openShortcuts() {
    if (this.modal.isOpen('shortcuts')) return;
    this.modal.open(DialogShortcutsComponent, 'md', { id: 'shortcuts', autoFocus: 'dialog' });
  }

  private updateStats() {
    const v = this._visibleData;
    if (v == null || typeof v !== 'object') {
      this.stats = { size: '0 B', keys: 0 };
      return;
    }
    const bytes = new Blob([JSON.stringify(v)]).size;
    const size = bytes < 1024 ? `${bytes} B`
      : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    let keys = 0;
    const stack: any[] = [v];
    while (stack.length) {
      const cur = stack.pop();
      if (cur && typeof cur === 'object') {
        if (!Array.isArray(cur)) keys += Object.keys(cur).length;
        for (const k in cur) stack.push(cur[k]);
      }
    }
    this.stats = { size, keys };
  }

  // ---- Divisor arrastável entre os painéis ----
  startResize(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  onResize(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (!el.hasPointerCapture(e.pointerId) || !this.contentRef) return;
    const rect = this.contentRef.nativeElement.getBoundingClientRect();
    this.setSplit(((e.clientX - rect.left) / rect.width) * 100);
  }

  endResize(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    localStorage.setItem('split', String(Math.round(this.split)));
    // O Ace recalcula o tamanho no resize da janela.
    window.dispatchEvent(new Event('resize'));
  }

  onSplitterKey(e: KeyboardEvent) {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') this.setSplit(this.split - step);
    else if (e.key === 'ArrowRight') this.setSplit(this.split + step);
    else if (e.key === 'Home') this.setSplit(20);
    else if (e.key === 'End') this.setSplit(80);
    else return;
    e.preventDefault();
    localStorage.setItem('split', String(Math.round(this.split)));
    window.dispatchEvent(new Event('resize'));
  }

  resetSplit() {
    this.setSplit(50);
    localStorage.setItem('split', '50');
    window.dispatchEvent(new Event('resize'));
  }

  private setSplit(v: number) {
    this.split = Math.min(80, Math.max(20, v));
  }

  // ---- Arrastar e soltar arquivo JSON ----
  private get canDrop(): boolean {
    return this.viewOnce === 'none';
  }

  onDragEnter(e: DragEvent) {
    if (!this.canDrop || !e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    this.dragDepth++;
    this.dragOver = true;
  }

  onDragOver(e: DragEvent) {
    if (!this.canDrop || !e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  onDragLeave() {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (!this.dragDepth) this.dragOver = false;
  }

  async onDrop(e: DragEvent) {
    if (!this.canDrop) return;
    e.preventDefault();
    this.dragDepth = 0;
    this.dragOver = false;
    const file = e.dataTransfer?.files?.item(0);
    if (!file) return;
    try {
      const text = await file.text();
      JSON.parse(text);
      this.newJson(text);
      // newJson zera o estado em um setTimeout; marca como pendente depois dele.
      setTimeout(() => {
        if (this.id) this.isUnsaved = true;
        this.cdr.detectChanges();
      });
      this.snackBar.open(`Arquivo ${file.name} aberto`, 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open(`O arquivo ${file.name} não é um JSON válido.`, 'Fechar', { duration: 4000 });
    }
  }
}
