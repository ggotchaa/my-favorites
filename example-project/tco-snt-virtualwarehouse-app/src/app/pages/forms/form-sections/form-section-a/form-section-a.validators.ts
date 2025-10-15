import { UntypedFormGroup } from "@angular/forms";
import { UFormType } from '../../../../api/GCPClient';

export class FormSectionAValidators{
  static getSectionAErrorCount(formGroup: UntypedFormGroup): number {
    return (formGroup.get('typeForm').errors?.required ? 1 : 0) +
      (formGroup.get('numberDocument').errors?.required ? 1 : 0) +
      (formGroup.get('numberDocument').errors?.maxlength ? 1 : 0) +
      (formGroup.get('typeForm').value === UFormType.WRITE_OFF && formGroup.get('writeOffReason').errors?.required ? 1 : 0);
  }
}
