

import {Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';


import { LoginRequest,LoginResponse } from '../models/login-request.model';
import { environment } from '../../../enviroments/enviroments.ts';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

   private readonly apiUrl = environment.apiUrl;

   login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      request
    );
  }

}
