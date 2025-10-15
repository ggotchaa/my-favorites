import { Component, Inject, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CurrencyDto } from 'src/app/api/GCPClient';
import { SntActionMode } from 'src/app/model/enums/SntActionMode';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { ISearchable } from 'src/app/model/interfaces/ISearchable';
import { CurrencyFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/currency-search/currency-fillable-non-options.service';
import { CurrencyFillableService } from 'src/app/shared/services/auto-complete-searches/currency-search/currency-fillable.service';
import { CurrencySearchService } from 'src/app/shared/services/auto-complete-searches/currency-search/currency-search.service';
import { CurrencyFillableToken, CurrencySearchToken } from 'src/app/shared/tokens/currency-search.token';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';

@Component({
    selector: 'app-snt-section-currency',
    templateUrl: './snt-section-currency.component.html',
    styleUrls: ['./snt-section-currency.component.scss'],
    providers: [
        {
            provide: CurrencyFillableToken,
            useFactory: (mode: SntActionMode) => {
                return mode !== 2 && mode !== 3 ? new CurrencyFillableService() : new CurrencyFillableNonOptionsService();
            },
            deps: [SNTACTIONMODE]
        }
    ],
    standalone: false
})
export class SntSectionCurrencyComponent implements OnInit {
  
  @Input() sntForm: UntypedFormGroup
  @Input() currencies: CurrencyDto[]
  @Input() favouriteCurrencies: CurrencyDto[]

  constructor(
    @Inject(CurrencyFillableToken) private currencyFillable: IFilliable<CurrencyDto,string> | IFilliableNonOption<CurrencyDto, string>,
    @Inject(SNTACTIONMODE) private mode: SntActionMode
  ) {
  }

  ngOnInit(): void {
    if(this.mode !== SntActionMode.Show && this.mode !== SntActionMode.Correction)
      (this.currencyFillable as IFilliable<CurrencyDto, string>).fillOut([this.favouriteCurrencies, this.currencies])
    else
      (this.currencyFillable as IFilliableNonOption<CurrencyDto, string>).fillOut(this.currencies)
  }

  onSelected(value: CurrencyDto) {
    (this.sntForm.get('currencyRate') as UntypedFormControl).setValue(value.rate, {
      emitEvent: false,
      onlySelf: true
    })
  }

}
