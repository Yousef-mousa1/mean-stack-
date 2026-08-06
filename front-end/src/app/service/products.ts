import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IproductsResponse } from '../model/iproduct';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly API_URL = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getAll(categoryId?: string): Observable<IproductsResponse> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('category', categoryId);
    }
    return this.http.get<IproductsResponse>(this.API_URL, { params });
  }
}