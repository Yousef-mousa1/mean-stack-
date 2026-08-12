import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../service/cart.service';
import { OrdersService } from '../../service/Orders.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  shippingAddress: string = '';

  constructor(
    private orderService: OrdersService,
    private cartService: CartService
  ) {}

  placeOrder(): void {
    if (!this.shippingAddress.trim()) {
      alert('Please enter your shipping address');
      return;
    }

    this.orderService.createOrder(this.shippingAddress).subscribe({
      next: (response: any) => {
        alert('Order placed successfully!');
        this.cartService.getCart();
      },
      error: (err: any) => {
        console.error('Error placing order', err);
        alert('Failed to place order. Please try again.');
      }
    });
  }
}