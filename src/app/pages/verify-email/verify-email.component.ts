import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { apiErrorCode, apiErrorMessage } from '../../services/api-errors';

type State = 'loading' | 'success' | 'invalid' | 'error';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
  imports: [MatButton, MatIcon, MatProgressSpinner],
})
export class VerifyEmailComponent implements OnInit {
  state: State = 'loading';
  errorMessage = '';
  resending = false;
  darkMode = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private session: SessionService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  get loggedIn(): boolean {
    return !!this.session.token;
  }

  ngOnInit(): void {
    this.darkMode = this.auth.settings$.value.dark_mode;

    const token = this.route.snapshot.queryParamMap.get('token');
    // Tira o token da URL/histórico (mesma rota: o componente é reaproveitado).
    if (token) this.router.navigate(['/verify-email'], { replaceUrl: true });

    if (!token) {
      this.state = 'invalid';
      return;
    }

    this.api.verifyEmail(token).subscribe({
      next: () => {
        this.state = 'success';
        this.auth.refreshUser();
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.status === 400 && apiErrorCode(err) === 'INVALID_OR_EXPIRED_TOKEN') {
          this.state = 'invalid';
        } else {
          this.state = 'error';
          this.errorMessage = apiErrorMessage(err, 'Não foi possível confirmar seu e-mail.');
        }
        this.cdr.detectChanges();
      },
    });
  }

  resend() {
    if (this.resending) return;
    this.resending = true;
    this.api.resendVerifyEmail().subscribe({
      next: () => {
        this.resending = false;
        this.snackBar.open('Enviamos um novo link de confirmação para o seu e-mail.', 'Ok', { duration: 5000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.resending = false;
        if (apiErrorCode(err) === 'ALREADY_VERIFIED') {
          this.state = 'success';
          this.auth.refreshUser();
        } else {
          this.snackBar.open(apiErrorMessage(err, 'Não foi possível reenviar o e-mail.'), 'Ok', { duration: 5000 });
        }
        this.cdr.detectChanges();
      },
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
