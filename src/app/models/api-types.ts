export interface IUser {
  id: string;
  name: string;
  email: string;
  email_verified?: boolean;
  created_at?: string;
}

export interface ISettings {
  dark_mode: boolean;
  preview: boolean;
}

export interface ISettingsResponse {
  settings: string;
}

export interface IAuthResponse {
  token: string;
  refresh_token: string;
  user?: IUser;
  name?: string;
}

export interface IOrganization {
  id: string;
  name: string;
  created_at?: string;
}

export interface IJsonItem {
  id: string;
  slug?: string;
  json: string;
  private?: boolean;
  view_once?: boolean;
  ip?: string;
  name?: string;
  organization_id?: string;
  views?: number;
  createdAt?: string;
  updateAt?: string;
}

export interface IPaginatedResponse<T> {
  total_items: number;
  page: number;
  limit: number;
  data: T[];
}

export interface ICreateItemResponse {
  InsertedID: string;
  slug: string;
}

export interface ICreateItemPayload {
  json: string;
  name?: string | null;
  organization_id?: string | null;
  private?: boolean;
  view_once?: boolean;
}

/** Identificador usado em links/rotas: slug (novo) ou _id (itens antigos). */
export function itemKey(item: Pick<IJsonItem, 'id' | 'slug'>): string {
  return item.slug || item.id;
}
