// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginForm } from './components/login-form/login-form';
import { authGuard } from './core/auth/auth.guard';
import { RegisterForm } from './components/register-form/register-form';

export const routes: Routes = [
  { path: 'login', component: LoginForm },
  { path: 'register', component: RegisterForm },
  {
    path: 'todos',
    loadComponent: () =>
      import('./components/todos-display/todos-display').then((m) => m.TodosDisplay),
    canActivate: [authGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
