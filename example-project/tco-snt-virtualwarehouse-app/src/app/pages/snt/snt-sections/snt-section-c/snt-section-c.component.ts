import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { CountryDto, SntClient, SntParticipantDto, SntParticipantShortDto, TaxpayerStoreClient, TaxpayerStoreSimpleDto, TaxpayerStoreStatus } from 'src/app/api/GCPClient';
import { SntActionMode } from 'src/app/model/enums/SntActionMode';
import { COMPANY, TopParticipantSearchByName } from 'src/app/model/GlobalConst';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { CountryFillableNonOptionsService } from 'src/app/shared/services/auto-complete-searches/country-search/country-fillable-non-options.service';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';
import { CountryFillableToken } from 'src/app/shared/tokens/country-search.token';
import { SNTACTIONMODE } from 'src/app/shared/tokens/snt-action-mode.token';
import { SntParticipantSearchService } from '../../services/snt-participant-search.service';
import { SntSectionEValidators } from '../snt-section-e/snt-section-e.validators';
import { SntSectionsNames } from '../SntSectionsNames';

@Component({
    selector: 'app-snt-section-c',
    templateUrl: './snt-section-c.component.html',
    styleUrls: ['./snt-section-c.component.scss'],
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
export class SntSectionCComponent implements OnInit, OnDestroy {

  @Input() draftSntForm: UntypedFormGroup
  @Input() warehouses: TaxpayerStoreSimpleDto[]
  @Input() countries: CountryDto[]
  @Input() favouriteCountries: CountryDto[]
  participantByTin: SntParticipantDto;
  participantsByName: SntParticipantShortDto[];
  customerWarehouses: TaxpayerStoreSimpleDto[]

  sntSectionsNames = SntSectionsNames  

  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    public sntSearchParticipant: SntParticipantSearchService,
    private sntClient: SntClient,
    @Inject(CountryFillableToken) private countryFillable: IFilliable<CountryDto, string> | IFilliableNonOption<CountryDto, string>,
    @Inject(SNTACTIONMODE) public mode: SntActionMode,
    private taxpayerStoreClient: TaxpayerStoreClient
  ) {

  }

  ngOnInit(): void {
    const customerTin = this.draftSntForm.get('customer.tin').value;  
     
    this.loadWareshouseByTin(customerTin);
     
    this.draftSntForm.get('customer.taxpayerStoreId').valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(index => {
      if (index !== null) {
        const selectedWarehouse = this.customerWarehouses.find(warehouse => warehouse.id === index);
        const actualAddressControl = this.draftSntForm.get('customer.actualAddress') as UntypedFormControl;
        const shippingInfoControl = this.draftSntForm.get('shippingInfo');
    
        SntSectionEValidators.vehicleTransport(selectedWarehouse, shippingInfoControl);
            
        actualAddressControl.setValue(selectedWarehouse.address);        
      }
    });

    this.sntSearchParticipant.participantForm = this.draftSntForm.get('customer');
    this.sntSearchParticipant.filterSearchForTin()
      .pipe(
        switchMap(tin => {
          this.participantByTin = null;
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
    if (this.mode !== SntActionMode.Show && this.mode !== SntActionMode.Correction)
      (this.countryFillable as IFilliable<CountryDto, string>).fillOut([this.favouriteCountries, this.countries])
    else
      (this.countryFillable as IFilliableNonOption<CountryDto, string>).fillOut(this.countries)  
  }

  private loadWareshouseByTin(tin: any) {
    if (tin === COMPANY.tin) {
      this.customerWarehouses = this.warehouses;
    } else {
      let storesObservable = this.taxpayerStoreClient.getCustomerStoresByTin(tin);

      if(this.mode !== SntActionMode.Show && this.mode !== SntActionMode.Correction){
        storesObservable = storesObservable.pipe(
          map(stores => stores.filter(store => store.status === TaxpayerStoreStatus.VALID))
          );
        }
      
      storesObservable
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (stores) => {
            this.customerWarehouses = stores;
          }
      });
    }   
  }

  onCustomerNonResidentChange(checked: boolean): void {
    (this.draftSntForm.get('consignee.nonResident') as UntypedFormControl).setValue(checked, {
      onlySelf: true,
      emitEvent: false,
      emitModelToViewChange: false
    });
  }
  onCustomerTinChanging(tin): void {
    (this.draftSntForm.get('consignee.tin') as UntypedFormControl).setValue(tin, {
      onlySelf: true,
      emitEvent: false,
      emitModelToViewChange: false
    })    

    this.loadWareshouseByTin(tin);
  }

  onCustomerNameChanging(name): void {
    (this.draftSntForm.get('consignee.name') as UntypedFormControl).setValue(name, {
      onlySelf: true,
      emitEvent: false,
      emitModelToViewChange: false
    })
  }
  onCountryCodeChanging(country: string) {
    (this.draftSntForm.get('consignee.countryCode') as UntypedFormControl).setValue(country, {
      onlySelf: true,
      emitEvent: false,
      emitModelToViewChange: false
    })
  }

  onParticipantSelectedByTin(participant: SntParticipantDto) {
    this.draftSntForm.get('customer').patchValue(participant);
    this.draftSntForm.get('consignee.countryCode').setValue(participant.countryCode);
    this.draftSntForm.get('consignee.name').setValue(participant.name);
    this.participantByTin = null;
  }

  onParticipantSelectedByName(participant: SntParticipantShortDto) {
    this.draftSntForm.get('customer').patchValue(participant);
    this.draftSntForm.get('consignee.countryCode').setValue(participant.countryCode);
    this.participantsByName = [] as SntParticipantShortDto[];
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
