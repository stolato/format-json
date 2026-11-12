import {Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogClose } from "@angular/material/dialog";
import { ModalComponent } from '../../modal/modal.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {MatSnackBar} from "@angular/material/snack-bar";
import {apiErrorMessage} from "../../../services/api-errors";
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-add-org',
    templateUrl: './dialog-add-org.component.html',
    styleUrls: ['./dialog-add-org.component.scss'],
    imports: [ModalComponent, MatProgressSpinner, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatError, MatHint, MatInput, MatButton, MatDialogClose]
})
export class DialogAddOrgComponent implements OnInit {
  constructor(
    private dialog: MatDialogRef<DialogAddOrgComponent>,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
  ) {
  }

  sendForm: FormGroup | any;

  ngOnInit(): void {
    this.sendForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
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
    this.apiService.addOrganization(this.sendForm.controls['name'].value).subscribe({
      next: () => {
        this.dialog.close(true);
        this.snackBar.open(
          'Organização criada com sucesso!',
          'Ok',
          {duration: 3000}
        );
        this.sending = false;
      },
      error: (err) => {
        this.snackBar.open(
          apiErrorMessage(err, 'Não foi possível criar a organização.'),
          'Ok',
          {duration: 3000}
        );
        this.sending = false;
      }
    });
  }
}

