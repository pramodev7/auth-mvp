import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User, UserRole } from '../auth/auth.models';

export interface UserPayload {
  email: string;
  password?: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly apiUrl = 'http://localhost:8000/users';

  constructor(private readonly http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  create(payload: Required<UserPayload>): Observable<User> {
    return this.http.post<User>(this.apiUrl, payload);
  }

  update(id: number, payload: UserPayload): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
