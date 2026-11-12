import { HttpErrorResponse } from '@angular/common/http';

const MESSAGES: Record<string, string> = {
  TOO_MANY_REQUESTS: 'Muitas requisições. Tente novamente em instantes.',
  TRY_AGAIN_LATER: 'Aguarde um minuto antes de tentar novamente.',
  INTERNAL_ERROR: 'Erro interno no servidor. Tente novamente mais tarde.',
  INVALID_BODY: 'Requisição inválida.',
  NOT_FOUND: 'Conteúdo não encontrado ou sem permissão de acesso.',
  PRIVATE_REQUIRES_LOGIN: 'Faça login para criar um JSON privado.',
  VIEW_ONCE_NOT_ALLOWED_FOR_PRIVATE: 'Visualização única não pode ser usada em JSON privado.',
  VIEW_ONCE_IMMUTABLE: 'Este JSON é de visualização única e não pode ser editado.',
  NOT_VIEW_ONCE: 'Este JSON não é de visualização única.',
  SETTINGS_TOO_LARGE: 'Configurações muito grandes para salvar.',
  ALREADY_VERIFIED: 'Seu e-mail já está confirmado.',
  INVALID_OR_EXPIRED_TOKEN: 'Link inválido ou expirado.',
  'email ja cadastrado': 'Este e-mail já está cadastrado.',
  'not possible add this user':
    'Não foi possível adicionar este usuário. Verifique se o e-mail está cadastrado e confirmado.',
  'Invalid email or password': 'E-mail ou senha inválidos.',
};

/** Segundos do header Retry-After, se houver. */
export function retryAfter(err: unknown): number | null {
  if (!(err instanceof HttpErrorResponse)) return null;
  const value = Number(err.headers?.get('Retry-After'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Código/mensagem crua da API (`message` ou `error`). */
export function apiErrorCode(err: unknown): string | null {
  const body = (err as HttpErrorResponse)?.error;
  if (!body) return null;
  if (typeof body === 'string') return body;
  if (typeof body.message === 'string') return body.message;
  if (typeof body.error === 'string') return body.error;
  return null;
}

function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.ceil(seconds / 60);
  return `${min} minuto${min > 1 ? 's' : ''}`;
}

/** Mensagem amigável para um erro da API. */
export function apiErrorMessage(err: unknown, fallback = 'Ops, algo deu errado.'): string {
  const status = (err as HttpErrorResponse)?.status;
  if (status === 0) return 'Não foi possível conectar ao servidor.';
  if (status === 429) {
    const wait = retryAfter(err);
    const code = apiErrorCode(err);
    const base = code && code !== 'TOO_MANY_REQUESTS' && MESSAGES[code] ? MESSAGES[code] : MESSAGES['TOO_MANY_REQUESTS'];
    return wait ? `${base.replace(/\.$/, '')} (aguarde ${formatWait(wait)}).` : base;
  }
  if (status === 500) return MESSAGES['INTERNAL_ERROR'];

  const code = apiErrorCode(err);
  if (code && MESSAGES[code]) return MESSAGES[code];
  if (status === 404) return MESSAGES['NOT_FOUND'];

  const body = (err as HttpErrorResponse)?.error;
  // Erros de validação: lista de campos inválidos
  if (Array.isArray(body) && body.length) {
    const fields = body.map((e: any) => e?.field || e?.Field || e?.tag).filter(Boolean);
    if (fields.length) return `Campos inválidos: ${fields.join(', ')}`;
  }
  return code || fallback;
}
