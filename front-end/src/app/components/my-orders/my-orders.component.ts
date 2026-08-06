import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../service/order.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchMyOrders();
  }

  fetchMyOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data: any) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching orders:', err);
        this.errorMessage = 'Failed to load your orders. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}