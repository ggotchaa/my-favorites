import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CountryDto } from 'src/app/api/GCPClient';
import { CustomerCategory } from 'src/app/model/enums/CustomerCategory';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';
import { CountryFillableToken } from 'src/app/shared/tokens/country-search.token';
import { InvoiceFormUtils } from '../../../InvoiceFormUtils';
import { FormControlElementsBase } from '../FormControlElementsBase';


@Component({
    selector: 'app-invoice-section-c',
    templateUrl: './invoice-section-c.component.html',
    styleUrls: ['./invoice-section-c.component.scss'],
    providers: [
        {
            provide: CountryFillableToken,
            useClass: CountryFilliableService
        }
    ],
    standalone: false
})
export class InvoiceSectionCComponent implements OnInit, OnDestroy {

  @Input() draftInvoiceForm: UntypedFormGroup

  protected unsubscribe$: Subject<void> = new Subject<void>();

  @Input() countries: CountryDto[];
  @Input() favouriteCountries: CountryDto[];

  constructor(
    @Inject(CountryFillableToken) private countryFillable: IFilliable<CountryDto, string> | IFilliableNonOption<CountryDto, string>,
  ) {

  }

  onCategoryChanged(checked: boolean, value: string) {
    let statusesControl = this.draftInvoiceForm.get('customer.statuses');
    let statusesArray = statusesControl.value as string[];

    let index = statusesArray.indexOf(value);
    let elementExists = index > -1;

    if (checked && !elementExists) {
      statusesArray.push(value);
    } else if (!checked && elementExists) {
      statusesArray.splice(index, 1);
    }
    statusesControl.setValue(statusesArray);


    if (value === CustomerCategory.NONRESIDENT) {
      this.changeCountryCode(checked);
    }

    if (value === CustomerCategory.PUBLIC_OFFICE) {
      InvoiceFormUtils.updateValidationOfSellerBankDetails(this.draftInvoiceForm);
    }
  }

  onCountryCodeChanged(countryCode: string) {
    InvoiceFormUtils.udpateValidationOfProductsTnvedCode(this.draftInvoiceForm);
    (this.draftInvoiceForm.get('consignee.countryCode') as UntypedFormControl).setValue(countryCode, {onlySelf:true, emitEvent: false});
    this.draftInvoiceForm.get('consignee.name').updateValueAndValidity();
    this.draftInvoiceForm.get('consignee.address').updateValueAndValidity();
  }

  private changeCountryCode(isNonResident: boolean) {
    this.draftInvoiceForm.get('customer.tin').updateValueAndValidity();
    const countryCodeFormControl = this.draftInvoiceForm.get('customer.countryCode') as UntypedFormControl;
    const consigneeCountryCode = this.draftInvoiceForm.get('consignee.countryCode') as UntypedFormControl;

    if (isNonResident) {
      countryCodeFormControl.enable();
      consigneeCountryCode.enable();
    }
    else {
      FormControlElementsBase.DisableAndSetValueElement(countryCodeFormControl, FormControlElementsBase.country);
    }
  }  

  public get CustomerCategory() {
    return CustomerCategory;
  }

  ngOnInit(): void {
    (this.countryFillable as IFilliable<CountryDto, string>).fillOut([this.favouriteCountries, this.countries]);    
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
