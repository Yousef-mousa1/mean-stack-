import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface AuthUser {
  name?: string;
  email: string;
  role: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private baseUrl = 'http://localhost:3000/api/auth';

  // بنجيب اليوزر المخزّن (لو موجود) وقت ما الـ service يتعمله instantiate أول مرة
  // كده لو عمل refresh للصفحة، حالة تسجيل الدخول متتفقدش
  currentUser = signal<AuthUser | null>(this.readUserFromStorage());

  isLoggedIn = computed(() => this.currentUser() !== null);

  login(data: { email: string; password: string }) {
    return this.http.post(this.baseUrl + '/login', data);
  }

  register(data: any) {
    return this.http.post(this.baseUrl + '/register', data);
  }

  verifyOTP(data: any) {
    return this.http.post(this.baseUrl + '/verify-otp', data);
  }

  forgetPassword(data: any) {
    return this.http.post(this.baseUrl + '/forget-password', data);
  }

  resetPassword(data: any) {
    return this.http.post(this.baseUrl + '/reset-password', data);
  }

  // بيتنادى بعد نجاح login أو register عشان يخزّن التوكن واليوزر
  // ويحدّث حالة تسجيل الدخول في كل مكان (زي الهيدر) فورًا
  setSession(token: string, user: AuthUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  // بيتنادى بعد ما اليوزر يعدّل بياناته من صفحة البروفايل، عشان الاسم يتحدث
  // في الهيدر وأي مكان تاني فورًا من غير ما يحتاج يعمل login تاني
  updateCurrentUser(user: AuthUser) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private readUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}