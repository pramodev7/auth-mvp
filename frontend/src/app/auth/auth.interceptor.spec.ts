import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from './token-storage.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    TestBed.inject(TokenStorageService).setToken('stored-token');
    httpClient = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.inject(TokenStorageService).clear();
  });

  it('attaches bearer token to API requests', () => {
    httpClient.get('/users').subscribe();

    const request = http.expectOne('/users');
    expect(request.request.headers.get('Authorization')).toBe('Bearer stored-token');
    request.flush([]);
  });
});
