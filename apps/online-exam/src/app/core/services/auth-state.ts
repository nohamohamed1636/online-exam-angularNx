
import { Injectable, computed, signal } from '@angular/core';

export type AuthStatus =
  | 'anonymous'
  | 'authenticating'
  | 'authenticated';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly statusSignal =
    signal<AuthStatus>('anonymous');

  readonly status = this.statusSignal.asReadonly();

  readonly isAuthenticated = computed(
    () => this.statusSignal() === 'authenticated'
  );

  readonly isAuthenticating = computed(
    () => this.statusSignal() === 'authenticating'
  );

  startLogin(): void {
    this.statusSignal.set('authenticating');
  }

  loginSucceeded(): void {
    this.statusSignal.set('authenticated');
  }

  loginFailed(): void {
    this.statusSignal.set('anonymous');
  }

  logout(): void {
    this.statusSignal.set('anonymous');
  }
}

