import { Component } from '@angular/core';
import {AnimationOptions} from "ngx-lottie";

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})
export class NotfoundComponent {
  options: AnimationOptions = {
    path: './assets/not_found.json',
  };

  animationCreated() {
    return true;
  }
}
