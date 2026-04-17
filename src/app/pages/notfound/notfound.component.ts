import { Component } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import {AnimationOptions, LottieComponent} from "ngx-lottie";

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
    styleUrls: ['./notfound.component.scss'],
    imports: [LottieComponent]
})
export class NotfoundComponent {
  options: AnimationOptions = {
    path: '/assets/Not_Found.json',
  };

  animationCreated(animation: AnimationItem) {
    console.log(animation);
    return true;
  }
}
