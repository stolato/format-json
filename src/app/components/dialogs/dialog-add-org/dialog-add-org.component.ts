import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../../../services/api.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-dialog-add-org',
  templateUrl: './dialog-add-org.component.html',
  styleUrls: ['./dialog-add-org.component.scss']
})
export class DialogAddOrgComponent implements OnInit {
  constructor(
    private dialog: MatDialogRef<DialogAddOrgComponent>,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private loading: NgxSpinnerService,
  ) {
  }

  sendForm: FormGroup | any;

  ngOnInit(): void {
    this.sendForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
    })
  }

  send(){
    if(this.sendForm.valid){
      this.loading.show();
      const token = localStorage.getItem("key") || null;
      this.apiService.addOrganization(token, this.sendForm.controls['name'].value).subscribe({
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

