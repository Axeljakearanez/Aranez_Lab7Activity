import { AbstractControl } from '@angular/forms';

// Custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
  return (group: AbstractControl) => {
    const control = group.get(controlName);
    const matchingControl = group.get(matchingControlName);

    if (!matchingControl) {
      return null;
    }

    // return if another validator has already found an error on the matchingControl
    if (matchingControl.errors && matchingControl.errors.mustMatch) {
      return null;
    }

    // set error on matchingControl if validation fails
    if (control && matchingControl && control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }

    return null;
  };
}