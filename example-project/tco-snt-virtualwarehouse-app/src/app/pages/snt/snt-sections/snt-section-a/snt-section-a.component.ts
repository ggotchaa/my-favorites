import { formatDate } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SntExportType, SntImportType, SntTransferType, TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';
import { SntActionMode } from 'src/app/model/enums/SntActionMode';
import { KzCountry } from 'src/app/model/GlobalConst';
import { SntExportTypes } from 'src/app/model/lists/SntExportTypes';
import { SntImportTypes } from 'src/app/model/lists/SntImportTypes';
import { SntTransferTypes } from 'src/app/model/lists/SntTransferTypes';
import { Utilities } from 'src/app/shared/helpers/Utils';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { SntFacade } from '../../snt.facade';
import { SntFormUtilities } from '../../SntFormUtils';
import { FormControlElementsBase } from '../FormControlElementsBase';
import { SntSectionBValidators } from '../snt-section-b/snt-section-b.validators';
import { SntSectionCValidators } from '../snt-section-c/snt-section-c.validators';
import { SntSectionDValidators } from '../snt-section-d/snt-section-d.validators';
import { SntSectionsNames } from '../SntSectionsNames';
import { SntSectionGValidators } from '../snt-section-g/snt-section-g.validators';
import { SntSectionG6Validators } from '../snt-section-g6/snt-section-g6.validators';
import { SntSectionG10Validators } from '../snt-section-g10/snt-section-g10.validators';

@Component({
    selector: 'app-snt-section-a',
    templateUrl: './snt-section-a.component.html',
    styleUrls: ['./snt-section-a.component.scss'],
    standalone: false
})
export class SntSectionAComponent implements OnInit, OnDestroy {

  sntSectionsNames = SntSectionsNames
  sntImportTypes = SntImportTypes;
  sntExportTypes = SntExportTypes;
  sntTransferTypes = SntTransferTypes;
  @Input() draftSntForm: UntypedFormGroup;  
  @Input() warehouses: TaxpayerStoreSimpleDto[];

  @Input() dateFn: (d: Date | null) => boolean

  get registrationDate(): string{
    const date = this.draftSntForm.get('date').value;
    if(!date)
      return '';

    const registrationDate = date as Date;
    if(registrationDate.getFullYear() > 1)
      return formatDate(registrationDate, 'dd.MM.yyyy', 'en');

    return '';
  }
  constructor(
    public sntFacade: SntFacade,
    @Inject(SNTACTIONMODE) public mode: SntActionMode    
    ) {
  }
 
  private unsubscribe$: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.draftSntForm.get('importType').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(_ => {this.draftSntForm.get('shippingDate').updateValueAndValidity();});

    this.draftSntForm.get('exportType').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(_ => {this.draftSntForm.get('shippingDate').updateValueAndValidity();});

