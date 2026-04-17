import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgxSpinnerService} from "ngx-spinner";
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-add-user-org',
    templateUrl: './dialog-add-user-org.component.html',
    styleUrls: ['./dialog-add-user-org.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDialogActions, MatButton, MatDialogClose]
})
export class DialogAddUserOrgComponent implements OnInit {
  sendForm: FormGroup | any ;
  private id: any;
  constructor(
    private dialog: MatDialogRef<DialogAddUserOrgComponent>,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private loading: NgxSpinnerService,
  ) {
    this.id = data.id;
  }


  close() {
    this.dialog.close();
  }

  ngOnInit(): void {
    this.sendForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  send(){
    if(this.sendForm.valid){
      this.loading.show();
      const token = localStorage.getItem("key") || null;
      this.apiService.addUserToOrganization(token, this.id, this.sendForm.controls['email'].value).subscribe({
        next: (resp) => {
          console.log(resp);
          this.dialog.close(true);
          this.snackBar.open(
            'usuario add com sucesso!',
            'Ok',
            {duration: 3000}
          );
          this.loading.hide();
        },
        error: (err) => {
          console.log(err);
          this.snackBar.open(
            'Ops, erro: ' + err.error.message,
            'Ok',
            {duration: 3000}
          );
          this.loading.hide();
        }
      });
    }
  }
}

