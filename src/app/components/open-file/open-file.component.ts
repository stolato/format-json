import {Component, OnInit} from '@angular/core';
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-open-file',
  templateUrl: './open-file.component.html',
  styleUrls: ['./open-file.component.scss']
})

export class OpenFileComponent implements OnInit {
  constructor(
    private bottomSheetRef: MatBottomSheetRef<OpenFileComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
  }

  form: FormGroup | any;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      file: ['', Validators.required],
    })
  }

  async readText(event: any) {
    const file = event.target.files.item(0);
    if (file.type === 'application/json') {
      const text = await file.text();
      this.snackBar.open(`Arquivo ${file.name} aberto`, 'OK', {
        duration: 3000,
      });
      this.bottomSheetRef.dismiss(JSON.parse(text))
    } else {
      this.snackBar.open(`Opss!! O Arquivo ${file.name} não é um json`, 'Fechar', {
        duration: 3000
      });
      this.bottomSheetRef.dismiss();
    }
  }
}
