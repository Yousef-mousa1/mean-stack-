import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../service/Orders.service';
import { AdminNav } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNav],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {

  orders: any[] = [];
  filteredOrders: any[] = [];

  isLoading: boolean = false;
  statusFilter: string = '';

  statuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

  constructor(
    private ordersService: OrdersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;

    this.ordersService.getAllOrders().subscribe({
      next: (res: any) => {
        console.log('Orders response:', res.orders);   // ← ضيف السطر ده
        this.orders = res?.orders || [];
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(): void {
    if (!this.statusFilter) {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(
        (o) => o.status === this.statusFilter
      );
    }
  }

  onStatusFilterChange(): void {
    this.applyFilter();
  }

  onChangeStatus(order: any, newStatus: string): void {
    if (order.status === newStatus) return;

    this.ordersService.updateOrderStatus(order._id, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Failed to update order status.');
      },
    });
  }

  onDeleteOrder(orderId: string): void {
    if (!confirm('Are you sure you want to delete this order?')) return;

    this.ordersService.deleteOrder(orderId).subscribe({
      next: (res: any) => {
        console.log('Orders response:', res.orders);   // ← ضيف السطر ده مؤقتًا
        this.orders = res?.orders || [];
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting order:', err);
        alert('Failed to delete order.');
      },
    });
  }
}