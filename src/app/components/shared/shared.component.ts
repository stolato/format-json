import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent{
  constructor(private dialog: MatDialogRef<SharedComponent>, private apiService: ApiService, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.json = data.json;
    this.id = data.id;
  }

  public link = null;
  json = '';
  id: '';

  shared() {
    if(!this.id) {
      this.apiService.getIPAddress().subscribe((res: any) => {
        this.apiService.shareJson(this.json, res.ip).subscribe((resp: any) => {
          this.id = resp._id;
          this.link = resp._id;
        });
      });
    }
  }

  close(){
    this.dialog.close(this.id);
  }
}
