import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'Json Formatter';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const isTauri = !!(window as any).__TAURI_INTERNALS__;
    if (isTauri) {
      document.documentElement.classList.add('tauri-app');
      this.initDeepLink();
    }
  }

  private async initDeepLink(): Promise<void> {
    try {
      const { onOpenUrl, getCurrent } = await import('@tauri-apps/plugin-deep-link');

      // Warm start: app already running, receives a new URL
      await onOpenUrl((urls) => this.handleDeepLink(urls));

      // Cold start: wait for Angular's initial navigation to finish before
      // overriding with the deep-link URL, otherwise the initial nav to '/'
      // races and overwrites the deep-link navigate call.
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        take(1)
      ).subscribe(async () => {
        const initial = await getCurrent();
        if (initial?.length) this.handleDeepLink(initial);
      });
    } catch {
      // plugin not available in dev or web
    }
  }

  private handleDeepLink(urls: string[]): void {
    const url = urls[0];
    if (!url) return;
    // jsonedit://abc123  →  navega para /abc123
    const id = url.replace(/^jsonedit:\/\//i, '').replace(/\/$/, '');
    if (id) this.router.navigate([id]);
  }
}
