import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {OpenFileComponent} from "../open-file/open-file.component";
import {MatDialog} from "@angular/material/dialog";
import {SharedComponent} from "../shared/shared.component";
import {ApiService} from "../../services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private bottomSheet: MatBottomSheet, private dialog: MatDialog, private apiService: ApiService, private snackBar: MatSnackBar, private router: Router) {
  }

  private save_preview = localStorage.getItem('preview');
  @Output() json = new EventEmitter<string>();
  @Output() preview = new EventEmitter<boolean>();
  @Input() current_json = '';
  @Input() id = '';

  public isChecked = this.save_preview ? JSON.parse(this.save_preview) : false;

  openUpload() {
    const open = this.bottomSheet.open(OpenFileComponent)
    open.afterDismissed().subscribe((data) => {
      if (data) {
        this.json.emit(data);
      }
    })
  }

  open() {
    window.open('https://github.com/stolato/format-json', '_blank');
  }

  shareJson() {
    this.dialog.open(SharedComponent, {
      width: '550px',
      disableClose: true,
      data: { json: this.current_json, id: this.id },
    }).afterClosed().subscribe((resp) => {
      console.log(resp);
      if(resp){
        this.router.navigate([resp]).then(r => r);
        this.id = resp;
      }
    });
  }

  test() {
    this.preview.emit(this.isChecked);
  }

  saveJson() {
    this.apiService.updateJson(this.id, this.current_json).subscribe(() => {
      this.snackBar.open('json salvo!!', 'Ok', {
        duration: 3000,
      })
    });
  }
}
