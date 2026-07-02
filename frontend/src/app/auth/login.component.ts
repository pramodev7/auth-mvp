import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <main class="login-page">
      <form class="panel login-form" [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <h1>Auth MVP</h1>
          <p>Sign in with an admin or member account.</p>
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
        </div>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button class="primary-button" type="submit" [disabled]="form.invalid || loading()">
          Sign in
        </button>
      </form>
    </main>
  `,
  styles: [
    `
      .login-page {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: 24px;
      }

      .login-form {
        width: min(100%, 390px);
        display: grid;
        gap: 18px;
        padding: 24px;
      }

      h1 {
        margin: 0 0 6px;
        font-size: 1.6rem;
        letter-spacing: 0;
      }

      p {
        margin: 0;
        color: #5b667a;
      }
    `,
  ],
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        this.authService.loadCurrentUser().subscribe({
          next: () => void this.router.navigateByUrl('/users'),
          error: () => {
            this.error.set('Could not load user profile.');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Invalid email or password.');
        this.loading.set(false);
      },
    });
  }
}
