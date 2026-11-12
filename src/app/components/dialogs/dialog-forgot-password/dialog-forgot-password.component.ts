import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ModalComponent } from '../../modal/modal.component';
import { ApiService } from '../../../services/api.service';
import { apiErrorMessage } from '../../../services/api-errors';

@Component({
  selector: 'app-dialog-forgot-password',
  templateUrl: './dialog-forgot-password.component.html',
  styleUrls: ['./dialog-forgot-password.component.scss'],
  imports: [ModalComponent, MatProgressSpinner, ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatButton, MatIcon, MatDialogClose],
})
export class DialogForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  sent = false;

  constructor(
    private dialog: MatDialogRef<DialogForgotPasswordComponent>,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: { email?: string } | null,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: [this.data?.email ?? '', [Validators.email, Validators.required, Validators.maxLength(254)]],
    });
  }

  get email() {
    return this.form.get('email')!;
  }

  switchToLogin() {
    this.dialog.close({ switchTo: 'login', email: this.email.value });
  }

  submit() {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.api.forgotPassword(this.email.value.trim()).subscribe({
      next: () => {
        // Resposta genérica: não revela se o e-mail está cadastrado.
        this.loading = false;
        this.sent = true;
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(apiErrorMessage(err, 'Não foi possível enviar o link de redefinição.'), 'Ok', { duration: 5000 });
      },
    });
  }
}
