import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {apiErrorMessage} from "../../../services/api-errors";
import { MatDialogRef, MatDialogClose } from "@angular/material/dialog";
import { ModalComponent } from '../../modal/modal.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatError, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-dialog-register',
    templateUrl: './dialog-register.component.html',
    styleUrls: ['./dialog-register.component.scss'],
    imports: [ModalComponent, MatProgressSpinner, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatError, MatHint, MatSuffix, MatInput, MatButton, MatIconButton, MatIcon, MatDialogClose]
})
export class DialogRegisterComponent implements OnInit{
  form: FormGroup | any;
  loading: boolean = false;
  showPassword = false;

  switchToLogin() {
    this.dialog.close({ switchTo: 'login' });
  }

  constructor(
    private dialog: MatDialogRef<DialogRegisterComponent>,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar
    ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.required, Validators.maxLength(254)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
    })
  }

  login() {
    if(this.form.valid){
      this.loading = true;
      this.api.register(this.form.value).subscribe({
        next: () => {
          this.snackBar.open("Cadastro realizado! Enviamos um link para confirmar seu e-mail.", "OK", {
            duration: 6000,
          })
          this.dialog.close();
        },
        error: (err) => {
          this.snackBar.open(apiErrorMessage(err, "Ops, não foi possível efetuar o seu cadastro."), "Ok", { duration: 5000 });
          this.loading = false;
        }
      })
    }else{
      this.form.markAllAsTouched();
    }
  }

}
