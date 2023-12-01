import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
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
