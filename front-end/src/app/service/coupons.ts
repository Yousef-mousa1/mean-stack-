import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Icoupon, IcouponsResponse, IapplyCouponResponse } from '../model/icoupon';

@Injectable({
  providedIn: 'root',
})
export class CouponsService {
  private readonly API_URL = 'http://localhost:3000/api/coupons';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IcouponsResponse> {
    return this.http.get<IcouponsResponse>(this.API_URL);
  }

  create(coupon: Partial<Icoupon>): Observable<{ message: string; coupon: Icoupon }> {
    return this.http.post<{ message: string; coupon: Icoupon }>(this.API_URL, coupon);
  }

  delete(couponId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${couponId}`);
  }

  apply(code: string): Observable<IapplyCouponResponse> {
    return this.http.post<IapplyCouponResponse>(`${this.API_URL}/apply`, { code });
  }
}