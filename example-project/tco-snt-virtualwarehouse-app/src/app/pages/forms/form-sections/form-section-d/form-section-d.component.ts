import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TaxpayerStoreSimpleDto, UFormType } from 'src/app/api/GCPClient';

@Component({
    selector: 'app-form-section-d',
    templateUrl: './form-section-d.component.html',
    styleUrls: ['./form-section-d.component.scss'],
    standalone: false
})
export class FormSectionDComponent{
  @Input() newFormCreate: UntypedFormGroup;
  @Input() warehouses: TaxpayerStoreSimpleDto[];  
  @Input() defaultWarehouse: string;
  @Input() isWarehousesLoading: boolean;

  formTypeEnums = UFormType;

  selectWarehouse(event: number) {    
    this.newFormCreate.get('warehouse.warehouseIdForm').setValue(this.warehouses.find(el => el.id == event).externalId);
    this.newFormCreate.get('warehouse.warehouseNameForm').setValue(this.warehouses.find(el => el.id == event).name);
    this.newFormCreate.get('warehouse.receiverWarehouseSelector').updateValueAndValidity();
  }

  selectReceiverWarehouse(event: number) {    
    this.newFormCreate.get('warehouse.receiverWarehouseIdForm').setValue(this.warehouses.find(el => el.id == event).externalId);
    this.newFormCreate.get('warehouse.receiverWarehouseNameForm').setValue(this.warehouses.find(el => el.id == event).name);
  }

  get formType(){
    return this.newFormCreate.get('typeForm').value;
  }

}
