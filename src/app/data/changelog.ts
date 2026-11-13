/**
 * Changelog exibido no modal "Novidades".
 *
 * - A primeira entrada é a versão atual do app (APP_VERSION deriva dela).
 * - Ao lançar uma versão: adicione uma entrada no topo e atualize package.json /
 *   tauri.conf.json com o mesmo número.
 * - Escreva para o usuário: o benefício, não o detalhe técnico.
 */

export type ChangeTag = 'novo' | 'seguranca' | 'design' | 'melhoria' | 'correcao';

export interface ChangeHighlight {
  /** Nome do ícone do Material Icons. */
  icon: string;
  title: string;
  description: string;
  tag: ChangeTag;
}

export interface ChangelogEntry {
  version: string;
  /** ISO yyyy-mm-dd */
  date: string;
  /** Frase curta que resume a versão. */
  summary?: string;
  highlights: ChangeHighlight[];
  /** Correções e ajustes menores, em lista simples. */
  fixes?: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.12.0',
    date: '2026-11-12',
    summary: 'Mais privacidade para os seus JSONs e um visual renovado.',
    highlights: [
      {
        icon: 'lock',
        tag: 'seguranca',
        title: 'Conteúdo criptografado',
        description: 'Seus JSONs agora são guardados criptografados no banco de dados. Só quem tem o link consegue ler.',
      },
      {
        icon: 'local_fire_department',
        tag: 'novo',
        title: 'Link de visualização única',
        description: 'Compartilhe um JSON que se autodestrói depois de ser aberto uma vez. Ideal para tokens e credenciais.',
      },
      {
        icon: 'shuffle',
        tag: 'seguranca',
        title: 'Links imprevisíveis',
        description: 'Cada JSON compartilhado ganha um endereço aleatório, impossível de adivinhar.',
      },
      {
        icon: 'file_download',
        tag: 'novo',
        title: 'Baixar JSON',
        description: 'Salve o conteúdo do editor como arquivo .json com um clique ou com Ctrl + Shift + S.',
      },
      {
        icon: 'palette',
        tag: 'design',
        title: 'Visual renovado',
        description: 'Ajustes de cores, espaçamentos e modais para uma experiência mais limpa e consistente.',
      },
    ],
  },
  {
    version: '1.10.0',
    date: '2026-11-12',
    highlights: [
      {
        icon: 'key',
        tag: 'novo',
        title: 'Recuperação de senha',
        description: 'Esqueceu a senha? Agora dá para redefini-la pelo e-mail.',
      },
      {
        icon: 'search',
        tag: 'melhoria',
        title: 'Busca na árvore',
        description: 'A caixa de busca do modo árvore segue o tema do app.',
      },
    ],
  },
];

export const APP_VERSION = CHANGELOG[0].version;
