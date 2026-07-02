import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(TokenStorageService).clear();
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('stores JWT after login', () => {
    service.login('admin@example.com', 'admin123').subscribe();

    const request = http.expectOne('http://localhost:8000/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({ access_token: 'abc.jwt', token_type: 'bearer' });

    expect(service.getToken()).toBe('abc.jwt');
    expect(TestBed.inject(TokenStorageService).getToken()).toBe('abc.jwt');
  });

  it('loads current user and clears auth on logout', () => {
    service.loadCurrentUser().subscribe();
    http.expectOne('http://localhost:8000/auth/me').flush({ id: 1, email: 'admin@example.com', role: 'admin' });

    expect(service.currentUser()?.role).toBe('admin');

    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });
});
