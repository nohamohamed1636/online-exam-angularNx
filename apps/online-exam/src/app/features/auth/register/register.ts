import { Component , inject, signal } from '@angular/core';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {ElementRef,QueryList,ViewChildren,OnDestroy} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import {strongPasswordValidator,passwordMatchValidator} from '../../../core/validations/password.validator';
import { RegistrationService } from '../../../core/services/registration.service';
import { Router } from '@angular/router';
import {RegisterRequest,RegisterErrorResponse} from '../../../core/models/register.model';
import {LucideEye, LucideEyeOff,LucideCircleAlert} from '@lucide/angular';
@Component({
  imports: [ReactiveFormsModule, RouterLink,LucideEye,
    LucideEyeOff,
    LucideCircleAlert,],
  standalone: true,
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register implements  OnDestroy  {
   private readonly fb = inject(FormBuilder);
   private readonly router = inject(Router);
   private readonly registrationService =inject(RegistrationService);

@ViewChildren('otpInput')
otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

readonly otpDigits = signal<string[]>(
  Array(6).fill('')
);
readonly resendSeconds = signal(60);
readonly otpSubmitted = signal(false);

  readonly currentStep = signal(1);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly emailSubmitted = signal(false);
  readonly userInfoSubmitted = signal(false);
  readonly showPassword = signal(false);

readonly showConfirmPassword = signal(false);

readonly passwordSubmitted = signal(false);
readonly serverErrors = signal<string[]>([]);

private timerId: ReturnType<typeof setInterval> | null = null;

 readonly registerForm = this.fb.nonNullable.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],

    otp: ['', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ]],

    firstName: ['', [
      Validators.required,
      Validators.minLength(5)
    ]],

    lastName: ['', [
      Validators.required,
      Validators.minLength(2)
    ]],

    username: ['', [
      Validators.required,
      Validators.minLength(5)
    ]],

    phone: ['', [
       Validators.required,
       Validators.pattern(/^01[0125]\d{8}$/)
    ]],

    password: ['', [
     Validators.required,
     Validators.minLength(8),
     strongPasswordValidator()
     ]],

    confirmPassword: ['', [
      Validators.required
   ]]
  }, {
    validators: passwordMatchValidator()
});

  get email() {
    return this.registerForm.controls.email;
  }

  get otp() {
    return this.registerForm.controls.otp;
  }
  get firstName() {
  return this.registerForm.controls.firstName;
}

get lastName() {
  return this.registerForm.controls.lastName;
}

get username() {
  return this.registerForm.controls.username;
}

get phone() {
  return this.registerForm.controls.phone;
}
get password() {
  return this.registerForm.controls.password;
}

get confirmPassword() {
  return this.registerForm.controls.confirmPassword;
}

  get emailError(): string | null {
  if (!this.email.invalid ||
      (!this.email.touched && !this.emailSubmitted())) {
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



sendEmailOtp(): void {
  this.emailSubmitted.set(true);
  this.errorMessage.set(null);

  // Step 1: Validate email
  if (this.email.invalid) {
    this.email.markAsTouched();
    return;
  }

  if (this.isLoading()) {
    return;
  }

  // Step 2: Start loading
  this.isLoading.set(true);

  // Step 3: Call API
  this.registrationService
    .sendEmailVerification(this.email.value.trim())
    .pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    )
    .subscribe({
      next: (response) => {

        console.log('Send OTP Response:', response);

        if (response.status === true) {

          // Reset previous OTP
          this.otp.reset();
          this.otpDigits.set(Array(6).fill(''));
          this.otpSubmitted.set(false);

          // Move to OTP step
          this.currentStep.set(2);

          // Start 60-second countdown
          this.startResendTimer();

        } else {
          this.errorMessage.set(
            response.message ||
            'Failed to send verification code.'
          );
        }
      },

      error: (error: HttpErrorResponse) => {

        console.error('Send OTP Error:', error);

        this.errorMessage.set(
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'Something went wrong. Please try again.'
        );
      }
    });
}





  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }


  startResendTimer(): void {
  this.stopResendTimer();
  this.resendSeconds.set(60);

  this.timerId = setInterval(() => {
    this.resendSeconds.update(seconds =>
      Math.max(0, seconds - 1)
    );

    if (this.resendSeconds() === 0) {
      this.stopResendTimer();
    }
  }, 1000);
}

private stopResendTimer(): void {
  if (this.timerId !== null) {
    clearInterval(this.timerId);
    this.timerId = null;
  }
}

togglePassword(): void {
  this.showPassword.update(value => !value);
}

