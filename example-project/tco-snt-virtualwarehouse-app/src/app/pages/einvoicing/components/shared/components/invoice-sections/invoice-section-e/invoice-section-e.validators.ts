import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class InvoiceSectionEValidators extends FormControlElementsBase {
  static hasContract: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const contractNum = control.get('contractNum');
    const contractDate = control.get('contractDate');
    const accountNumber = control.get('accountNumber');

    const hasContract = control.get('hasContract').value === 'true';
    if (hasContract) {
      contractNum.setValidators(Validators.required);
      contractDate.setValidators(Validators.required);
      accountNumber.setValidators(Validators.pattern(/^(1|2)\/\d{3}\/\d{4}\/\d{1,20}$/))
      contractNum.enable({ onlySelf: true, emitEvent: false });
      contractDate.enable({ onlySelf: true, emitEvent: false });
      accountNumber.enable({ onlySelf: true, emitEvent: false });
      
    } else {
      contractNum.reset(null, { onlySelf: true, emitEvent: false });
      contractDate.reset(null, { onlySelf: true, emitEvent: false });
      accountNumber.reset(null, { onlySelf: true, emitEvent: false });

      contractNum.disable({ onlySelf: true, emitEvent: false });
      contractDate.disable({ onlySelf: true, emitEvent: false });
      accountNumber.disable({ onlySelf: true, emitEvent: false });
    }

    control.markAllAsTouched();

    return null;
  }


  static getSectionEErrorCount(section: AbstractControl): number {
    return (section.get('deliveryTerm.contractNum').errors?.required === true ? 1 : 0) +
      (section.get('deliveryTerm.contractDate').errors?.required === true ? 1 : 0) +
      (section.get('deliveryTerm.accountNumber').errors?.pattern ? 1 : 0) +
      (section.get('deliveryTerm.transportTypeCode').errors?.required === true ? 1 : 0);
  }
}
