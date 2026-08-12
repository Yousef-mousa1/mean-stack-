import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../service/user';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  users: any[] = [];

  isEditModalOpen: boolean = false;
  selectedUser: any = {};

  constructor(
    private userService: User,
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
}