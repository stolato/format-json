import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //private baseUrl = 'https://green-gharial-belt.cyclic.app/api/v1';
  //private baseUrl = 'http://localhost:8000';
  // private baseUrl = 'https://ms-format-json.onrender.com';
  private baseUrl = 'https://api.jsonedit.com.br';

  constructor(private http: HttpClient) { }

  shareJson(json: string, ip: string, name: string, org_id: string, token: any = null) {
    let config = {};
    if(token) {
      config = { headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      })};
    }
    return this.http.post(`${this.baseUrl}/items`, {
      json: JSON.stringify(json),
      ip: ip,
      name: name,
      organization_id: org_id
    }, config);
  }

  updateJson(id: string, json: string) {
    return this.http.put(`${this.baseUrl}/items/${id}`, {json: JSON.stringify(json)});
  }

  getJson(id: string) {
    return this.http.get(`${this.baseUrl}/items/${id}`);
  }

  getIPAddress()
  {
    return this.http.get("https://api.ipify.org/?format=json");
  }


  auth(email: string, pass: string){
    return this.http.post(`${this.baseUrl}/auth`, { email: email, password: pass});
  }

  register(payload: any) {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  me(token: string): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.get(`${this.baseUrl}/user/me`, { headers: headers });
  }

  allItems(token: string): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.get(`${this.baseUrl}/items`, { headers: headers });
  }

  deleteItem(id: string, token: string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.delete(`${this.baseUrl}/items/${id}`, { headers: headers });
  }

  refreshToken(token: string | null, refresh: string | null) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.post(`${this.baseUrl}/refresh`,{ refresh_token: refresh}, { headers: headers });
  }


  getSettings(token: string): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.get(`${this.baseUrl}/user/settings`, { headers: headers });
  }

  getOrganization(token: string | null) : Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    })
    return this.http.get(`${this.baseUrl}/organization`, { headers: headers });
  }

  addOrganization(token: string | null, name: string) : Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    })
    return this.http.post(`${this.baseUrl}/organization`, { name: name},  { headers: headers });
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

  setSettings(token: string, data: object): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    return this.http.put(`${this.baseUrl}/user/settings`, {settings: JSON.stringify(data)},{ headers: headers });
  }
}
