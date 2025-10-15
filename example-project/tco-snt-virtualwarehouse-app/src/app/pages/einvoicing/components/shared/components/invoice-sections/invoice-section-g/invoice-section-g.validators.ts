import { AbstractControl, UntypedFormControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { CustomerCategory } from "src/app/model/enums/CustomerCategory";
import { KztCurrencyCode, USD } from "src/app/model/GlobalConst";
import { TruOriginCodes } from "src/app/model/lists/TruOriginCodes";
import { SntSectionGValidators } from "src/app/pages/snt/snt-sections/snt-section-g/snt-section-g.validators";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class InvoiceSectionGValidators extends FormControlElementsBase {
  static currencyRateRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {      
      const currencyCode = control.parent.get('currencyCode').value;
      return currencyCode && currencyCode !== KztCurrencyCode && !control.value ? { currencyRateRequired: true } : null                                                        
    }
    return null;
  }

  static measurementUnitRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {    
    if (control.parent) {      
      const originCode = control.parent.get('truOriginCode').value;
      const originCodeRule = originCode && originCode != TruOriginCodes[6].value; 
      return !control.value && originCodeRule ? { measurementUnitRequired: true } : null
    }
    return null;
  }

  static quantityRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      const originCode = control.parent.get('truOriginCode').value;
      
      return !control.value && originCode != TruOriginCodes[6].value ? { quantityRequired: true } : null
    }
    return null;
  }

  static currencyCodeUpdate: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const currencyCode = control.get('currencyCode') as UntypedFormControl;
    const currencyRate = control.get('currencyRate') as UntypedFormControl;
    const statuses = control.get('seller.statuses') as UntypedFormControl;
    const tin = control.get('customer.tin') as UntypedFormControl;
    const isHaveNeedStatuses = (statuses.value as string[]).some(s =>
      s === CustomerCategory.SHARING_AGREEMENT_PARTICIPANT ||
      s === CustomerCategory.EXPORTER ||
      s === CustomerCategory.TRANSPORTER);
    const isKzCustomerWithUSD = currencyCode.value === USD && tin.value;

    if (isHaveNeedStatuses || isKzCustomerWithUSD) {
      InvoiceSectionGValidators.EnableAndSetValueElement(currencyCode, currencyCode.value);
    }
    else {
      InvoiceSectionGValidators.DisableAndSetValueElement(currencyCode, KztCurrencyCode);
    }
    currencyRate.updateValueAndValidity({onlySelf: true, emitEvent: false});
    return null;
  }

  static unitPriceRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const truOriginCode = control.get('truOriginCode').value;
    const unitPrice = control.get('unitPrice') as UntypedFormControl;
    if (!unitPrice.value && truOriginCode != TruOriginCodes[6].value){
      SntSectionGValidators.addError(unitPrice, 'unitPriceRequired');
    }else{
      SntSectionGValidators.removeError(unitPrice, 'unitPriceRequired');
    }
    return null;
  }

  static tnvedCodeRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {      
      const originCode = control.parent.get('truOriginCode').value;
      if (!control.value) {
        const requiredIfOriginCode123 = (originCode == 1 || originCode == 2 || originCode == 3);

        let requiredIfOriginCode4 = (originCode == 4);
        requiredIfOriginCode4 &&= control.parent.parent.parent.get('seller.exporterCheckBox').value;
        requiredIfOriginCode4 &&= InvoiceSectionGValidators.isCountryEAES(control.parent.parent.parent.get('customer.countryCode').value);

        return !control.value && (requiredIfOriginCode123 || requiredIfOriginCode4) ? { tnvedCodeRequired: true } : null
      }      
    }
    return null;
  }

  static descriptionRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control.parent) {
      const originCode = control.parent.get('truOriginCode').value;
      return !control.value && (originCode == 3 || originCode == 4 || originCode == 5 || originCode == 6) ? { descriptionRequired: true } : null
    }
    return null;
  }

  static getSectionGErrorCount(section: AbstractControl): number {
    return (section.get('products').errors?.required === true ? 1 : 0)
  }

  static kzCustomerMustBeKzt: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const tin = control.get('customer.tin') as UntypedFormControl;
    const currencyCode = control.get('currencyCode') as UntypedFormControl;    
    const sellerStatuses = control.get('seller.statuses') as UntypedFormControl;   

    const isSharingArgreementParticipant = sellerStatuses.value.includes(CustomerCategory.SHARING_AGREEMENT_PARTICIPANT);      
    const isKzCustomerWithUSD = currencyCode.value === USD && tin.value;
    if(isKzCustomerWithUSD && !isSharingArgreementParticipant)
     return {isConvertedToKzt: true}  
    return null;
  }
}
