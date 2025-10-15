import { Component, Inject, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CountryDto } from 'src/app/api/GCPClient';
import { KzCountry } from 'src/app/model/GlobalConst';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';
import { CountryFillableToken } from 'src/app/shared/tokens/country-search.token';

@Component({
    selector: 'app-invoice-section-d',
    templateUrl: './invoice-section-d.component.html',
    styleUrls: ['./invoice-section-d.component.scss'],
    providers: [
        {
            provide: CountryFillableToken,
            useClass: CountryFilliableService
        }
    ],
    standalone: false
})
export class InvoiceSectionDComponent implements OnInit {

  @Input() draftInvoiceForm: UntypedFormGroup;
  @Input() countries: CountryDto[];
  @Input() favouriteCountries: CountryDto[];

  constructor(
    @Inject(CountryFillableToken) private countryFillable: IFilliable<CountryDto, string> | IFilliableNonOption<CountryDto, string>,
  ) { }


  public get CountryKz(): string {
    return KzCountry;
  }
  
  onChange($event) {
    console.debug($event);
    console.debug(this.draftInvoiceForm.get('consignee'));
    console.debug(this.draftInvoiceForm);
  }

  ngOnInit(): void {
    (this.countryFillable as IFilliable<CountryDto, string>).fillOut([this.favouriteCountries, this.countries]);
  }  

  onCountryCodeChanged() {
    this.draftInvoiceForm.get('consignee.tin').updateValueAndValidity();    
    this.draftInvoiceForm.get('consignee.name').updateValueAndValidity();
    this.draftInvoiceForm.get('consignee.address').updateValueAndValidity();
  }
}
