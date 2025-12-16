import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(public auth: AuthService, private router: Router) {}
  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
  protected readonly title = signal('full-angular-g');
}
