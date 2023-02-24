import {Component, EventEmitter, Output} from '@angular/core';
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {OpenFileComponent} from "../open-file/open-file.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private bottomSheet: MatBottomSheet) {
  }

  private save_preview = localStorage.getItem('preview');
  @Output() json = new EventEmitter<string>();
  @Output() preview = new EventEmitter<boolean>();

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

  test() {
    this.preview.emit(this.isChecked);
  }
}
