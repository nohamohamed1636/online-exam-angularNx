import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {SendEmailVerificationRequest,SendEmailVerificationResponse, ConfirmEmailVerificationRequest,ConfirmEmailVerificationResponse} from '../models/email-verification.model';
import { environment } from '../../../enviroments/enviroments.ts';
import {RegisterRequest,RegisterResponse} from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private readonly http = inject(HttpClient);

   private readonly apiUrl = environment.apiUrl;

  sendEmailVerification(
    email: string
  ): Observable<SendEmailVerificationResponse> {

    const body: SendEmailVerificationRequest = {
      email
    };

    return this.http.post<SendEmailVerificationResponse>(
      `${this.apiUrl}/auth/send-email-verification`,
      body
    );
  }


confirmEmailVerification(
  email: string,
  code: string
): Observable<ConfirmEmailVerificationResponse> {

  const body: ConfirmEmailVerificationRequest = {
    email,
    code
  };

  return this.http.post<ConfirmEmailVerificationResponse>(
    `${this.apiUrl}/auth/confirm-email-verification`,
    body
  );
}



register(
  body: RegisterRequest
): Observable<RegisterResponse> {

  return this.http.post<RegisterResponse>(
    `${this.apiUrl}/auth/register`,
    body
  );

}


}
