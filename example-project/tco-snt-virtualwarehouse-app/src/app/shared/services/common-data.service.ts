import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, publishReplay, refCount, tap } from 'rxjs/operators';
import { CompanyOptions, CountryDto, CurrencyDto, DictionariesClient, MeasureUnitDto, TaxpayerStoreClient, TaxpayerStoreSimpleDto, TaxpayerStoreStatus, UserClient } from '../../api/GCPClient';
import { CommonDataServiceReplayBufferSize } from '../../model/GlobalConst';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {
  measureUnits: Observable<MeasureUnitDto[]>;
  favouriteMeasureUnits: Observable<MeasureUnitDto[]>;
  taxpayerStores: Observable<TaxpayerStoreSimpleDto[]>;
  userTaxpayerStores: Observable<TaxpayerStoreSimpleDto[]>;
  currencies: Observable<CurrencyDto[]>;
  favouriteCurrencies: Observable<CurrencyDto[]>
  countries: Observable<CountryDto[]>;
  favouriteCountries: Observable<CountryDto[]>

  companyProfile: Observable<CompanyOptions>;

  constructor(
    private dictionariesClient: DictionariesClient,
    private taxPayerApi: TaxpayerStoreClient,
    private userClient: UserClient 
  ) {}

  getCountries() {
    if(!this.countries) {
      this.countries = this.dictionariesClient.getCountries()
      .pipe(
        publishReplay(CommonDataServiceReplayBufferSize),
        refCount()
      )
    }
    return this.countries;
  }

  getFavouriteCountries() {
    if(!this.favouriteCountries) {
      this.favouriteCountries = this.dictionariesClient.getFavouriteCountries()
      .pipe(
        publishReplay(CommonDataServiceReplayBufferSize),
        refCount()
      )
    }
    return this.favouriteCountries;
  }

  getCurrencies() {
    if(!this.currencies) {
      this.currencies = this.dictionariesClient.getCurrencies()
      .pipe(
        publishReplay(CommonDataServiceReplayBufferSize),
        refCount()
      )
    }
    return this.currencies;
  }

  getFavouriteCurrencies() {
    if(!this.favouriteCurrencies) {
      this.favouriteCurrencies = this.dictionariesClient.getFavouriteCurrencies()
      .pipe(
        publishReplay(CommonDataServiceReplayBufferSize),
        refCount()
      )
    }
    return this.favouriteCurrencies;
  }

  getMeasureUnits() {
    if (!this.measureUnits) {
      this.measureUnits = this.dictionariesClient.getMeasureUnits()
        .pipe(
          map(m => m.sort(this.compareFnUom)),
          publishReplay(CommonDataServiceReplayBufferSize),
          refCount()
        )
    }
    return this.measureUnits;
  }

  getFavouriteMeasureUnits(){
    if(!this.favouriteMeasureUnits){
      this.favouriteMeasureUnits = this.dictionariesClient.getFavouriteMeasureUnits()
        .pipe(
          publishReplay(CommonDataServiceReplayBufferSize),
          refCount()
        )
    }
    return this.favouriteMeasureUnits;
  }

  getUserTaxpayerStores() {
    if (!this.userTaxpayerStores) {
      this.userTaxpayerStores = this.taxPayerApi.getUserTaxpayerStores()
        .pipe(
          publishReplay(CommonDataServiceReplayBufferSize),
          refCount()
        )
    }
    return this.userTaxpayerStores;
  }

  getValidUserTaxpayerStores(): Observable<TaxpayerStoreSimpleDto[]> {
    return this.getUserTaxpayerStores().pipe(
      map(stores => stores.filter(store => store.status === TaxpayerStoreStatus.VALID))
    );
  }

  getAllTaxpayerStores() {
    if (!this.taxpayerStores) {
      this.taxpayerStores = this.taxPayerApi.getAllTaxpayerStores()
        .pipe(
          publishReplay(CommonDataServiceReplayBufferSize),
          refCount()
        )
    }
    return this.taxpayerStores;
  }

  getValidAllTaxpayerStores(): Observable<TaxpayerStoreSimpleDto[]> {
    return this.getAllTaxpayerStores().pipe(
      map(stores => stores.filter(store => store.status === TaxpayerStoreStatus.VALID))
    );
  }

  getCompanyProfile() {
    if (!this.companyProfile) {
      this.companyProfile = this.userClient.getUserProfile()
        .pipe(
          map(userProfile => userProfile.company),
          publishReplay(CommonDataServiceReplayBufferSize),
          refCount()
        )
    }
    return this.companyProfile;
  }
  private compareFnUom = (a: MeasureUnitDto, b: MeasureUnitDto) => {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  };
}
