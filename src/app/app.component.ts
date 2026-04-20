import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

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

      // App já está rodando e recebe um deep link
      await onOpenUrl((urls) => this.handleDeepLink(urls));

      // App foi iniciado diretamente via deep link
      const initial = await getCurrent();
      if (initial?.length) this.handleDeepLink(initial);
    } catch {
      // plugin não disponível em dev ou web
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
