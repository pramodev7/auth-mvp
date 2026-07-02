import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    return router.parseUrl('/login');
  }

  if (authService.currentUser()) {
    return true;
  }

  return authService.loadCurrentUser().pipe(
    map(() => true),
    catchError(() => {
      authService.logout();
      return of(router.parseUrl('/login'));
    }),
  );
};
