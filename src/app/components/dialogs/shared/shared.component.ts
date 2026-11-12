import {Component, Inject, OnInit, ChangeDetectorRef} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { filter } from "rxjs";
import { ModalComponent } from '../../modal/modal.component';
import {ApiService} from "../../../services/api.service";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SessionService } from '../../../services/session.service';
import { apiErrorMessage } from '../../../services/api-errors';
import { IOrganization } from '../../../models/api-types';

@Component({
    selector: 'app-shared',
    templateUrl: './shared.component.html',
    styleUrls: ['./shared.component.scss'],
    imports: [ModalComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatHint, MatInput, MatSelect, MatOption, MatProgressSpinner, MatIcon, MatButton, MatSlideToggle]
})
export class SharedComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<SharedComponent>,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private session: SessionService,
  ) {
    this.json = data.json;
    this.id = data.id;
    // disableClose devolve o resultado por close(); Esc e clique fora seguem o mesmo caminho.
    this.dialog.backdropClick().subscribe(() => this.close());
    this.dialog.keydownEvents().pipe(filter((e) => e.key === 'Escape')).subscribe(() => this.close());
  }

  askLogin() {
    this.dialog.close({ login: true });
  }

  sendForm: FormGroup | any;
  /** slug do item criado */
  public link: string | null = null;
  json = '';
  id = '';
  loading = false;
  public base_url = 'https://jsonedit.com.br';
  public organization: IOrganization[] = [];
  token: string | null = null;
  readonly isTauri = !!(window as any).__TAURI_INTERNALS__;

  get viewOnce(): boolean {
    return !!this.sendForm?.get('view_once')?.value;
  }

  shared() {
    if (this.id || this.loading || this.link) return;
    if (this.sendForm.invalid) {
      this.sendForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.apiService.shareJson(this.json, {
      name: this.sendForm.get("name").value,
      organization_id: this.sendForm.get("organization_id").value,
      view_once: this.viewOnce,
    }).subscribe({
      next: (resp) => {
        this.link = resp.slug || resp.InsertedID;
        // Visualização única: o autor não "abre" o item (não há o que editar).
        if (!this.viewOnce) this.id = this.link;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(apiErrorMessage(err, 'Não foi possível compartilhar o JSON.'), 'Ok', { duration: 4000 });
      }
    });
  }

  close() {
    this.dialog.close(this.link ? { slug: this.link, viewOnce: this.viewOnce } : null);
  }

  copy() {
    this.clipboard.copy(this.base_url + "/" + this.link);
    this.snackBar.open('Link copiado!', 'OK', { duration: 3000 });
  }

  copyDeepLink() {
    this.clipboard.copy('jsonedit://' + this.link);
    this.snackBar.open('Link do app copiado!', 'OK', { duration: 3000 });
  }

  openInApp() {
    const a = document.createElement('a');
    a.href = 'jsonedit://' + this.link;
    a.click();
  }

  ngOnInit() {
    this.sendForm = this.formBuilder.group({
      name: [null, [Validators.maxLength(200)]],
      organization_id: [null, []],
      view_once: [false, []],
    })
    this.token = this.session.token;
    if (this.token) {
      this.apiService.getOrganization().subscribe({
        next: (resp) => {
          this.organization = resp || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
    }
  }
}
