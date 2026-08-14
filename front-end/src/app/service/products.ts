import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Iproduct, IproductsResponse } from '../model/iproduct';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly API_URL = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  // بيقبل الشكلين: categoryId كـ string (زي الاستخدام القديم في صفحة المنتجات)
  // أو object فيه search/category/page/limit (للأدمن)
  getAll(
    categoryOrFilters?:
      | string
      | { search?: string; category?: string; page?: number; limit?: number }
  ): Observable<IproductsResponse> {
    let params = new HttpParams();

    if (typeof categoryOrFilters === 'string') {
      if (categoryOrFilters) {
        params = params.set('category', categoryOrFilters);
      }
    } else if (categoryOrFilters) {
      if (categoryOrFilters.search) {
        params = params.set('search', categoryOrFilters.search);
      }
      if (categoryOrFilters.category) {
        params = params.set('category', categoryOrFilters.category);
      }
      if (categoryOrFilters.page) {
        params = params.set('page', categoryOrFilters.page.toString());
      }
      if (categoryOrFilters.limit) {
        params = params.set('limit', categoryOrFilters.limit.toString());
      }
    }

    return this.http.get<IproductsResponse>(this.API_URL, { params });
  }

  getById(id: string): Observable<{ success: boolean; data: Iproduct }> {
    return this.http.get<{ success: boolean; data: Iproduct }>(
      `${this.API_URL}/${id}`
    );
  }

  create(data: Partial<Iproduct>): Observable<{ success: boolean; data: Iproduct }> {
    return this.http.post<{ success: boolean; data: Iproduct }>(
      this.API_URL,
      data
    );
  }

  update(id: string, data: Partial<Iproduct>): Observable<{ success: boolean; data: Iproduct }> {
    return this.http.put<{ success: boolean; data: Iproduct }>(
      `${this.API_URL}/${id}`,
      data
    );
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/${id}`
    );
  }
}