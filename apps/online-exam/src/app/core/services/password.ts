
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../enviroments/enviroments.ts';

import { ForgotPasswordRequest, ForgotPasswordResponse} from '../models/forgot-password.model';
import {ResetPasswordRequest,ResetPasswordResponse} from '../models/reset-password.model';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  forgotPassword(
    email: string
  ): Observable<ForgotPasswordResponse> {

    const body: ForgotPasswordRequest = {

      email: email,

      redirectUrl:
        `${environment.appUrl}/reset-password`

    };

    return this.http.post<ForgotPasswordResponse>(
      `${this.apiUrl}/auth/forgot-password`,
      body
    );

  }

  resetPassword(
  body: ResetPasswordRequest
): Observable<ResetPasswordResponse> {

  return this.http.post<ResetPasswordResponse>(
    `${this.apiUrl}/auth/reset-password`,
    body
  );

}
}
