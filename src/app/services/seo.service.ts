import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

const SITE_URL = 'https://jsonedit.com.br';
const DEFAULT_TITLE = 'JSONEdit — Formatador, Validador e Editor de JSON Online Grátis';

interface PageSeo {
  title: string;
  /** Se false, a página recebe noindex (conteúdo privado, tokens ou erro). */
  index: boolean;
  canonical: string;
}

/**
 * Ajusta title, robots e canonical a cada navegação.
 * As meta tags de descrição/OG ficam estáticas no index.html (crawlers sociais não executam JS).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.apply(this.resolve(e.urlAfterRedirects)));
  }

  private resolve(url: string): PageSeo {
    const path = url.split(/[?#]/)[0].replace(/\/+$/, '');
    switch (path) {
      case '':
        return { title: DEFAULT_TITLE, index: true, canonical: `${SITE_URL}/` };
      case '/verify-email':
        return { title: 'Verificar e-mail — JSONEdit', index: false, canonical: `${SITE_URL}/` };
      case '/reset-password':
        return { title: 'Redefinir senha — JSONEdit', index: false, canonical: `${SITE_URL}/` };
      case '/404':
        return { title: 'Página não encontrada — JSONEdit', index: false, canonical: `${SITE_URL}/` };
      default:
        // /:id → JSON compartilhado por usuário: não indexar.
        return { title: 'JSON compartilhado — JSONEdit', index: false, canonical: `${SITE_URL}${path}` };
    }
  }

  private apply(page: PageSeo): void {
    this.title.setTitle(page.title);
    this.meta.updateTag({
      name: 'robots',
      content: page.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
    });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:url', content: page.canonical });

    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = page.canonical;
  }
}
