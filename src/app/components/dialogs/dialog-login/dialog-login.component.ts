import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {AuthService} from "../../../services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {apiErrorMessage, retryAfter} from "../../../services/api-errors";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogClose } from "@angular/material/dialog";
import { ModalComponent } from '../../modal/modal.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-dialog-login',
    templateUrl: './dialog-login.component.html',
    styleUrls: ['./dialog-login.component.scss'],
    imports: [ModalComponent, MatProgressSpinner, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatError, MatSuffix, MatInput, MatButton, MatIconButton, MatIcon, MatDialogClose]
})
export class DialogLoginComponent {
  form: FormGroup | any;
  loading: boolean = false;
  showPassword = false;

  switchToRegister() {
    this.dialog.close({ switchTo: 'register' });
  }

  forgotPassword() {
    this.dialog.close({ switchTo: 'forgot', email: this.form.get('email').value });
  }

  constructor(
    private dialog: MatDialogRef<DialogLoginComponent>,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: { email?: string } | null,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: [this.data?.email ?? '', [Validators.email, Validators.required, Validators.maxLength(254)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
    })
  }

  getMe(){
    this.api.me().subscribe({
      next: (resp) => {
        localStorage.setItem("name", resp.name);
        this.auth.user$.next(resp);
        this.dialog.close({ name: resp.name });
      },
      error: () => this.dialog.close({}),
    })
  }

  login(){
    if(this.form.valid){
      this.loading = true;
      this.auth.login(this.form.get("email").value, this.form.get("password").value).subscribe({
        next: () => {
          this.getMe();
          this.snackBar.open("Logado com sucesso!", "OK", {
            duration: 3000,
          })
        },
        error: (err) => {
          let msg: string;
          if (err?.status === 401) {
            msg = "E-mail ou senha inválidos.";
          } else if (err?.status === 429) {
            const wait = retryAfter(err);
            const min = wait ? Math.ceil(wait / 60) : null;
            msg = "Muitas tentativas de login. " + (min ? `Tente novamente em ${min} minuto${min > 1 ? 's' : ''}.` : "Tente novamente em alguns minutos.");
          } else {
            msg = apiErrorMessage(err, "Ops, não foi possível efetuar seu login.");
          }
          this.snackBar.open(msg, "Ok", { duration: 5000 });
          this.form.get("password").setValue(null);
          this.loading = false;
        }
      })
    }else{
      this.form.markAllAsTouched();
    }
  }
}
