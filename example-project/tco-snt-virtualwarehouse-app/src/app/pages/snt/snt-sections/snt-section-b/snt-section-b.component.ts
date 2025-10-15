import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { CountryDto, SntClient, SntParticipantDto, SntParticipantShortDto, SntParticipantType, TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';
import { SntActionMode } from 'src/app/model/enums/SntActionMode';
import { TopParticipantSearchByName } from 'src/app/model/GlobalConst';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { CountryFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/country-search/country-fillable-non-options.service';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';
import { CountryFillableToken, CountrySearchToken } from 'src/app/shared/tokens/country-search.token';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { SntParticipantSearchService } from '../../services/snt-participant-search.service';
import { SntSectionsNames } from '../SntSectionsNames';
import { SntSectionBValidators } from './snt-section-b.validators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-snt-section-b',
    templateUrl: './snt-section-b.component.html',
    styleUrls: ['./snt-section-b.component.scss'],
    providers: [
        SntParticipantSearchService,
        {
            provide: CountryFillableToken,
            useFactory: (mode: SntActionMode) => {
                return mode === 2 || mode === 3 ? new CountryFillableNonOptionsService() : new CountryFilliableService();
            },
            deps: [SNTACTIONMODE]
        }
    ],
    standalone: false
})

export class SntSectionBComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject<void>();
  participantByTin: SntParticipantDto;
  participantsByName: SntParticipantShortDto[];

  sntSectionsNames = SntSectionsNames

  @Input() draftSntForm : UntypedFormGroup;
  @Input() warehouses: TaxpayerStoreSimpleDto[];
  @Input() countries: CountryDto[];
  @Input() favouriteCountries: CountryDto[]

  constructor(
    public sntSearchParticipant: SntParticipantSearchService,
    private sntClient: SntClient,
    @Inject(CountryFillableToken) private countryFillable: IFilliable<CountryDto, string> | IFilliableNonOption<CountryDto, string>,
    @Inject(SNTACTIONMODE) public mode: SntActionMode,
  ) {
   
  }
  ngOnInit(): void {
    this.draftSntForm.get('seller.taxpayerStoreId').valueChanges
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(index => {
      if(index !== null)
        (this.draftSntForm.get('seller.actualAddress') as UntypedFormControl).setValue(this.warehouses.find(warehouse=> warehouse.id === index).address)
    }, err => console.error(err))

    this.sntSearchParticipant.participantForm = this.draftSntForm.get('seller');
    this.sntSearchParticipant.filterSearchForTin()
      .pipe(
        switchMap(tin => {
          this.participantByTin = null
          return this.sntClient.getSellerByTin(tin)
            .pipe(
              finalize(() => { this.sntSearchParticipant.searchingParticipantByTin = false; }),
              takeUntil(this.unsubscribe$)
            )
        })
      )
      .subscribe(
        participant => this.participantByTin = participant,
        err => console.error(err)
      )

    this.sntSearchParticipant.filterSearchForName()
      .pipe(
        switchMap(text => {
          this.participantsByName = [] as SntParticipantShortDto[]
          return this.sntClient.searchSntParticipantsByName(text, TopParticipantSearchByName)
            .pipe(
              finalize(() => { this.sntSearchParticipant.searchingParticipantsByName = false; }),
              takeUntil(this.unsubscribe$)
            );
        })
      )
      .subscribe(
        participant => this.participantsByName = participant,
        err => console.error(err)
      )
      if(this.mode !== SntActionMode.Show && this.mode !== SntActionMode.Correction)
        (this.countryFillable as IFilliable<CountryDto, string>).fillOut([this.favouriteCountries, this.countries])
      else 
        (this.countryFillable as IFilliableNonOption<CountryDto, string>).fillOut(this.countries)
  }

  onSellerNonResidentChange(checked: boolean): void{
    (this.draftSntForm.get('consignor.nonResident') as UntypedFormControl).setValue(checked, {
      onlySelf: true,
      emitEvent: false,
      emitModelToViewChange: false
    });
  }

  onSellerTinChanging(tin: string): void {
    (this.draftSntForm.get('consignor.tin') as UntypedFormControl).setValue(tin, {
      onlySelf: true,
      emitEvent: false,
      emitModelToViewChange: false
    });

  }

  onSellerNameChanging(name): void {
    (this.draftSntForm.get('consignor.name') as UntypedFormControl).setValue(name,{
      onlySelf: true,
      emitEvent: false,
      emitModelToViewChange: false
    })
  }

  onCountryCodeChanging(country: string) {
    (this.draftSntForm.get('consignor.countryCode') as UntypedFormControl).setValue(country,{
      onlySelf: true,
      emitEvent: false,
      emitModelToViewChange: false
    })
  }

  onParticipantSelected(participant: SntParticipantDto) {
    this.draftSntForm.get('seller').patchValue(participant);
    this.draftSntForm.get('consignor.countryCode').setValue(participant.countryCode);
    this.participantByTin = null;
    if(participant.taxpayerStoreId == null)
      SntSectionBValidators.DisableAndSetValueElement(this.draftSntForm.get('seller.taxpayerStoreId') as UntypedFormControl, null)
  }

  onParticipantSelectedByName(participant: SntParticipantShortDto) {
    this.draftSntForm.get('seller').patchValue(participant);
    this.draftSntForm.get('consignor.countryCode').setValue(participant.countryCode);
    SntSectionBValidators.DisableAndSetValueElement(this.draftSntForm.get('seller.taxpayerStoreId') as UntypedFormControl, null)
    this.participantsByName = [] as SntParticipantShortDto[]
  }

  onsharingAgreementParticipantChange(checked: boolean): void{    
    if (checked) {
      this.draftSntForm.get('seller.statuses').setValue([SntParticipantType.SHARING_AGREEMENT_PARTICIPANT], {
        onlySelf: true,
        emitEvent: false,
        emitModelToViewChange: false
      }); 
    } else {
      this.draftSntForm.get('seller.statuses').setValue(null, {
        onlySelf: true,
        emitEvent: false,
        emitModelToViewChange: false
      });
    }
    
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
