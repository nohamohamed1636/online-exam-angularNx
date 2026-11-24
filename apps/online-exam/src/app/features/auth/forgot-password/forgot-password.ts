import {Component,inject,signal,OnInit} from '@angular/core';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import { Router,RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Location } from '@angular/common';
import { PasswordService } from '../../../core/services/password';




@Component({
  imports: [ReactiveFormsModule,
    RouterLink],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.css',
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
private readonly fb = inject(FormBuilder);
private readonly passwordService = inject(PasswordService);
private readonly router = inject(Router);
private readonly location = inject(Location)


readonly submitted = signal(false);
readonly isLoading = signal(false);
readonly errorMessage = signal<string | null>(null);

   // Reactive Form
  readonly forgotPasswordForm =
    this.fb.nonNullable.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]

    });

    // Email Getter
  get email() {
    return this.forgotPasswordForm.controls.email;
  }

  // Email Validation
  get emailError(): string | null {

    if (!this.submitted() && !this.email.touched) {
      return null;
    }

    if (this.email.hasError('required')) {
      return 'Email is required.';
    }

    if (this.email.hasError('email')) {
      return 'Please enter a valid email address.';
    }

    return null;
  }

   // Submit Form
  onSubmit(): void {

    if (this.isLoading()) {
      return;
    }

    this.submitted.set(true);
    this.errorMessage.set(null);

    this.forgotPasswordForm.markAllAsTouched();

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    const email = this.email.value.trim();

    this.isLoading.set(true);

    this.passwordService
      .forgotPassword(email)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({

        next: (response) => {

          if (response.status === true) {

            void this.router.navigate(
              ['/password-reset-sent'],
              {
                state: {
                  email: email
                }
              }
            );

          } else {

            this.errorMessage.set(
              response.message ||
              'Unable to request password reset.'
            );

          }
        },

        error: (error: HttpErrorResponse) => {

          if (error.status === 0) {

            this.errorMessage.set(
              'Unable to connect to the server.'
            );

          } else {

            this.errorMessage.set(
              typeof error.error?.message === 'string'
                ? error.error.message
                : 'Something went wrong. Please try again.'
            );

          }
        }

      });
  }


}

