import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'Json Formatter';

  ngOnInit(): void {
    const isTauri = !!(window as any).__TAURI_INTERNALS__;
    if (isTauri) {
      document.documentElement.classList.add('tauri-app');
    }
  }
}