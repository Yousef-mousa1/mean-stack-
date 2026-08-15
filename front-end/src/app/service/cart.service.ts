import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // to connect to the backend API for cart 
  private apiUrl = environment.apiUrl + '/cart';

  constructor(private http: HttpClient) {}

  /**
   * Helper function to send the user's Token (Authorization)
   * since the routes are protected by protect in the backend
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
   * Add product to cart
   * Matches Backend Endpoint: (depends on cart.controller.js)
   */
  addToCart(productId: string, quantity: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, { productId, quantity }, this.getAuthHeaders());
  }

  /**
   * Get cart contents
   */
  getCart(): Observable<any> {
    return this.http.get<any>(this.apiUrl, this.getAuthHeaders());
  }

  /**
   * Remove product from cart
   * Matches Backend Endpoint:productId
   */
  removeFromCart(productId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${productId}`, this.getAuthHeaders());
  }
}