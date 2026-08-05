import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IproductsResponse } from '../model/iproduct';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly API_URL = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IproductsResponse> {
    return this.http.get<IproductsResponse>(this.API_URL);
  }
}