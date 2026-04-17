import {Component, Inject, OnInit, ChangeDetectorRef} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from "@angular/material/dialog";
import {ApiService} from "../../../services/api.service";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-shared',
    templateUrl: './shared.component.html',
    styleUrls: ['./shared.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatProgressSpinner, MatIcon, MatSuffix, MatDialogActions, MatButton]
})
export class SharedComponent implements OnInit {
  constructor(
    private dialog: MatDialogRef<SharedComponent>,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.json = data.json;
    this.id = data.id;
  }

  sendForm: FormGroup | any;

  public link = null;
  json = '';
  id: '';
  loading = false;
  public base_url = 'https://jsonedit.com.br';
  public organization: any[] = [];
  token: string | any;

  shared() {
    if (!this.id) {
      const token = localStorage.getItem("key") || null;
      this.loading = true;
      //this.apiService.getIPAddress().subscribe((res: any) => {

      this.apiService.shareJson(
        this.json,
        '127.0.0.1',
        this.sendForm.get("name").value,
        this.sendForm.get("organization_id").value,
        token
      ).subscribe({
        next: (resp: any) => {
          this.id = resp.InsertedID;
          this.link = resp.InsertedID;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.cdr.detectChanges();
          console.error(err);
        }
      });

      //});
    }
  }

  close() {
    this.dialog.close(this.id);
  }

  copy() {
    this.clipboard.copy(this.base_url + "/" + this.link);
    this.snackBar.open('Link Copiado!!', 'OK', {
      duration: 3000
    })
  }

  ngOnInit() {
    this.sendForm = this.formBuilder.group({
      name: [null, []],
      organization_id: [null, []],
    })
    this.token = localStorage.getItem("key")
    if (this.token) {
      setTimeout(() => {
        this.apiService.getOrganization(this.token).subscribe({
          next: (resp: any) => {
            this.organization = resp;
            this.cdr.detectChanges();
            console.log(resp);
          },
          error: (err) => {
            console.log(err);
          }
        })
      }, 100);
    }
  }
}
