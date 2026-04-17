import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog";
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-register',
    templateUrl: './dialog-register.component.html',
    styleUrls: ['./dialog-register.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatProgressSpinner, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDialogActions, MatButton, MatDialogClose]
})
export class DialogRegisterComponent implements OnInit{
  form: FormGroup | any;
  loading: boolean = false;

  constructor(
    private dialog: MatDialogRef<DialogRegisterComponent>,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar
    ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.required, Validators.min(6)]],
    })
  }

  login() {
    if(this.form.valid){
      this.loading = true;
      this.api.register(this.form.value).subscribe({
        next: () => {
          this.snackBar.open("Registrado com sucesso!", "OK", {
            duration: 3000,
          })
          this.dialog.close();
        },
        error: () => {
          this.snackBar.open("ops, nao foi possivel efetuar o seu registro", "Ok");
          this.loading = false;
        }
      })
    }else{
      console.log('errr');
    }
  }

}
