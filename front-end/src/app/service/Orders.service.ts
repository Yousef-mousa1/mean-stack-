import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Iorder } from '../model/iorder';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/orders';

  // بيرجّع كل أوردرات اليوزر الحالي (محمي بالتوكن، الباك اند بياخد الـ userId من التوكن نفسه)
  getMyOrders() {
    return this.http.get<{ orders: Iorder[] }>(`${this.baseUrl}/my-orders`);
  }

  // بيعمل أوردر من السلة الحالية (checkout)
  createOrder(address: string) {
    return this.http.post<{ message: string; order: Iorder }>(this.baseUrl, {
      Address: address,
    });
  }
}