import { Component, signal } from '@angular/core';
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
  isMenuOpen = signal(false);

  constructor(public auth: Auth) {}

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}