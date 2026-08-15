import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class User {

  private http = inject(HttpClient);

  private baseUrl = environment.apiUrl + '/users';

  getUsers() {
    return this.http.get(this.baseUrl);
  }

  updateUser(id: string, data: any) {
    return this.http.put(
      this.baseUrl + '/' + id,
      data
    );
  }

  deleteUser(id: string) {
    return this.http.delete(
      this.baseUrl + '/' + id
    );
  }

}