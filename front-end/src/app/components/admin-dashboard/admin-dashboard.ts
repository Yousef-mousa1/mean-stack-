import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../service/user';
import { OrdersService } from '../../service/Orders.service';
import { AdminNav } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNav],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  users: any[] = [];

  isEditModalOpen: boolean = false;
  selectedUser: any = {};

  // Orders modal state
  isOrdersModalOpen: boolean = false;
  selectedUserOrders: any[] = [];
  selectedUserName: string = '';
  isLoadingOrders: boolean = false;

  constructor(
    private userService: User,
    private ordersService: OrdersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        if (res && res.users) {
          this.users = res.users;
        } else if (Array.isArray(res)) {
          this.users = res;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Fetch error:', err);
      },
    });
  }

  // Delete User Function
  onDeleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(user => user._id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  // Open Edit Modal
  onUpdateUser(user: any): void {
    this.selectedUser = { ...user };
    this.isEditModalOpen = true;
  }

  // Close Edit Modal
  closeModal(): void {
    this.isEditModalOpen = false;
    this.selectedUser = {};
  }

  // Save Edit Changes
  saveUserChanges(): void {
    if (!this.selectedUser._id) return;

    this.userService.updateUser(this.selectedUser._id, this.selectedUser).subscribe({
      next: (res: any) => {
        const index = this.users.findIndex(u => u._id === this.selectedUser._id);
        if (index !== -1) {
          this.users[index] = { ...this.selectedUser };
        }

        this.closeModal();
        this.cdr.detectChanges();
        alert('User updated successfully!');
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('Failed to update user.');
      }
    });
  }

  // Open Orders Modal
  onViewOrders(user: any): void {
    this.selectedUserName = user.name;
    this.isOrdersModalOpen = true;
    this.isLoadingOrders = true;
    this.selectedUserOrders = [];

    this.ordersService.getOrdersByUserId(user._id).subscribe({
      next: (res: any) => {
        this.selectedUserOrders = res?.orders || [];
        this.isLoadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.isLoadingOrders = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeOrdersModal(): void {
    this.isOrdersModalOpen = false;
    this.selectedUserOrders = [];
    this.selectedUserName = '';
  }
}