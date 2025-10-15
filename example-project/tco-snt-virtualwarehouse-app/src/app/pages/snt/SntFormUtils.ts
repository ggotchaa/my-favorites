import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { SntImportType } from "src/app/api/GCPClient";
import { Utilities } from "src/app/shared/helpers/Utils";
import { SntErrorsInfo } from "./snt-sections/SntFormErrorsDictionary";

export class SntFormUtilities {
  
  static getOilProducts(form: UntypedFormGroup): UntypedFormArray {
    return form.get('oilProducts') as UntypedFormArray;
  }

  static getExportControlProducts(form: UntypedFormGroup): UntypedFormArray {
    return form.get('exportControlProducts') as UntypedFormArray;
  }
  static setHasOilProducts(form: UntypedFormGroup) {
    form.get('hasOilProducts').setValue(true)
  }

  static setHasExportControlProducts(form: UntypedFormGroup) {
    form.get('hasExportControlProducts').setValue(true)
  }

  static updateOilProductsValueAndValidity(form: UntypedFormGroup) {
    let products = form.get('oilProducts') as UntypedFormArray;
    products.controls.forEach(p => { p.get('vadRate').updateValueAndValidity() });
  }

  static isImportType = (importTypeController: UntypedFormControl) : boolean => {
    return importTypeController.value == SntImportType.IMPORT || importTypeController.value == SntImportType.IMPORT_FOR_PROCESSING || importTypeController.value == SntImportType.IMPORT_OF_TEMPORARY_EXPORTED_PRODUCT || importTypeController.value == SntImportType.TEMPORARY_IMPORT
  } 

  static fillOutSntFormErrorDetails = (namesOfErrors: string[], sntFormErrorDetails: Map<string, string[]>, sntFormErrors: SntErrorsInfo): void => {
    let errors: string[] = []
    namesOfErrors.forEach(s => {
      const errorText = sntFormErrors.errors.get(s)
      if(!Utilities.isEmptyValue(errorText)) errors.push(errorText)
    })

    if(!sntFormErrorDetails.get(sntFormErrors.section)){
      sntFormErrorDetails.set(sntFormErrors.section, errors)
    }else{
      sntFormErrorDetails.get(sntFormErrors.section).push(...errors)
    }
  }

  static convertToValidPath = (path: string): string => {
    for (let index = 0; index < path.length; index++) {
      const indexString = index.toString()
      const i = path.indexOf(indexString)
      if(i !== -1){
        const searchValue = indexString + '-'
        return path.replace(searchValue, '')
      }
    }
  }
}