    this.draftSntForm.get('digitalMarkingNotificationNumber').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(_ => {this.draftSntForm.get('digitalMarkingNotificationDate').updateValueAndValidity();});
  }
 
  onImportTypeChange(importType: SntImportType): void{
    // Section A
    this.draftSntForm.get('exportType').reset('',{onlySelf: true, emitEvent: false})
    this.draftSntForm.get('transferType').reset('',{onlySelf: true, emitEvent: false})

    const sectionCValidators = new SntSectionCValidators();
    if(!importType || importType != SntImportType.IMPORT_IN_SEZ){
      this.draftSntForm.get('seller.countryCode').setValue(KzCountry);
    }


    SntSectionBValidators.resetFields(this.draftSntForm.get('seller'));
    (this.draftSntForm.get('seller.nonResident') as UntypedFormControl).setValue(true,{onlySelf: true, emitEvent: false});

    (this.draftSntForm.get('customer.nonResident') as UntypedFormControl).setValue(false,{onlySelf: true, emitEvent: false});
    this.wrapFillFields(sectionCValidators, this.draftSntForm.get('customer'));
    (this.draftSntForm.get('customer.countryCode') as UntypedFormControl).clearValidators();
    (this.draftSntForm.get('customer.countryCode') as UntypedFormControl).setValidators([SntSectionGValidators.applyProductWeightValidation, SntSectionG6Validators.applyOilProductWeightValidation, SntSectionG10Validators.applyExportControlProductWeightValidation]);

    // Section D
    (this.draftSntForm.get('consignor.nonResident') as UntypedFormControl).setValue(true);
    SntSectionDValidators.EnableAndSetValueElement((this.draftSntForm.get('consignor.countryCode') as UntypedFormControl), '', false, false);

    SntSectionDValidators.resetFields(this.draftSntForm.get('consignor'));

    (this.draftSntForm.get('consignee.nonResident') as UntypedFormControl).setValue(false);
    SntSectionDValidators.DisableAndSetValueElement((this.draftSntForm.get('consignee.countryCode') as UntypedFormControl), SntSectionDValidators.country, false, false);
    SntSectionDValidators.fillFields(this.draftSntForm.get('consignee'));

    //Section E
    if(Utilities.isEmptyValue(importType)){
      this.rulesForOtherTransportTypeIfImportNotSelected();
    }
    else {
      this.rulesForOtherTransportTypeIfImportSelected();
    }
    //Section G6
    SntFormUtilities.updateOilProductsValueAndValidity(this.draftSntForm);

  }

  onTransferTypeChange(transferType: SntTransferType): void {
    const sectionCValidators = new SntSectionCValidators();
    const sectionBValidators = new SntSectionBValidators();
    if(!transferType || (transferType != SntTransferType.ONE_PERSON_IN_EAEU && transferType != SntTransferType.OTHER)){
      this.draftSntForm.get('seller.countryCode').setValue(KzCountry);
    }
    if(transferType === SntTransferType.ONE_PERSON_IN_EAEU){
      SntSectionCValidators.EnableAndSetValueElement((this.draftSntForm.get('customer.countryCode') as UntypedFormControl), SntSectionCValidators.country, false);
      SntSectionCValidators.EnableAndSetValueElement((this.draftSntForm.get('seller.countryCode') as UntypedFormControl), SntSectionCValidators.country, false);
      (this.draftSntForm.get('customer.countryCode') as UntypedFormControl).setValidators([SntSectionCValidators.countryCodeTransferType92, SntSectionGValidators.applyProductWeightValidation, SntSectionG6Validators.applyOilProductWeightValidation, SntSectionG10Validators.applyExportControlProductWeightValidation])
    }
    if(transferType === SntTransferType.ONE_PERSON_IN_EAEU || transferType === SntTransferType.OTHER)
    {
      (this.draftSntForm.get('seller.nonResident') as UntypedFormControl).setValue(false,{onlySelf: true, emitEvent: false});
      (this.draftSntForm.get('customer.nonResident') as UntypedFormControl).setValue(false,{onlySelf: true, emitEvent: false});
      // Section D
      (this.draftSntForm.get('consignor.nonResident') as UntypedFormControl).setValue(true);
      SntSectionDValidators.EnableAndSetValueElement((this.draftSntForm.get('consignor.countryCode') as UntypedFormControl), '', false, false);
      (this.draftSntForm.get('consignee.nonResident') as UntypedFormControl).setValue(true);
      (this.draftSntForm.get('consignee.countryCode') as UntypedFormControl).setValue('', {onlySelf: true, emitEvent: false, emitModelToViewChange: false})
    }
    if(transferType === SntTransferType.ONE_PERSON_IN_KZ){

      this.wrapFillFields(sectionBValidators, this.draftSntForm.get('seller'))
      this.wrapFillFields(sectionCValidators, this.draftSntForm.get('customer'))
      SntSectionDValidators.fillFields(this.draftSntForm.get('consignor'));
      SntSectionDValidators.fillFields(this.draftSntForm.get('consignee'));
      (this.draftSntForm.get('seller.nonResident') as UntypedFormControl).setValue(false,{onlySelf: true, emitEvent: false});
      (this.draftSntForm.get('customer.nonResident') as UntypedFormControl).setValue(false,{onlySelf: true, emitEvent: false});
    }
    // Section A
    this.draftSntForm.get('exportType').reset('',{onlySelf: true, emitEvent: false})
    this.draftSntForm.get('importType').reset('',{onlySelf: true, emitEvent: false})

    //Section E
    this.rulesForOtherTransportTypeIfImportNotSelected();
  }
  onExportTypeChange(exportType: SntExportType): void {
    const sectionBValidators = new SntSectionBValidators();
    //Section A
    this.draftSntForm.get('importType').reset('', {onlySelf: true, emitEvent: false})
    this.draftSntForm.get('transferType').reset('', {onlySelf: true, emitEvent: false});

    (this.draftSntForm.get('customer.nonResident') as UntypedFormControl).setValue(true,{onlySelf: true, emitEvent: false});
    (this.draftSntForm.get('seller.nonResident') as UntypedFormControl).setValue(false,{onlySelf: true, emitEvent: false});
    this.wrapFillFields(sectionBValidators, this.draftSntForm.get('seller'))
    SntSectionCValidators.resetFields(this.draftSntForm.get('customer'));


    // Section D
    (this.draftSntForm.get('consignee.nonResident') as UntypedFormControl).setValue(true);
    SntSectionDValidators.EnableAndSetValueElement((this.draftSntForm.get('consignee.countryCode') as UntypedFormControl), '', false, false);
    SntSectionDValidators.resetFields(this.draftSntForm.get('consignee'));

    (this.draftSntForm.get('consignor.nonResident') as UntypedFormControl).setValue(false);
    SntSectionDValidators.DisableAndSetValueElement((this.draftSntForm.get('consignor.countryCode') as UntypedFormControl), SntSectionDValidators.country);
    SntSectionDValidators.fillFields(this.draftSntForm.get('consignor'));

    //Section E
    this.rulesForOtherTransportTypeIfImportNotSelected();
  }  
  private wrapFillFields(validator: FormControlElementsBase, control: AbstractControl) {
    let lastStore = this.warehouses[this.warehouses.length - 1];
    validator.fillFields(control, lastStore.id);
    control.get('actualAddress').setValue(lastStore.address);
  }

  private rulesForOtherTransportTypeIfImportSelected(): void {
    let otherCheckBox = this.draftSntForm.get('shippingInfo.otherCheckBox') as UntypedFormControl;
    otherCheckBox.setValue(false);
    otherCheckBox.disable()
  }

  private rulesForOtherTransportTypeIfImportNotSelected(): void {
    let otherCheckBox = this.draftSntForm.get('shippingInfo.otherCheckBox') as UntypedFormControl;
    otherCheckBox.setValue(false);
    otherCheckBox.enable()
  }

  onHasOilProductsChanged(hasOilProducts: boolean) {
    const productsFormArray = this.draftSntForm.get('products') as AbstractControl;
    const oildProductsFormArray = this.draftSntForm.get('oilProducts') as AbstractControl
    if(hasOilProducts){
      productsFormArray.clearValidators()
      oildProductsFormArray.setValidators(Validators.required)
    } 
    
    if(!hasOilProducts){
      oildProductsFormArray.clearValidators()
      productsFormArray.setValidators(Validators.required)
    }
    
    productsFormArray.updateValueAndValidity()
    oildProductsFormArray.updateValueAndValidity()

  }

  onExportControlProductsChanged(hasExportControlProducts: boolean) {
    const productsFormArray = this.draftSntForm.get('products') as AbstractControl;
    const oildProductsFormArray = this.draftSntForm.get('oilProducts') as AbstractControl;
    const exportControlProductsFormArray = this.draftSntForm.get('exportControlProducts') as AbstractControl;
    if(hasExportControlProducts){
      productsFormArray.clearValidators()
      oildProductsFormArray.clearValidators()
      exportControlProductsFormArray.setValidators(Validators.required);
    } 
    
    if(!hasExportControlProducts){
      oildProductsFormArray.setValidators(Validators.required);
      productsFormArray.clearValidators()
      exportControlProductsFormArray.clearValidators()
    }
    
    productsFormArray.updateValueAndValidity()
    oildProductsFormArray.updateValueAndValidity()
    exportControlProductsFormArray.updateValueAndValidity()

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
