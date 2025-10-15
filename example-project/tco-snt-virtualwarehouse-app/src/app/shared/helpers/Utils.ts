import { AbstractControl, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { ApiException, ProblemDetails, ValidationProblemDetails } from "src/app/api/GCPClient";

export class Utilities {

/**
   * 
   * @param control this method is used to get names of errors with paths recursively inside a form.
   *  For example, [contract-date, ['required']], where contract-date is the path to the error "required"
   * @returns 
   */
 static getErrors(control: AbstractControl, field: string): [string, string[]][]{
  const isEmpty = Utilities.isEmptyValue(control.errors);

  if(!isEmpty && control.status === 'INVALID'){
    return [[field, Object.keys(control.errors)]];
  }

  let errors: [string, string[]][] = [];

  if(isEmpty && control.status === 'INVALID'){
    const formGroup = control as UntypedFormGroup;
    const isFieldEmpty = Utilities.isEmptyValue(field);
    
    Object.keys(formGroup.controls).forEach(controlKey => {

      let pathToError = isFieldEmpty ? controlKey : field + '-' + controlKey;
      
      const childControl = formGroup.get(controlKey);

      const childErrors = Utilities.getErrors(childControl, pathToError);
      errors = [...childErrors, ...errors];

    });
  }

  return errors;
}


  /**
   * This method is used to remove all object, properties or array elements which are null, undefined,empty or empty string 
   * @param obj object to be cleaned
   * @returns 
   */
  static cleanObject(obj: any) {
    if(obj === null || obj === undefined) return;
    let keys = Object.keys(obj);
    for(let i = 0; i < keys.length; i++) {
        if(obj[keys[i]] === null || obj[keys[i]] === undefined) {
            delete obj[keys[i]];
            continue;
        }

        const isPropetyEmpty = obj[keys[i]] === "" || obj[keys[i]] === '';
        let isObject = (typeof obj[keys[i]] === 'object');
        let isObjectEmpty = Object.keys(obj[keys[i]]).length === 0 && Object.getPrototypeOf(obj[keys[i]]) === Object.prototype;

        if (isPropetyEmpty) {
            delete obj[keys[i]];
            continue;
        }

        if (isObject && !isObjectEmpty) Utilities.cleanObject(obj[keys[i]]);
        
        isObject = (typeof obj[keys[i]] === 'object');
        isObjectEmpty = Object.keys(obj[keys[i]]).length === 0 && Object.getPrototypeOf(obj[keys[i]]) === Object.prototype;
    
        if(isObject  && isObjectEmpty) {
            delete obj[keys[i]];
        }
    };
  }

  /**
   * This method is intended to delete empty objects(undefined or null), if the respective property is object in the form. However, it doesn't delete empty fields that aren't objects.
   * @param obj object to be cleaned
   * @param form form for the comparison
   * @returns 
   */
  static removeEmptyObjects(obj: any, form: UntypedFormGroup) {
    if(obj === null || obj === undefined){
      return;
    }
    let keys = Object.keys(obj);
    for(let val of keys) {
      let isNullOrUndefined = (innerObj: any) => innerObj === null || innerObj === undefined
      let isObject = (innerObj:any) => typeof innerObj === 'object';
      
      if(isNullOrUndefined(obj[val]) && !isObject(form.controls[val]?.value)) 
          continue;

        let shouldBeDeleted = isNullOrUndefined(obj[val]) && isObject((form.controls[val] as UntypedFormControl)?.value);
        if(shouldBeDeleted) {
          delete obj[val];
          continue;
        } 
        let isObjectEmpty = Object.keys(obj[val]).length === 0 && Object.getPrototypeOf(obj[val]) === Object.prototype;
    
        if (isObject(obj[val]) && !isObjectEmpty) Utilities.removeEmptyObjects(obj[val], form);
        
        shouldBeDeleted = isNullOrUndefined(obj[val]) && isObject((form.controls[val] as UntypedFormControl).value);
    
        if(shouldBeDeleted) {
          delete obj[val]; 
    };
  }
}

  /*
    Returns negative number if date1 > date2  and positive if date1 < date2
  */
  static getDatesDayDiff(date1: Date, date2: Date) {
    if (!date1 || !date2) {
      return 0;
    }

    let dt1 = new Date(date1);
    let dt2 = new Date(date2);

    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
  }

  /**
   * Check the input parameter whether it is empty or not
   * @param value parameter must be a field(not object)
   * @returns 
  */
  static isEmptyValue = (value: any): boolean => value === null || value === undefined || value === '';

  /*
  * Check the input value wherether it is number or not.
  */
  static isNumber = (value: any): boolean => {
    if (value === null || value === '') {
      return false;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return false;
    }

    return !isNaN(Number(value));
  }

  static detectAndReturnErrorMessage(error: any) {
    if (typeof error === 'string') {
      return error;
    }

    else if (ApiException.isApiException(error)) {
      return error.message;
    }

    else if (error instanceof ProblemDetails && !('errors' in error)) {
      return error.title
    }

    else if (error instanceof ValidationProblemDetails && ('errors' in error)) {
      let errorMessage = ''
      errorMessage = error.title;
      const validationProblems = error as ValidationProblemDetails;
      if (Object.keys(validationProblems.errors).length > 0) {
        errorMessage = '<ul>';
        for (const [_, value] of Object.entries(validationProblems.errors)) {
          errorMessage += '<li>' + value + '</li>';
        }
        errorMessage += '</ul>'
      }
      return errorMessage
    }

    //error && (error.length > 0) && (error[0] instanceof FormErrorDetails)
    else if (error instanceof Map) {
      const formErrorDetails = error as Map<string, string[]>
      let errorMessage = '';
      formErrorDetails.forEach((value, key) => {
        errorMessage += '<span><strong>' + key + '</strong></span>';
        errorMessage += '<ul>';
        value.forEach(err => {
          errorMessage += '<li>' + err + '</li>';
        })
        errorMessage += '</ul>'
      })
      return errorMessage
    }

    else {
      return 'An unexpected server error occurred';
    }
  }
}
