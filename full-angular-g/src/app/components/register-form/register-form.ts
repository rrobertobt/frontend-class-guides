import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css',
})
export class RegisterForm {
  name = '';
  email = '';
  password = '';

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    const name = this.name.trim();
    const email = this.email.trim();
    const password = this.password;

    if (!name || !email || !password) {
      this.error.set('Completa todos los campos');
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    try {
      await this.auth.register(email, name, password);
      await this.router.navigateByUrl('/todos');
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'Error registrando usuario');
    } finally {
      this.loading.set(false);
    }
  }
}
