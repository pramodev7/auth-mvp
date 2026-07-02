import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { UserApiService } from './user-api.service';
import { UsersPageComponent } from './users-page.component';

describe('UsersPageComponent', () => {
  function createFixture(role: 'admin' | 'member'): ComponentFixture<UsersPageComponent> {
    const authStub = {
      currentUser: () => ({ id: 1, email: `${role}@example.com`, role }),
      isAdmin: () => role === 'admin',
      logout: () => undefined,
    };
    const apiStub = {
      list: () => of([{ id: 1, email: 'member@example.com', role: 'member' }]),
      create: () => of({ id: 2, email: 'new@example.com', role: 'member' }),
      update: () => of({ id: 1, email: 'member@example.com', role: 'admin' }),
      delete: () => of(undefined),
    };

    TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authStub },
        { provide: UserApiService, useValue: apiStub },
      ],
    });
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('shows admin write actions', () => {
    const fixture = createFixture('admin');

    expect(fixture.nativeElement.textContent).toContain('Create');
    expect(fixture.nativeElement.textContent).toContain('Edit');
    expect(fixture.nativeElement.textContent).toContain('Delete');
  });

  it('hides write actions for members', () => {
    const fixture = createFixture('member');

    expect(fixture.nativeElement.textContent).not.toContain('Create');
    expect(fixture.nativeElement.textContent).not.toContain('Edit');
    expect(fixture.nativeElement.textContent).not.toContain('Delete');
  });
});
