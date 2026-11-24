import { Component, inject,signal  } from '@angular/core';
import { RouterLink } from '@angular/router';
import {LucideEye, LucideEyeOff,LucideCircleAlert} from '@lucide/angular';
import {FormBuilder,ReactiveFormsModule,Validators,AbstractControl } from '@angular/forms';
import { noWhitespaceValidator }from '../../../shared/validations/no-whitespace.validator.validator';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/services/auth-state';

@Component({
   standalone: true,
  imports: [ RouterLink,
    LucideEye,
    LucideEyeOff,
    LucideCircleAlert,
    RouterLink,
    ReactiveFormsModule,],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
readonly submitted = signal(false);
readonly loginError = signal<string | null>(null);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
 readonly authState = inject(AuthStateService);
readonly isLoading = signal(false);
readonly loginSuccess = signal(false);
  readonly showPassword = signal(false);
readonly loginForm = this.fb.nonNullable.group({
    username: ['', [
      Validators.required,
      Validators.minLength(5),
      noWhitespaceValidator()
    ]],

    password: ['', [
      Validators.required,
      Validators.minLength(8),
      noWhitespaceValidator()
    ]]
  });

   get username() {
    return this.loginForm.controls.username;
  }

  get password() {
    return this.loginForm.controls.password;
  }


  togglePassword(): void {
    this.showPassword.update(value => !value);
  }



onSubmit(): void {
  if (this.isLoading()) {
    return;
  }

  this.submitted.set(true);
  this.loginError.set(null);
  this.loginSuccess.set(false);

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.isLoading.set(true);

  this.authState.startLogin();

  const request = this.loginForm.getRawValue();

  this.authService.login(request)
    .pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    )
    .subscribe({
      next: (response) => {
        this.loginSuccess.set(true);

        // TODO: Handle the actual success response
        // after checking the Swagger response schema.

         this.authState.loginFailed();

        console.log('Login HTTP request completed.');
      },

      error: (error: HttpErrorResponse) => {
         this.authState.loginFailed();

        this.loginError.set(
          this.getErrorMessage(error)
        );
      }
    });
}



  shouldShowError(control: AbstractControl): boolean {
  return control.invalid &&
    (control.touched || this.submitted());
}




private getErrorMessage(error: HttpErrorResponse): string {
  const apiMessage = error.error?.message;

  if (
    typeof apiMessage === 'string' &&
    apiMessage.trim().length > 0
  ) {
    return apiMessage;
  }

  switch (error.status) {
    case 0:
      return 'Unable to connect to the server.';

    case 400:
      return 'Please check your login information.';

    case 401:
      return 'Invalid username or password.';

    case 429:
      return 'Too many login attempts. Please try again later.';

    default:
      return 'Something went wrong. Please try again.';
  }
}



}
