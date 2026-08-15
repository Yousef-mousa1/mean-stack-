import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Icategory, IcategoriesResponse, IcategoryResponse } from '../model/icategory';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly API_URL = environment.apiUrl + '/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IcategoriesResponse> {
    return this.http.get<IcategoriesResponse>(this.API_URL);
  }

  create(category: Partial<Icategory>): Observable<IcategoryResponse> {
    return this.http.post<IcategoryResponse>(this.API_URL, category);
  }

  update(categoryId: string, category: Partial<Icategory>): Observable<IcategoryResponse> {
    return this.http.put<IcategoryResponse>(`${this.API_URL}/${categoryId}`, category);
  }

  delete(categoryId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${categoryId}`);
  }
}