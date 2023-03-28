import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://green-gharial-belt.cyclic.app/api/v1';

  constructor(private http: HttpClient) { }

  shareJson(json: string, ip: string) {
    return this.http.post(`${this.baseUrl}/items`, {
      json: json,
      ip: ip,
    });
  }

  updateJson(id: string, json: string) {
    return this.http.put(`${this.baseUrl}/items/${id}`, {json: json});
  }

  getJson(id: string) {
    return this.http.get(`${this.baseUrl}/items/${id}`);
  }

  getIPAddress()
  {
    return this.http.get("https://api.ipify.org/?format=json");
  }
}
