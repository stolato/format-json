import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ApiService} from "../../services/api.service";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent {
  constructor(
    private dialog: MatDialogRef<SharedComponent>,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
  ) {
    this.json = data.json;
    this.id = data.id;
  }

  public link = null;
  json = '';
  id: '';
  loading = false;
  public base_url = 'https://tiltbr.com.br/json';

  shared() {
    if (!this.id) {
      this.loading = true;
      this.apiService.getIPAddress().subscribe((res: any) => {
        this.apiService.shareJson(this.json, res.ip).subscribe((resp: any) => {
          this.id = resp._id;
          this.link = resp._id;
          this.loading = false;
        });
      });
    }
  }

  close() {
    this.dialog.close(this.id);
  }

  copy (){
    this.clipboard.copy(this.base_url+"/"+this.link);
    this.snackBar.open('Link Copiado!!', 'OK', {
      duration: 3000
    })
  }
}
