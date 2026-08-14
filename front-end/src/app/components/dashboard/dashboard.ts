import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService, IProfile } from '../../service/profile';
import { Auth } from '../../service/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  profile = signal<IProfile | null>(null);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // بيانات الفورم بتاع التعديل
  form = {
    name: '',
    email: '',
  };

  constructor(
    private profileService: ProfileService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res.user);
        this.form.name = res.user.name;
        this.form.email = res.user.email;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Load profile error:', err);
        this.errorMessage.set('مقدرناش نجيب بياناتك، جرّب تسجّل دخول تاني');
        this.loading.set(false);
      },
    });
  }

  saveChanges() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.form.name.trim() || !this.form.email.trim()) {
      this.errorMessage.set('الاسم والإيميل مطلوبين');
      return;
    }

    this.saving.set(true);
    this.profileService.updateProfile(this.form).subscribe({
      next: (res) => {
        this.profile.set(res.user);
        this.saving.set(false);
        this.successMessage.set('اتحدثت بياناتك بنجاح');

        // نحدّث الاسم في الهيدر فورًا من غير ما نحتاج نعمل login تاني
        this.auth.updateCurrentUser(res.user);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message || 'حصلت مشكلة في التحديث');
      },
    });
  }

  deleteAccount() {
    if (!confirm('متأكد إنك عايز تمسح حسابك؟ الخطوة دي مش ممكن ترجع فيها.')) {
      return;
    }

    this.profileService.deleteProfile().subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'مقدرناش نمسح الحساب');
      },
    });
  }

  logout() {
    this.auth.logout();
  }
}