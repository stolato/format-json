import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-register',
  templateUrl: './dialog-register.component.html',
  styleUrls: ['./dialog-register.component.scss']
})
export class DialogRegisterComponent implements OnInit{
  form: FormGroup | any;

  constructor(
    private dialog: MatDialogRef<DialogRegisterComponent>,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private snackBar: MatSnackBar,
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
      this.api.register(this.form.value).subscribe({
        next: () => {
          this.snackBar.open("Registrado com sucesso!", "OK", {
            duration: 3000,
          })
          this.dialog.close();
        },
        error: () => {
          this.snackBar.open("ops, nao foi possivel efetuar o seu registro", "Ok");
        }
      })
    }else{
      console.log('errr');
    }
  }

}
