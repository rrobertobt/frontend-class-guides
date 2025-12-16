import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si ya hay usuario en memoria/localStorage, deja pasar (rápido)
  if (auth.isLoggedIn()) return true;

  // Si no hay, intentamos validar sesión con el backend (/me)
  try {
    await auth.refreshMe();
    return true;
  } catch {
    // No hay sesión válida
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
};