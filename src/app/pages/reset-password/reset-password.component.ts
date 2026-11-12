import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { apiErrorCode, apiErrorMessage } from '../../services/api-errors';

type State = 'form' | 'success' | 'invalid';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../verify-email/verify-email.component.scss', './reset-password.component.scss'],
  imports: [ReactiveFormsModule, MatButton, MatIconButton, MatIcon, MatFormField, MatLabel, MatError, MatHint, MatSuffix, MatInput, MatProgressSpinner],
})
export class ResetPasswordComponent implements OnInit {
  state: State = 'form';
  loading = false;
  showPassword = false;
  darkMode = false;
  form!: FormGroup;
  private token: string | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.darkMode = this.auth.settings$.value.dark_mode;

    this.form = this.formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
        confirm: ['', [Validators.required]],
      },
      { validators: passwordsMatch },
    );

    this.token = this.route.snapshot.queryParamMap.get('token');
    // Tira o token da URL/histórico (mesma rota: o componente é reaproveitado).
    if (this.token) this.router.navigate(['/reset-password'], { replaceUrl: true });
    else this.state = 'invalid';
  }

  submit() {
    if (this.loading || !this.token) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.api.resetPassword(this.token, this.form.get('password')!.value).subscribe({
      next: () => {
        this.loading = false;
        this.token = null; // o link é de uso único
        this.state = 'success';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 400 && apiErrorCode(err) === 'INVALID_OR_EXPIRED_TOKEN') {
          this.state = 'invalid';
        } else {
          this.snackBar.open(apiErrorMessage(err, 'Não foi possível redefinir sua senha.'), 'Ok', { duration: 5000 });
        }
        this.cdr.detectChanges();
      },
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
