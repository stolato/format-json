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

      // Cold start: if navigation already finished before the import resolved,
      // handle the URL immediately; otherwise wait for the first NavigationEnd.
      if (this.router.navigated) {
        await this.handleColdStart(getCurrent);
      } else {
        this.router.events.pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          take(1)
        ).subscribe(() => this.handleColdStart(getCurrent));
      }
    } catch {
      // plugin not available in dev or web
    }
  }

  private async handleColdStart(getCurrent: () => Promise<string[] | null>): Promise<void> {
    let urls = await getCurrent();
    if (!urls?.length) {
      // Fallback: read args directly from Rust (getCurrent() may return null in dev mode on Linux)
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const url = await invoke<string | null>('get_startup_url');
        if (url) urls = [url];
      } catch {}
    }
    if (urls?.length) this.handleDeepLink(urls);
  }

  private handleDeepLink(urls: string[]): void {
    const url = urls[0];
    if (!url) return;
    // jsonedit://abc123  →  navega para /abc123
    const id = url.replace(/^jsonedit:\/\//i, '').replace(/\/$/, '');
    if (id) this.router.navigate([id]);
  }
}
