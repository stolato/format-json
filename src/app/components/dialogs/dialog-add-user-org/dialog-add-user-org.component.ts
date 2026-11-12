import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogClose } from "@angular/material/dialog";
import { ModalComponent } from '../../modal/modal.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {apiErrorMessage} from "../../../services/api-errors";
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-add-user-org',
    templateUrl: './dialog-add-user-org.component.html',
    styleUrls: ['./dialog-add-user-org.component.scss'],
    imports: [ModalComponent, MatProgressSpinner, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatButton, MatDialogClose]
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
  ) {
    this.id = data.id;
  }


  close() {
    this.dialog.close();
  }

  ngOnInit(): void {
    this.sendForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    })
  }

  sending = false;

  send(){
    if (this.sending) return;
    if (!this.sendForm.valid) {
      this.sendForm.markAllAsTouched();
      return;
    }
    this.sending = true;
    this.apiService.addUserToOrganization(this.id, this.sendForm.controls['email'].value).subscribe({
      next: () => {
        this.dialog.close(true);
        this.snackBar.open(
          'Membro adicionado à organização!',
          'Ok',
          {duration: 3000}
        );
        this.sending = false;
      },
      error: (err) => {
        this.snackBar.open(
          apiErrorMessage(err, 'Não foi possível adicionar o usuário.'),
          'Ok',
          {duration: 5000}
        );
        this.sending = false;
      }
    });
  }
}

