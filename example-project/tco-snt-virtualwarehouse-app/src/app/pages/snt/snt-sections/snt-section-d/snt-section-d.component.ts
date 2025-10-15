import { Component, Inject, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CountryDto } from 'src/app/api/GCPClient';
import { SntActionMode } from 'src/app/model/enums/SntActionMode';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { CountryFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/country-search/country-fillable-non-options.service';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';
import { CountryFillableToken } from 'src/app/shared/tokens/country-search.token';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { SntSectionsNames } from '../SntSectionsNames';

@Component({
    selector: 'app-snt-section-d',
    templateUrl: './snt-section-d.component.html',
    styleUrls: ['./snt-section-d.component.scss'],
    providers: [
        {
            provide: CountryFillableToken,
            useFactory: (mode: SntActionMode) => {
                return mode === 2 ? new CountryFillableNonOptionsService() : new CountryFilliableService();
            },
            deps: [SNTACTIONMODE]
        }
    ],
    standalone: false
})
export class SntSectionDComponent implements OnInit{

  @Input() private countries: CountryDto[]
  @Input() private favouriteCountries: CountryDto[]
  @Input()draftSntForm: UntypedFormGroup
  sntSectionsNames = SntSectionsNames


  constructor(
    @Inject(CountryFillableToken) private countryFillable: IFilliable<CountryDto, string> | IFilliableNonOption<CountryDto, string>,
    @Inject(SNTACTIONMODE) public mode: SntActionMode,
  ){}
    

  ngOnInit(): void {
    if(this.mode !== SntActionMode.Show)
      (this.countryFillable as IFilliable<CountryDto, string>).fillOut([this.favouriteCountries, this.countries])
    else 
      (this.countryFillable as IFilliableNonOption<CountryDto, string>).fillOut(this.countries)
  }
}
