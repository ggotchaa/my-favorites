import { UntypedFormGroup } from "@angular/forms";

export class FormSectionEValidators {
  static getSectionEErrorCount(form: UntypedFormGroup): number {
    return (form.get('products').errors?.required === true ? 1 : 0)
  }
}
