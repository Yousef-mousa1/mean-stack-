import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // connect to the backend API for orders
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

    /*
   check on token (Authorization)
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  /**
   * (Create Order)
   * check Backend Endpoint: POST /api/orders
   */
  createOrder(orderData: { Address: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData, this.getAuthHeaders());
  }

  /**
   * (Customer Orders)
   * Backend Endpoint: GET /api/orders/my-orders
   */
  getMyOrders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-orders`, this.getAuthHeaders());
  }

  /**
   * (للأدمن فقط - Admin Authorization Check)
   *  Backend Endpoint: GET /api/orders/admin/allorders)
   */
  getAllOrdersForAdmin(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/all`, this.getAuthHeaders());
  }

  /**
   * تحديث حالة الطلب من خلال الأدمن (Pending, Processing, Delivered, Cancelled)
   * Backend Endpoint: PUT /api/orders/admin/:orderId
   */
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/${orderId}`, { status }, this.getAuthHeaders());
  }

  /**
   * delete order by admin
   */
  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/${orderId}`, this.getAuthHeaders());
  }
}