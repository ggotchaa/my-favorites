import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { UFormType } from '../../../../api/GCPClient';

export class FormSectionDValidators{
  static getSectionDErrorCount(formGroup: UntypedFormGroup): number {
    return (formGroup.get('warehouse.warehouseSelector').errors?.required ? 1 : 0) +
      (formGroup.get('typeForm').value === UFormType.MOVEMENT && formGroup.get('warehouse.receiverWarehouseSelector').errors?.required ? 1 : 0) +
      (formGroup.get('typeForm').value === UFormType.MOVEMENT && formGroup.get('warehouse.receiverWarehouseSelector').errors?.receiverSameAsSenderWarehouse ? 1 : 0);
  }

  static receiverSameAsSenderWarehouse: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if(control.parent){
      const senderWarehouse = control.parent.get('warehouseSelector').value;
      const receiverWarehouse = control.value;

      return senderWarehouse && receiverWarehouse && senderWarehouse === receiverWarehouse ? { receiverSameAsSenderWarehouse: true } : null;
    }
    return null;
  }
}
