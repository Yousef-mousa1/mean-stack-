import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponsService } from '../../service/coupons';
import { Icoupon } from '../../model/icoupon';
import { AdminNav } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNav],
  templateUrl: './admin-coupons.html',
  styleUrl: './admin-coupons.css',
})
export class AdminCoupons implements OnInit {

  coupons: Icoupon[] = [];
  isLoading: boolean = false;

  isModalOpen: boolean = false;
  formData: any = {};

  constructor(
    private couponsService: CouponsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.isLoading = true;

    this.couponsService.getAll().subscribe({
      next: (res) => {
        this.coupons = res?.coupons || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading coupons:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openAddModal(): void {
    this.formData = {
      code: '',
      discountType: 'percentage',
      discountValue: null,
      minCartValue: 0,
      expiryDate: '',
      usageLimit: null,
      isActive: true,
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formData = {};
  }

  saveCoupon(): void {
    if (!this.formData.code || !this.formData.discountValue || !this.formData.expiryDate) {
      alert('Code, discount value, and expiry date are required.');
      return;
    }

    const payload = { ...this.formData };
    payload.code = payload.code.toUpperCase().trim();
    if (!payload.usageLimit) delete payload.usageLimit;

    this.couponsService.create(payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadCoupons();
      },
      error: (err) => {
        console.error('Error creating coupon:', err);
        alert(err?.error?.message || 'Failed to create coupon.');
      },
    });
  }

  deleteCoupon(id: string): void {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    this.couponsService.delete(id).subscribe({
      next: () => {
        this.coupons = this.coupons.filter((c) => c._id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting coupon:', err);
        alert('Failed to delete coupon.');
      },
    });
  }

  isExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }
}