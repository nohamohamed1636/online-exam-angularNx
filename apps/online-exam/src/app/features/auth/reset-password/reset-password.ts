import {Component,inject,signal} from '@angular/core';

import {AbstractControl,FormBuilder,ReactiveFormsModule,ValidationErrors,Validators} from '@angular/forms';

import {ActivatedRoute,Router,RouterLink} from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import {PasswordService} from '../../../core/services/password';

import {ResetPasswordRequest, ResetPasswordErrorResponse} from '../../../core/models/reset-password.model';
import {LucideEye,LucideEyeOff} from '@lucide/angular';

@Component({
  imports: [ReactiveFormsModule,
    RouterLink,LucideEye,LucideEyeOff],
  selector: 'app-reset-password',
  styleUrl: './reset-password.css',
  templateUrl: './reset-password.html',
})
export class ResetPassword {

   // Dependency Injection
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly passwordService = inject(PasswordService);

  // Reset Token
  readonly token =
    this.route.snapshot.queryParamMap.get('token');

     // UI State
  readonly submitted = signal(false);
  readonly isLoading = signal(false);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly serverErrors = signal<string[]>([]);

  // Reactive Form
  readonly resetPasswordForm = this.fb.nonNullable.group({

    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/
        )
      ]
    ],

    confirmPassword: [
      '',
      Validators.required
    ]

  }, {
    validators: this.passwordMatchValidator
  });

   // Form Controls
  get newPassword() {
    return this.resetPasswordForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.resetPasswordForm.controls.confirmPassword;
  }

  // Password Matching Validator
  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;

    if (!password || !confirm) {
      return null;
    }

    return password === confirm
      ? null
      : { passwordMismatch: true };
  }


   // New Password Validation
  get newPasswordError(): string | null {

    if (!this.submitted() && !this.newPassword.touched) {
      return null;
    }

    if (this.newPassword.hasError('required')) {
      return 'New password is required.';
    }

    if (this.newPassword.hasError('minlength')) {
      return 'Password must be at least 8 characters.';
    }

    if (this.newPassword.hasError('pattern')) {
      return 'Password must include an uppercase letter, a number and a special character.';
    }

    return null;
  }

  // Confirm Password Validation
  get confirmPasswordError(): string | null {

    if (!this.submitted() && !this.confirmPassword.touched) {
      return null;
    }

    if (this.confirmPassword.hasError('required')) {
      return 'Please confirm your password.';
    }

    if (
      this.resetPasswordForm.hasError('passwordMismatch')
    ) {
      return 'Passwords do not match.';
    }

    return null;
  }

  // Show / Hide Password
  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(value => !value);
  }

  // Submit Form
  onSubmit(): void {

    if (this.isLoading()) {
      return;
    }

    this.submitted.set(true);
    this.errorMessage.set(null);
    this.serverErrors.set([]);

    if (!this.token?.trim()) {

      this.errorMessage.set(
        'Invalid reset link. Please request a new one.'
      );

      return;
    }

    this.resetPasswordForm.markAllAsTouched();

    if (this.resetPasswordForm.invalid) {
      return;
    }

    const body: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.newPassword.value,
      confirmPassword: this.confirmPassword.value
    };

    this.isLoading.set(true);

    this.passwordService
      .resetPassword(body)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({

        next: () => {

          this.resetPasswordForm.reset();

          void this.router.navigate(
            ['/login'],
            { replaceUrl: true }
          );

        },

        error: (error: HttpErrorResponse) => {

          const response =
            error.error as ResetPasswordErrorResponse | null;

          if (error.status === 0) {

            this.errorMessage.set(
              'Unable to connect to the server.'
            );

            return;
          }

          this.errorMessage.set(
            response?.message ||
            'Unable to reset password. Please try again.'
          );

          if (Array.isArray(response?.errors)) {

            this.serverErrors.set(
              response.errors.flatMap(item =>
                item.messages ??
                (item.message ? [item.message] : [])
              )
            );

          }

        }

      });
  }


}
