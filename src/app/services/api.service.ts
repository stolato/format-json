import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';
import {
  IUser,
  IOrganization,
  IJsonItem,
  ISettingsResponse,
  IAuthResponse,
  IPaginatedResponse,
  ICreateItemPayload,
  ICreateItemResponse,
} from '../models/api-types';

/** A API aceita `limit` entre 1 e 100. */
export const MAX_PAGE_LIMIT = 100;

/**
 * O header `Authorization` é adicionado pelo interceptor sempre que houver
 * sessão (inclusive em GET/PUT/POST /items e no reveal).
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ---- Itens -------------------------------------------------------------

  shareJson(json: any, payload: Omit<ICreateItemPayload, 'json'> = {}): Observable<ICreateItemResponse> {
    const body: ICreateItemPayload = { json: JSON.stringify(json), ...payload };
    if (!body.name) delete body.name;
    if (!body.organization_id) delete body.organization_id;
    if (!body.view_once) delete body.view_once;
    if (!body.private) delete body.private;
    return this.http.post<ICreateItemResponse>(`${this.baseUrl}/items`, body);
  }

  updateJson(slug: string, json: any): Observable<IJsonItem> {
    return this.http.put<IJsonItem>(`${this.baseUrl}/items/${encodeURIComponent(slug)}`, { json: JSON.stringify(json) });
  }

  getJson(slug: string): Observable<IJsonItem> {
    return this.http.get<IJsonItem>(`${this.baseUrl}/items/${encodeURIComponent(slug)}`);
  }

  revealJson(slug: string): Observable<IJsonItem> {
    return this.http.post<IJsonItem>(`${this.baseUrl}/items/${encodeURIComponent(slug)}/reveal`, {});
  }

  allItems(page: number = 0, limit: number = 20): Observable<IPaginatedResponse<IJsonItem>> {
    const params = new HttpParams()
      .set('page', Math.max(0, page))
      .set('limit', clampLimit(limit));
    return this.http.get<IPaginatedResponse<IJsonItem>>(`${this.baseUrl}/items`, { params });
  }

  deleteItem(slug: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/${encodeURIComponent(slug)}`);
  }

  // ---- Autenticação ------------------------------------------------------

  auth(email: string, pass: string): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.baseUrl}/auth`, { email: email, password: pass });
  }

  register(payload: { name: string; email: string; password: string }): Observable<IUser | any> {
    return this.http.post<IUser | any>(`${this.baseUrl}/register`, payload);
  }

  logout(refreshToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, { refresh_token: refreshToken });
  }

  logoutAll(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout-all`, {});
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-email`, { token });
  }

  resendVerifyEmail(): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-email/resend`, {});
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, password });
  }

  // ---- Usuário -----------------------------------------------------------

  me(): Observable<IUser> {
    return this.http.get<IUser>(`${this.baseUrl}/user/me`);
  }

  getSettings(): Observable<ISettingsResponse> {
    return this.http.get<ISettingsResponse>(`${this.baseUrl}/user/settings`);
  }

  setSettings(data: object): Observable<ISettingsResponse> {
    return this.http.put<ISettingsResponse>(`${this.baseUrl}/user/settings`, { settings: JSON.stringify(data) });
  }

  // ---- Organizações ------------------------------------------------------

  getOrganization(page: number = 0, limit: number = MAX_PAGE_LIMIT): Observable<IOrganization[]> {
    const params = new HttpParams()
      .set('page', Math.max(0, page))
      .set('limit', clampLimit(limit));
    return this.http.get<IOrganization[]>(`${this.baseUrl}/organization`, { params });
  }

  addOrganization(name: string): Observable<IOrganization> {
    return this.http.post<IOrganization>(`${this.baseUrl}/organization`, { name: name });
  }

  deleteOrganization(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/organization/${id}`);
  }

  addUserToOrganization(org_id: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/organization/${org_id}/users`, { email: email });
  }

  removeUserToOrganization(org_id: string, userid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/organization/${org_id}/users/${userid}`);
  }
}

function clampLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(MAX_PAGE_LIMIT, Math.floor(limit));
}
