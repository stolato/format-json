import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-login',
  templateUrl: './dialog-login.component.html',
  styleUrls: ['./dialog-login.component.scss']
})
export class DialogLoginComponent {
  form: FormGroup | any;
  loading: boolean = false;

  constructor(
    private dialog: MatDialogRef<DialogLoginComponent>,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.required, Validators.min(6)]],
    })
  }

  getMe(token: string){
    this.api.me(token).subscribe({
      next: (resp) => {
        localStorage.setItem("name", resp.name);
        this.dialog.close({ name: resp.name });
      }
    })
  }

  login(){
    if(this.form.valid){
      this.loading = true;
      this.api.auth(this.form.get("email").value, this.form.get("password").value).subscribe({
        next: (resp: any) => {
          localStorage.setItem("key", resp.token);
          localStorage.setItem("refresh", resp.refresh_token);
          this.getMe(resp.token);
          this.snackBar.open("Logado com sucesso!", "OK", {
            duration: 3000,
          })
        },
        error: () => {
          this.snackBar.open("ops, nao foi possivel efetuar seu login, valide os dados", "Ok");
          this.form.get("password").setValue(null);
          this.loading = false;
        }
      })
    }else{
      this.snackBar.open("Preencha todos os dados corretamente", "Ok");
    }
  }
}
