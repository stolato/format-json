export interface IUser {
  id: string;
  name: string;
  email: string;
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
  json: string;
  ip?: string;
  name?: string;
  organization_id?: string;
}
