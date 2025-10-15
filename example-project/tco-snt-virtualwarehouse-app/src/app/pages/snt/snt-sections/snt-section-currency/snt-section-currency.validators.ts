import { AbstractControl, UntypedFormControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { FormControlElementsBase } from "../FormControlElementsBase";

export class SntSectionCurrencyValidators extends FormControlElementsBase {
    /* 
        https://chevron.visualstudio.com/TCO-SNT-VirtualWarehouse/_wiki/wikis/TCO-SNT-VirtualWarehouse.wiki/45443/SNT-Currency-section
    */
    public static currencyCodeCheck:ValidatorFn = (control:AbstractControl): ValidationErrors | null => {
        const importType = control.get('importType') as UntypedFormControl;
        const exportType = control.get('exportType') as UntypedFormControl;
        const sellerTin = control.get('seller.tin') as UntypedFormControl
        const currencyCode = control.get('currencyCode') as UntypedFormControl;
        const currencyRate = control.get('currencyRate') as UntypedFormControl;
        const sharingAgreementParticipantCheckBox = control.get('seller.sharingAgreementParticipantCheckBox') as UntypedFormControl;
        const typeNotSelected: boolean = (importType.value === null || importType.value === '') && (exportType.value === null || exportType.value === '')
        const rule2: boolean = sellerTin.value !== '060640006784'
        if(typeNotSelected && rule2 && !sharingAgreementParticipantCheckBox.value){
            SntSectionCurrencyValidators.DisableAndSetValueElement(currencyCode, SntSectionCurrencyValidators.currencyCode)
            SntSectionCurrencyValidators.DisableAndSetValueElement(currencyRate,'')
        }
        else {
            SntSectionCurrencyValidators.EnableAndSetValueElement(currencyCode, currencyCode.value) 
            currencyRate.enable({onlySelf: true})
        }
        return null;
    }

}