import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export function noWhitespaceValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const value = control.value as string;

    if (!value) {
      return null;
    }

   if (/\s/.test(value)) {
      return {
        whitespace: {
          message: 'input must not contain spaces.'
        }
      };
    }

    return null;
  };
}
