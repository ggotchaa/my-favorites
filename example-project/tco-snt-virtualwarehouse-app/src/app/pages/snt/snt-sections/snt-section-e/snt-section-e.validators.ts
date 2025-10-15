import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { SntImportType, SntTransporterTransportType, StoreType, TaxpayerStoreSimpleDto } from "src/app/api/GCPClient";
import { SntFormUtilities } from "../../SntFormUtils";
import { FormControlElementsBase } from "../FormControlElementsBase";
import { Utilities } from "../../../../shared/helpers/Utils";

export class SntSectionEValidators extends FormControlElementsBase {
    static nonResident: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        let tin;
        if(control.parent !== undefined) 
        {
            tin = (control.parent.controls['tin'] as AbstractControl)
            if (control.value) {
                tin.setValidators([Validators.pattern(/^[0-9]*$/), Validators.minLength(1), Validators.maxLength(50)])
                tin.updateValueAndValidity({onlySelf: true, emitEvent: false});
                return null;
            }else{
                tin.setValidators([Validators.pattern(/^[0-9]*$/), Validators.required, Validators.minLength(12), Validators.maxLength(12)])
                tin.updateValueAndValidity({onlySelf: true, emitEvent: false});
                return null;
            }
        }
    }
    static tinValidation: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        control.setValidators([Validators.pattern(/^[0-9]*$/)]);
        control.updateValueAndValidity({onlySelf: true, emitEvent: false});
        if(control.hasError('pattern')) return {pattern: true};
        return null
    }

    static nameValidation: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const isNonResident = control.get('nonResident') as UntypedFormControl
        const name = control.get('name') as UntypedFormControl
        if(isNonResident.value){
            name.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(450)]);
            name.updateValueAndValidity({onlySelf: true, emitEvent: false});
        }else{
            name.setValidators([Validators.minLength(1), Validators.maxLength(450)]);
            name.updateValueAndValidity({onlySelf: true, emitEvent: false});
        }
        return null;
    }
    static isEmptyFields : ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const countryCodeSeller = control.get('seller.countryCode')
        const countryCodeCustomer = control.get('customer.countryCode')
        const countryCodeConsignee = control.get('consignee.countryCode')
        const countryCodeConsignor = control.get('consignor.countryCode')

        const countryCodes =  [
            {
                fieldName: '19. Код страны отправки/отгрузки',
                fieldValue: countryCodeSeller
            },
            {
                fieldName: '28. Код страны доставки/поставки',
                fieldValue: countryCodeCustomer
            },
            {
                fieldName: '33. Код страны отправки',
                fieldValue: countryCodeConsignor
            },
            {
                fieldName: '36. Код страны доставки',
                fieldValue: countryCodeConsignee
            },
        ];
        const transportTypes = control.get('shippingInfo.transportTypes') as UntypedFormArray
        let isEmptyFields = false;
        let errorText = 'Посмотрите на правильное заполняемость полей: ';
        for (const countryCode of countryCodes) {
            if(countryCode.fieldValue?.value === ''){
                isEmptyFields = true;
                errorText = errorText + ' ' + countryCode.fieldName
            }
        }
        if(isEmptyFields) {
            SntSectionEValidators.disableElements(
                [
                  control.get('shippingInfo.carCheckBox'), 
                  control.get('shippingInfo.shipCheckBox'),
                  control.get('shippingInfo.carriageCheckBox'),
                  control.get('shippingInfo.boardCheckBox'),
                  control.get('shippingInfo.pipelineCheckBox'),
                  control.get('shippingInfo.multimodalCheckBox'),
                  control.get('shippingInfo.otherCheckBox')
                ]
            )

            SntSectionEValidators.addError(transportTypes, {isEmptyFields: isEmptyFields, message: errorText});
        }else{
            SntSectionEValidators.enableElements(
                [
                  control.get('shippingInfo.carCheckBox'), 
                  control.get('shippingInfo.shipCheckBox'),
                  control.get('shippingInfo.carriageCheckBox'),
                  control.get('shippingInfo.boardCheckBox'),
                  control.get('shippingInfo.pipelineCheckBox'),
                  control.get('shippingInfo.multimodalCheckBox'),
                  control.get('shippingInfo.otherCheckBox')
                ]
            )
            
            SntSectionEValidators.shouldBeOtherTransportTypesDisabled(control);
            SntSectionEValidators.removeError(transportTypes, {isEmptyFields: isEmptyFields, message: errorText});
        }
        
        return control.errors
    }
    
    static shouldBeOtherTransportTypesDisabled = (control: AbstractControl) => {
        const importType = control.get('importType') as UntypedFormControl;
        const exportType = control.get('exportType') as UntypedFormControl;
        const transferType = control.get('transferType') as UntypedFormControl;

        const otherCheckBox = control.get('shippingInfo.otherCheckBox')

        if(SntFormUtilities.isImportType(importType) &&  Utilities.isEmptyValue(exportType.value) && Utilities.isEmptyValue(transferType.value)){
            otherCheckBox.disable({onlySelf: true, emitEvent: true})
        }else {
            otherCheckBox.enable({onlySelf: true, emitEvent: true})
        }
    }

    static isTransportTypeRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const countryCodeSeller = control.get('seller.countryCode')
        const countryCodeCustomer = control.get('customer.countryCode')
        const countryCodeConsignee = control.get('consignee.countryCode')
        const countryCodeConsignor = control.get('consignor.countryCode')
        const transportTypes = control.get('shippingInfo.transportTypes') as UntypedFormArray
     
        if(countryCodeConsignee.value !== SntSectionEValidators.country || countryCodeCustomer.value !== SntSectionEValidators.country 
            || countryCodeSeller.value !== SntSectionEValidators.country || countryCodeConsignor.value !== SntSectionEValidators.country) 
            {
                const carCheckBox = control.get('shippingInfo.carCheckBox').value
                const carriageCheckBox = control.get('shippingInfo.carriageCheckBox').value
                const boardCheckBox = control.get('shippingInfo.boardCheckBox').value
                const shipCheckBox = control.get('shippingInfo.shipCheckBox').value
                const pipelineCheckBox = control.get('shippingInfo.pipelineCheckBox').value
                const otherCheckBox = control.get('shippingInfo.otherCheckBox').value

                const isSmthChecked = (
                    !(carCheckBox === '' || carCheckBox === null || carCheckBox === undefined || carCheckBox === false ) || 
                    !(carriageCheckBox === '' || carriageCheckBox === null || carriageCheckBox === undefined || carriageCheckBox === false ) || 
                    !(shipCheckBox === '' || shipCheckBox === null || shipCheckBox === undefined || shipCheckBox === false) || 
                    !(boardCheckBox === '' || boardCheckBox === null || boardCheckBox === undefined || boardCheckBox === false) || 
                    !(pipelineCheckBox === '' || pipelineCheckBox === null || pipelineCheckBox === undefined || pipelineCheckBox === false) ||
                    !(otherCheckBox === '' || otherCheckBox === null || otherCheckBox === undefined || otherCheckBox === false))

                if(isSmthChecked) {
                    SntSectionEValidators.removeError(transportTypes, 'isRequiredTransport') 
                }
                else {
                    SntSectionEValidators.addError(transportTypes, 'isRequiredTransport')
                }
            }
        else {
            SntSectionEValidators.removeError(transportTypes, 'isRequiredTransport') 
        }

        return;
    }
    static vehicleTransport(warehouse: TaxpayerStoreSimpleDto, control: AbstractControl) {
        if(warehouse.type === StoreType.MOBILE_STORE){
            control.get('carCheckBox').setValidators(Validators.required)
            control.get('carCheckBox').updateValueAndValidity({onlySelf: true, emitEvent: false})
        }
    } 
    static setTransporterTypesEditMode(control: UntypedFormGroup,type: string): void {
        switch(type){
            case SntTransporterTransportType.AUTOMOBILE: {
                control.get('carStateNumber').enable()
                control.get('trailerStateNumber').enable();
                (control.get('carCheckBox') as UntypedFormControl).setValue(true)
                break;
            }
            case SntTransporterTransportType.RAILWAY: {
                control.get('carriageNumber').enable();
                (control.get('carriageCheckBox') as UntypedFormControl).setValue(true)
                break;
            }
            case SntTransporterTransportType.MARINE: {
                control.get('shipNumber').enable();
                (control.get('shipCheckBox') as UntypedFormControl).setValue(true)
                break;
            }
            case SntTransporterTransportType.AIR: {
                control.get('boardNumber').enable();
                (control.get('boardCheckBox') as UntypedFormControl).setValue(true)
                break;
            }
            case SntTransporterTransportType.PIPELINE: {
                (control.get('pipelineCheckBox') as UntypedFormControl).setValue(true)
                break;
            }
            case SntTransporterTransportType.OTHER: {
                (control.get('otherCheckBox') as UntypedFormControl).setValue(true)
                break;
            }
            case SntTransporterTransportType.MULTIMODAL: {
                (control.get('multimodalCheckBox') as UntypedFormControl).setValue(true)
                break;
            }
        }
    }

    static getSectionEErrorCount(section: AbstractControl): number {
        return (section.get('shippingInfo.tin').errors?.required === true ? 1 : 0) +
        (section.get('shippingInfo.transportTypes').errors?.isRequiredTransport ? 1 : 0) +
        (section.get('shippingInfo.transportTypes').errors?.isEmptyFields ? 1 : 0) +
        (section.get('shippingInfo.tin').errors?.pattern ? 1 : 0) +
        (section.get('shippingInfo.tin').errors?.minlength ? 1 : 0) +
        (section.get('shippingInfo.tin').errors?.maxlength ? 1 : 0) + 
        (section.get('shippingInfo.name').errors?.minlength ? 1 : 0) +
        (section.get('shippingInfo.name').errors?.maxlength ? 1 : 0) +
        (section.get('shippingInfo.name').errors?.required ? 1 : 0)
    }

    // TODO refactor enable and disable methods
    public static enable(control: AbstractControl, enableField: boolean = true): void{
        if(enableField) control.enable({onlySelf: true, emitEvent: false});
        control.updateValueAndValidity({onlySelf: true, emitEvent: false});
    }
    public static disable(control: AbstractControl, disableField: boolean = true): void{
        control.root.get('shippingInfo.transportTypes').setErrors({isRequiredTransport: true})
        if(disableField) control.disable({onlySelf: true, emitEvent: false});
        control.updateValueAndValidity({onlySelf: true, emitEvent: false});
    }
}
