import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function jsonValidator(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;
        try {
          JSON.parse(control.value);
          return null;
        } catch (e) {
          return { invalidJson: true };
        }
      };
    }
    