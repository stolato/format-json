import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {Observable} from "rxjs";
import { environment } from '../../environments/environment';
import {IUser, IOrganization, IJsonItem, ISettingsResponse, IAuthResponse, IPaginatedResponse} from '../models/api-types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //private baseUrl = 'https://green-gharial-belt.cyclic.app/api/v1';
  //private baseUrl = 'http://localhost:8000';
  // private baseUrl = 'https://ms-format-json.onrender.com';
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  shareJson(json: string, ip: string, name: string, org_id: string, token: any = null): Observable<IJsonItem> {
    let config = {};
    if(token) {
      config = { headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      })};
    }
    return this.http.post<IJsonItem>(`${this.baseUrl}/items`, {
      json: JSON.stringify(json),
      ip: ip,
      name: name,
      organization_id: org_id
    }, config);
  }

  updateJson(id: string, json: string): Observable<IJsonItem> {
    return this.http.put<IJsonItem>(`${this.baseUrl}/items/${id}`, {json: JSON.stringify(json)});
  }

  getJson(id: string): Observable<IJsonItem> {
    return this.http.get<IJsonItem>(`${this.baseUrl}/items/${id}`);
  }

  getIPAddress(): Observable<{ip: string}>
  {
    return this.http.get<{ip: string}>("https://api.ipify.org/?format=json");
  }


  auth(email: string, pass: string): Observable<IAuthResponse>{
    return this.http.post<IAuthResponse>(`${this.baseUrl}/auth`, { email: email, password: pass});
  }

  register(payload: any): Observable<IUser | any> {
    return this.http.post<IUser | any>(`${this.baseUrl}/register`, payload);
  }

  me(token: string): Observable<IUser>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.get<IUser>(`${this.baseUrl}/user/me`, { headers: headers });
  }

  allItems(token: string, page: number = 0, limit: number = 20): Observable<IPaginatedResponse<IJsonItem>>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.get<IPaginatedResponse<IJsonItem>>(`${this.baseUrl}/items?page=${page}&limit=${limit}`, { headers: headers });
  }


  deleteItem(id: string, token: string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.delete(`${this.baseUrl}/items/${id}`, { headers: headers });
  }

  refreshToken(token: string | null, refresh: string | null) : Observable<IAuthResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.post<IAuthResponse>(`${this.baseUrl}/refresh`,{ refresh_token: refresh}, { headers: headers });
  }


  getSettings(token: string): Observable<ISettingsResponse>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.get<ISettingsResponse>(`${this.baseUrl}/user/settings`, { headers: headers });
  }

  getOrganization(token: string | null) : Observable<IOrganization[]>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    })
    return this.http.get<IOrganization[]>(`${this.baseUrl}/organization`, { headers: headers });
  }

  addOrganization(token: string | null, name: string) : Observable<IOrganization>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    })
    return this.http.post<IOrganization>(`${this.baseUrl}/organization`, { name: name},  { headers: headers });
  }

  deleteOrganization(token: string | null, id: string) : Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    })
    return this.http.delete(`${this.baseUrl}/organization/${id}`, { headers: headers });
  }

  addUserToOrganization(token: string | null, org_id: string, email: string) : Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    })
    return this.http.post(`${this.baseUrl}/organization/${org_id}/users`, { email: email},  { headers: headers });
  }

  removeUserToOrganization(token: string | null, org_id: string, userid: string) : Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    })
    return this.http.delete(`${this.baseUrl}/organization/${org_id}/users/${userid}`,  { headers: headers });
  }

  setSettings(token: string, data: object): Observable<ISettingsResponse>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.put<ISettingsResponse>(`${this.baseUrl}/user/settings`, {settings: JSON.stringify(data)},{ headers: headers });
  }
}
