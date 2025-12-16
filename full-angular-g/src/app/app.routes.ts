// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginForm } from './components/login-form/login-form';

export const routes: Routes = [
  { path: 'login', component: LoginForm },
  { path: 'todos', loadComponent: () => import('./components/todos-display/todos-display').then(m => m.TodosDisplay) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
