import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from "@angular/material/dialog";
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dialog-confirm',
    templateUrl: './dialog-confirm.component.html',
    styleUrls: ['./dialog-confirm.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose]
})

export class DialogConfirmComponent {
  public title: string;
  public text: string;

  constructor(private dialogRef: MatDialogRef<DialogConfirmComponent>, @Inject(MAT_DIALOG_DATA) private data: any) {
    this.title = data.title;
    this.text = data.text;
  }

  close(){
    this.dialogRef.close(true);
  }
}
