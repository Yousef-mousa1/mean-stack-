import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../service/auth';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.css',
})
export class AdminNav {
  constructor(public auth: Auth) {}

  logout(): void {
    this.auth.logout();
  }
}
