import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;
  private refreshTokenTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.accountSubject = new BehaviorSubject<Account | null>(null);
    this.account = this.accountSubject.asObservable();
  }

  public get accountValue(): Account | null {
    return this.accountSubject.value;
  }

  // Login method
  login(email: string, password: string): Observable<Account> {
    return this.http.post<Account>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
      .pipe(map((account: Account) => {
        this.accountSubject.next(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  // Logout method
  logout(): void {
    this.http.post<void>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe();
    this.stopRefreshTokenTimer();
    this.accountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  // Refresh token method
  refreshToken(): Observable<Account> {
    return this.http.post<Account>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(map((account: Account) => {
        this.accountSubject.next(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  // Register method
  register(account: Account): Observable<object> {
    return this.http.post(`${baseUrl}/register`, account);
  }

  // Verify email method
  verifyEmail(token: string): Observable<object> {
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  // Forgot password method
  forgotPassword(email: string): Observable<object> {
    return this.http.post(`${baseUrl}/forgot-password`, { email });
  }

  // Validate reset token method
  validateResetToken(token: string): Observable<object> {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token });
  }

  // Reset password method
  resetPassword(token: string, password: string, confirmPassword: string): Observable<object> {
    return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
  }

  // Get all accounts method
  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(baseUrl);
  }

  // Get account by ID method
  getById(id: string): Observable<object> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  // Update account method
  update(id: string, params: Account): Observable<Account> {
    return this.http.put<Account>(`${baseUrl}/${id}`, params)
      .pipe(map((account: Account) => {
        // Update current account if it was updated
        if (account.id === this.accountValue?.id) {
          // Publish updated account to subscribers
          this.accountSubject.next(account);
        }
        return account;
      }));
  }

  // Delete account method
  delete(id: string): Observable<object> {
    return this.http.delete(`${baseUrl}/${id}`)
      .pipe(finalize(() => {
        if (id === this.accountValue?.id) {
          this.logout();
        }
      }));
  }

  // Helper methods
  private startRefreshTokenTimer(): void {
    const jwtBase64 = this.accountValue?.jwtToken?.split('.')[1];
    if (!jwtBase64) return;
    const jwtToken = JSON.parse(atob(jwtBase64)) as { exp: number };
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimer = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer(): void {
    clearTimeout(this.refreshTokenTimer);
  }
}