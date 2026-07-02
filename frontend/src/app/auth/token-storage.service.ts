import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private memoryToken: string | null = null;

  getToken(): string | null {
    return this.storage()?.getItem(TOKEN_KEY) ?? this.memoryToken;
  }

  setToken(token: string): void {
    const storage = this.storage();
    if (storage) {
      storage.setItem(TOKEN_KEY, token);
      return;
    }
    this.memoryToken = token;
  }

  clear(): void {
    this.storage()?.removeItem(TOKEN_KEY);
    this.memoryToken = null;
  }

  private storage(): Storage | null {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
