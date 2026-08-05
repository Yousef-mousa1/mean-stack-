import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponsService } from '../../service/coupons';
import { IapplyCouponResponse } from '../../model/icoupon';

@Component({
  selector: 'app-apply-coupon',
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-coupon.html',
  styleUrl: './apply-coupon.css',
})
export class ApplyCoupon {
  code = '';
  loading = signal(false);
  errorMessage = signal('');
  result = signal<IapplyCouponResponse | null>(null);

  // بيبعت النتيجة لصفحة السلة عشان تحدّث الإجمالي المعروض
  @Output() applied = new EventEmitter<IapplyCouponResponse>();

  constructor(private couponsService: CouponsService) {}

  applyCoupon() {
    if (!this.code.trim()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.couponsService.apply(this.code.trim()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.applied.emit(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'الكوبون مش صالح');
        this.result.set(null);
        this.loading.set(false);
      },
    });
  }
}