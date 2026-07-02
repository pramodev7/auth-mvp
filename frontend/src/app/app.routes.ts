import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login.component';
import { UsersPageComponent } from './users/users-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'users', component: UsersPageComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: '**', redirectTo: 'users' },
];
