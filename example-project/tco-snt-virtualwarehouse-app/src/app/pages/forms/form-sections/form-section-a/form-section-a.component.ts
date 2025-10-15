import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { FormTypes } from 'src/app/model/lists/FormTypes';
import { WRITEOFFREASONS } from 'src/app/model/lists/WriteOffReasons';
import { UFormType } from '../../../../api/GCPClient';
import { FormSectionDValidators } from '../form-section-d/form-section-d.validators';
import { DetailingTypeList } from 'src/app/model/lists/DetailingTypeList';


@Component({
    selector: 'app-form-section-a',
    templateUrl: './form-section-a.component.html',
    styleUrls: ['./form-section-a.component.scss'],
    standalone: false
})
export class FormSectionAComponent {
  @Input() newFormCreate: UntypedFormGroup;    

  formTypeEnums = UFormType;
  types = FormTypes;
  writeOffReasons = WRITEOFFREASONS;
  detailingTypeList = DetailingTypeList;

  selectFormType(event: UFormType): void{  
    this.newFormCreate.get('writeOffReason').clearValidators();    
    this.newFormCreate.get('warehouse.receiverWarehouseSelector').clearValidators();
    this.newFormCreate.get('detailingType').clearValidators();
    this.newFormCreate.get('sectionE2Products').clearValidators();

    if (event === UFormType.WRITE_OFF) {
      this.newFormCreate.get('writeOffReason').setValidators([Validators.required]);      
    }

    if (event === UFormType.DETAILING) {
      this.newFormCreate.get('detailingType').setValidators([Validators.required]); 
      this.newFormCreate.get('sectionE2Products').setValidators([Validators.required]);   
    }

    if (event === UFormType.MOVEMENT) {
      this.newFormCreate.get('warehouse.receiverWarehouseSelector').setValidators([Validators.required, FormSectionDValidators.receiverSameAsSenderWarehouse]);
    }

    this.newFormCreate.get('writeOffReason').updateValueAndValidity();
    this.newFormCreate.get('warehouse.receiverWarehouseSelector').updateValueAndValidity();
    this.newFormCreate.get('detailingType').updateValueAndValidity();
    this.newFormCreate.get('sectionE2Products').updateValueAndValidity();
  }

  get formType(){
    return this.newFormCreate.get('typeForm').value;
  }

  DateFilter = (d: Date | null): boolean => {
    return d < new Date();
  }
}
