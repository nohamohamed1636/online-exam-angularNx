import {AbstractControl,ValidationErrors,ValidatorFn} from '@angular/forms';

export class Password {}

export function strongPasswordValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const value = control.value as string;

    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = true;
    }

    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = true;
    }

    if (!/[0-9]/.test(value)) {
      errors['number'] = true;
    }

    if (!/[^A-Za-z0-9\s]/.test(value)) {
      errors['specialCharacter'] = true;
    }

    return Object.keys(errors).length > 0
      ? errors
      : null;
  };
}

export function passwordMatchValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const password = control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  };
}
