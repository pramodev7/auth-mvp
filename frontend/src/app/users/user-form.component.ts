import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { User, UserRole } from '../auth/auth.models';
import { UserPayload } from './user-api.service';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  template: `
    <form class="user-form" [formGroup]="form" (ngSubmit)="submit()">
      <div class="field">
        <label for="user-email">Email</label>
        <input id="user-email" type="email" formControlName="email" />
      </div>

      <div class="field">
        <label for="user-password">Password</label>
        <input id="user-password" type="password" formControlName="password" />
      </div>

      <div class="field">
        <label for="user-role">Role</label>
        <select id="user-role" formControlName="role">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div class="form-actions">
        <button class="primary-button" type="submit" [disabled]="form.invalid">
          {{ user ? 'Save' : 'Create' }}
        </button>
        @if (user) {
          <button class="secondary-button" type="button" (click)="cancel.emit()">Cancel</button>
        }
      </div>
    </form>
  `,
  styles: [
    `
      .user-form {
        display: grid;
        grid-template-columns: minmax(180px, 1fr) minmax(160px, 1fr) 140px auto;
        gap: 12px;
        align-items: end;
      }

      .form-actions {
        display: flex;
        gap: 8px;
      }

      @media (max-width: 760px) {
        .user-form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class UserFormComponent implements OnChanges {
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<UserPayload>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true }),
    role: new FormControl<UserRole>('member', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['user']) {
      return;
    }
    this.form.reset({
      email: this.user?.email ?? '',
      password: '',
      role: this.user?.role ?? 'member',
    });
    this.form.controls.password.setValidators(this.user ? [] : [Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      email: value.email,
      role: value.role,
      ...(value.password ? { password: value.password } : {}),
    });

    if (!this.user) {
      this.form.reset({ email: '', password: '', role: 'member' });
    }
  }
}
