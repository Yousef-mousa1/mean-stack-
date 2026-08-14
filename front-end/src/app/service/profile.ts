import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface IProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/users/profile';

  getProfile() {
    return this.http.get<{ success: boolean; user: IProfile }>(this.baseUrl);
  }

  updateProfile(data: { name?: string; email?: string }) {
    return this.http.put<{ success: boolean; message: string; user: IProfile }>(
      this.baseUrl,
      data
    );
  }

  deleteProfile() {
    return this.http.delete<{ success: boolean; message: string }>(this.baseUrl);
  }
}