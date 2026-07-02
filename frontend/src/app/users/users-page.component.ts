import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { User } from '../auth/auth.models';
import { DataTableComponent } from '../shared/data-table.component';
import { UserApiService, UserPayload } from './user-api.service';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'app-users-page',
  imports: [DataTableComponent, UserFormComponent],
  template: `
    <main class="page users-page">
      <header class="topbar">
        <div>
          <h1>Users</h1>
          <p>{{ auth.currentUser()?.email }} · {{ auth.currentUser()?.role }}</p>
        </div>
        <button class="secondary-button" type="button" (click)="logout()">Logout</button>
      </header>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      @if (auth.isAdmin()) {
        <section class="panel form-panel">
          <app-user-form [user]="editingUser()" (save)="save($event)" (cancel)="editingUser.set(null)" />
        </section>
      }

      <section class="panel">
        <app-data-table [columns]="columns" [showActions]="auth.isAdmin()">
          @for (user of users(); track user.id) {
            <tr>
              <td>{{ user.id }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              @if (auth.isAdmin()) {
                <td class="row-actions">
                  <button class="secondary-button" type="button" (click)="editingUser.set(user)">Edit</button>
                  <button class="danger-button" type="button" (click)="remove(user)">Delete</button>
                </td>
              }
            </tr>
          }
        </app-data-table>
      </section>
    </main>
  `,
  styles: [
    `
      .users-page {
        display: grid;
        align-content: start;
        gap: 18px;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
      }

      h1 {
        margin: 0 0 4px;
        font-size: 1.7rem;
        letter-spacing: 0;
      }

      p {
        margin: 0;
        color: #5b667a;
      }

      .form-panel {
        padding: 16px;
      }

      .row-actions {
        display: flex;
        gap: 8px;
      }

      @media (max-width: 640px) {
        .page {
          padding: 18px;
        }

        .topbar {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class UsersPageComponent implements OnInit {
  readonly columns = [
    { key: 'id', label: 'ID' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];
  readonly users = signal<User[]>([]);
  readonly editingUser = signal<User | null>(null);
  readonly error = signal('');

  constructor(
    readonly auth: AuthService,
    private readonly userApi: UserApiService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userApi.list().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.error.set('Could not load users.'),
    });
  }

  save(payload: UserPayload): void {
    const editing = this.editingUser();
    const request = editing ? this.userApi.update(editing.id, payload) : this.userApi.create(payload as Required<UserPayload>);
    request.subscribe({
      next: () => {
        this.editingUser.set(null);
        this.loadUsers();
      },
      error: () => this.error.set('Could not save user.'),
    });
  }

  remove(user: User): void {
    this.userApi.delete(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.error.set('Could not delete user.'),
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
