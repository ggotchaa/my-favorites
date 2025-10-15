import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { KzCountry } from "src/app/model/GlobalConst";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class InvoiceSectionCValidators extends FormControlElementsBase {

  static tinRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let isNonResident = control.parent.get('nonresidentCheckBox').value;      

      return !isNonResident && !control.value? { tinRequired: true } : null;
    }

    return null;
  }

  static nonResidentLength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let isNonResident = control.parent.get('nonresidentCheckBox').value;

      if (!isNonResident || !control.value) {
        return null;
      }

      let value = control.value as string;

      let wrongLength = value.length < 1 || value.length > 50;

      return wrongLength ? { nonResidentLength: true } : null;
    }

    return null;
  }

  static residentLength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let isNonResident = control.parent.get('nonresidentCheckBox').value;

      if (isNonResident || !control.value) {
        return null;
      }

      let value = control.value as string;

      let wrongLength = value.length != 12;

      return wrongLength ? { residentLength: true } : null;
    }

    return null;
  }

  static nonResidentCantBeKz: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      let isNonResident = control.parent.get('nonresidentCheckBox').value;
      let countryCode = control.parent.get('countryCode').value;

      return isNonResident && countryCode === KzCountry ? { nonResidentCantBeKz: true } : null;
    }

    return null;
  }

  static getSectionCErrorCount(section: AbstractControl): number {
    return (section.get('customer.address').errors?.required === true ? 1 : 0) +
      (section.get('customer.name').errors?.required === true ? 1 : 0) +
      (section.get('customer.countryCode').errors?.required === true ? 1 : 0) +
      (section.get('customer.countryCode').errors?.nonResidentCantBeKz ? 1 : 0) +
      (section.get('customer.countryCode').errors?.notEqualToEAES ? 1 : 0) +
      (section.get('customer.tin').errors?.required === true ? 1 : 0) +
      (section.get('customer.tin').errors?.pattern ? 1 : 0) +
      (section.get('customer.tin').errors?.residentLength ? 1 : 0) +
      (section.get('customer.tin').errors?.nonResidentLength ? 1 : 0)
  }
}
