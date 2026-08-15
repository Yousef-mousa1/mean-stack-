import { environment } from '../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Iorder } from '../model/iorder';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/orders';

  // بيرجّع كل أوردرات اليوزر الحالي (محمي بالتوكن، الباك اند بياخد الـ userId من التوكن نفسه)
  getMyOrders() {
    return this.http.get<{ orders: Iorder[] }>(`${this.baseUrl}/my-orders`);
  }

  // بيعمل أوردر من السلة الحالية (checkout)
  createOrder(address: string, couponCode?: string) {
    const body: any = { Address: address };
    if (couponCode) body.couponCode = couponCode;
    return this.http.post<{ message: string; order: Iorder }>(this.baseUrl, body);
  }

  // بيلغي أوردر بتاع الكستمر نفسه (بشرط يكون لسه Pending)
  cancelOrder(orderId: string) {
    return this.http.put<{ message: string; order: Iorder }>(
      `${this.baseUrl}/my-orders/${orderId}/cancel`,
      {}
    );
  }

  // بيرجّع أوردرات يوزر معيّن (Admin only)
  getOrdersByUserId(userId: string) {
    return this.http.get<{ orders: Iorder[] }>(
      `${this.baseUrl}/admin/user/${userId}`
    );
  }

  // بيرجّع كل الأوردرات في النظام (Admin only)
  getAllOrders() {
    return this.http.get<{ orders: Iorder[] }>(`${this.baseUrl}/admin/all`);
  }

  // بيغيّر حالة أوردر معين (Admin only)
  updateOrderStatus(orderId: string, status: string) {
    return this.http.put<{ message: string; order: Iorder }>(
      `${this.baseUrl}/admin/${orderId}`,
      { status }
    );
  }

  // بيمسح أوردر (Admin only)
  deleteOrder(orderId: string) {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/admin/${orderId}`
    );
  }
}