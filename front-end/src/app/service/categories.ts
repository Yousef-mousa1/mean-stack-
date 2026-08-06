import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IcategoriesResponse } from '../model/icategory';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly API_URL = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IcategoriesResponse> {
    return this.http.get<IcategoriesResponse>(this.API_URL);
  }
}