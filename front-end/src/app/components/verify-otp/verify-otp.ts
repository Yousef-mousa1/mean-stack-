import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../service/auth';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp {
  otpForm: FormGroup;
  userId = '';
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    // الـ userId جاي كـ route param من الرابط /verify-otp/:userId
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
  }

  verify() {
    if (!this.userId) {
      this.errorMessage = 'حصل خطأ، ارجع سجّل تاني';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth
      .verifyOTP({ userId: this.userId, otp: this.otpForm.value.otp })
      .subscribe({
        next: () => {
          this.loading = false;
          alert('تم تأكيد الإيميل بنجاح، سجّل دخولك دلوقتي');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'الكود غلط أو منتهي، جرب تاني';
          console.error(err);
        },
      });
  }
}