toggleConfirmPassword(): void {
  this.showConfirmPassword.update(value => !value);
}
submitUserInfo(): void {
  this.userInfoSubmitted.set(true);

  const controls = [
    this.firstName,
    this.lastName,
    this.username,
    this.phone
  ];

  controls.forEach(control => control.markAsTouched());

  if (controls.some(control => control.invalid)) {
    return;
  }

  // UI navigation only.
  // Final registration will be handled by the backend.
  this.currentStep.set(4);
}


private handleRegistrationError(
  error: HttpErrorResponse
): void {

  const response =
    error.error as RegisterErrorResponse | null;

  if (Array.isArray(response?.errors)) {

    const messages = response.errors.flatMap(item => {

      if (Array.isArray(item.messages)) {
        return item.messages;
      }

      if (typeof item.message === 'string') {
        return [item.message];
      }

      return [];
    });

    this.serverErrors.set(messages);
  }

  this.errorMessage.set(
    typeof response?.message === 'string'
      ? response.message
      : 'Unable to create account. Please try again.'
  );
}


createAccount(): void {

  if (this.isLoading()) {
    return;
  }

  this.passwordSubmitted.set(true);
  this.errorMessage.set(null);
  this.serverErrors.set([]);

  this.registerForm.markAllAsTouched();

  // 1. Validate all registration fields
  if (this.registerForm.invalid) {
    this.errorMessage.set(
      'Please check your registration information.'
    );
    return;
  }

  // 2. Get form values
  const formValue = this.registerForm.getRawValue();

  // 3. Prepare API request
  const body: RegisterRequest = {
    username: formValue.username.trim(),
    email: formValue.email.trim(),
    password: formValue.password,
    confirmPassword: formValue.confirmPassword,
    firstName: formValue.firstName.trim(),
    lastName: formValue.lastName.trim(),
    phone: formValue.phone.trim()
  };

  // 4. Start loading
  this.isLoading.set(true);

  // 5. Call Register API
  this.registrationService
    .register(body)
    .pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    )
    .subscribe({

      next: (response) => {

        if (response.status === true) {

          this.stopResendTimer();

          this.registerForm.reset();
          this.otpDigits.set(Array(6).fill(''));

          // Navigate to Login
          this.router.navigate(['/auth/login']);

        } else {

          this.errorMessage.set(
            response.message ||
            'Registration failed.'
          );

        }

      },

      error: (error: HttpErrorResponse) => {
        this.handleRegistrationError(error);
      }

    });
}


onOtpInput(event: Event, index: number): void {
  const input = event.target as HTMLInputElement;
  const digit = input.value.replace(/\D/g, '').slice(-1);

  input.value = digit;

  this.otpDigits.update(digits => {
    const updated = [...digits];
    updated[index] = digit;
    return updated;
  });

  this.syncOtpControl();

  if (digit && index < 5) {
    this.focusOtp(index + 1);
  }
}

onOtpKeydown(event: KeyboardEvent, index: number): void {
  if (
    event.key === 'Backspace' &&
    !this.otpDigits()[index] &&
    index > 0
  ) {
    this.focusOtp(index - 1);
  }
}

onOtpPaste(event: ClipboardEvent): void {
  event.preventDefault();

  const pasted = event.clipboardData
    ?.getData('text')
    .replace(/\D/g, '')
    .slice(0, 6) ?? '';

  const digits = Array.from(
    { length: 6 },
    (_, i) => pasted[i] ?? ''
  );

  this.otpDigits.set(digits);
  this.syncOtpControl();

  this.focusOtp(Math.min(pasted.length, 5));
}

private syncOtpControl(): void {
  this.otp.setValue(this.otpDigits().join(''));
}

private focusOtp(index: number): void {
  this.otpInputs.get(index)?.nativeElement.focus();
}


verifyOtp(): void {
  this.otpSubmitted.set(true);
  this.errorMessage.set(null);

  // 1. Validate OTP
  if (this.otp.invalid) {
    this.otp.markAsTouched();
    return;
  }

  // 2. Prevent duplicate requests
  if (this.isLoading()) {
    return;
  }

  const email = this.email.value.trim();
  const code = this.otp.value;

  this.isLoading.set(true);

  // 3. Call API
  this.registrationService
    .confirmEmailVerification(email, code)
    .pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    )
    .subscribe({
      next: (response) => {

        if (response.status === true) {

          // 4. Verification successful
          this.stopResendTimer();

          // Move to User Information
          this.currentStep.set(3);

        } else {
          this.errorMessage.set(
            response.message ||
            'Verification failed. Please try again.'
          );
        }
      },

      error: (error: HttpErrorResponse) => {

        this.errorMessage.set(
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'Unable to verify the code. Please try again.'
        );
      }
    });
}


resendOtp(): void {
  if (this.resendSeconds() > 0 || this.isLoading()) {
    return;
  }

  // TODO: Call resend OTP API.
  // Restart the timer only after server confirmation.
}

ngOnDestroy(): void {
  this.stopResendTimer();
}


}
