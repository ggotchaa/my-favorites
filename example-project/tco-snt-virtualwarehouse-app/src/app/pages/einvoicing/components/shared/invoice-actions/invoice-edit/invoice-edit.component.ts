import { Component, OnDestroy, OnInit } from '@angular/core';
import { InvoiceActionsDependenciesBase } from '../invoice-actions-base/invoice-actions-dependencies.base';
import { InvoiceActionMode, InvoiceActionModeNames } from 'src/app/model/enums/InvoiceActionMode';
import { InvoiceActionsBase } from '../invoice-actions-base/invoice-actions.base';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AwpWorksPerformedDto, GetRateResponseDto, GetSntProductBySntIdResponseDto, JdeArInvoiceDto } from '../../../../../../api/GCPClient';
import { KzCountry, KztCurrencyCode, USD } from 'src/app/model/GlobalConst';
import { Utilities } from 'src/app/shared/helpers/Utils';
import { AbstractInvoiceFormGroupFactory } from 'src/app/model/entities/Einvoicing/Factory/AbstractInvoiceFormGroupFactory';
import { InvoiceProductFormService } from 'src/app/pages/einvoicing/components/invoice/services/InvoiceProductFormService'
import { JdeInvoiceFormGroupCreatorBase } from 'src/app/model/entities/Einvoicing/Factory/JdeInvoiceFormGroupFactoryBase';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'invoice-create',
    templateUrl: '../invoice-actions-base/invoice-actions.template.html',
    styleUrls: ['../invoice-actions-base/invoice-actions.style.scss'],
    providers: [
        InvoiceActionsDependenciesBase,
        {
            provide: 'MODE',
            useValue: InvoiceActionMode.Edit
        },
        InvoiceProductFormService,
        {
            provide: AbstractInvoiceFormGroupFactory,
            useFactory: (invoiceProductInvoiceForm) => new AbstractInvoiceFormGroupFactory(invoiceProductInvoiceForm),
            deps: [InvoiceProductFormService]
        }
    ],
    standalone: false
})

export class InvoiceEditComponent extends InvoiceActionsBase implements OnInit, OnDestroy {

  constructor(
    public deps: InvoiceActionsDependenciesBase,
    private abstractFactory: AbstractInvoiceFormGroupFactory,
    private route: ActivatedRoute
  ) {
    super(deps);
  }

  ngOnInit() {
    this.isLoading = true;
    this.deps.titleService.setTitle(InvoiceActionModeNames[1].name);
    this.documentNumber = this.deps.route.snapshot.params['jdeNumber'];
    this.documentType = this.deps.route.snapshot.params['jdeType'];
    this.jdeInvoiceId = this.deps.route.snapshot.params['jdeInvoiceId'];
    this.loadInformation()
      .pipe(
        switchMap(([countries, favouriteCountries, units, favouriteMeasureUnits, currencies, favouriteCurrencies]) => {
          this.countries = countries;
          this.favouriteCountries = favouriteCountries;
          this.measureUnits = units;
          this.favouriteMeasureUnits = favouriteMeasureUnits
          this.currencies = currencies;
          this.favouriteCurrencies = favouriteCurrencies;
          return this.getInvoices(this.jdeInvoiceId, this.documentNumber, this.documentType);
        }),
        tap(invoice => {
          this.setInvoiceValues(invoice, this.abstractFactory);
          this.isLoading = false;
          this.registrationNumber = invoice.esfInvoiceFullDto?.registrationNumber;
          this.isMarineInvoice = invoice.jdeArF03B11DeliveryCondition === 'FOB' && invoice.jdeAddressBookCountry !== KzCountry;
        }),
        filter(invoice => {
          return this.isCanGetRate(invoice);
        }),
        switchMap((invoice) => {
          const currencyCode = invoice.jdeArF03B11CurrencyCodeFrom ?? invoice.esfInvoiceFullDto?.currencyCode;
          const turnoverDateFromJde = invoice.jdeArF03B11UserReservedDate ?? invoice.jdeSalesOrderDetailsTurnoverDate
          const turnoverDate = turnoverDateFromJde ?? invoice.esfInvoiceFullDto?.turnoverDate
          return this.getCurrencyRate(currencyCode, turnoverDate);
        }),
        takeUntil(this.unsubscribe$))
      .subscribe(
        (res: GetRateResponseDto) => {
          if (res.isFound) {
            this.currrencyRateSetable.setCurrencyRate(res.rate);
          } else {
            this.deps.facade.displayWarning('Не удалось получить курс валюты.');
          }
          this.sectionG.isLoadingCurrencyRate = false;
        },
        err => {
          this.deps.facade.displayErrors(err)
          this.sectionG.isLoadingCurrencyRate = false;
        }
      )
    this.deps.draftInvoiceForm.markAllAsTouched();

    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
        if (params['isSavedForSign'] === 'true') {
          this.isSavedForSign = true;
        }
      });
  }

  onAwpWorksPerformedChange(awpWorksPerformedDto: AwpWorksPerformedDto) {
    const arInvoiceFormGroupFactory = this.abstractFactory.getInstance();
    super.onAwpWorksPerformedChange(awpWorksPerformedDto, arInvoiceFormGroupFactory as JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto>);
    this.sectionG.isLoadingCurrencyRate = false;
  }

  onSntProductsBySntIdChange(sntProductsbysntIdReponseDto: GetSntProductBySntIdResponseDto) {
    const arInvoiceFormGroupFactory = this.abstractFactory.getInstance();
    super.onSntProductsBySntIdChange(sntProductsbysntIdReponseDto, arInvoiceFormGroupFactory as JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto>);

  }

  private isCanGetRate(invoice: JdeArInvoiceDto): boolean {
    if (!invoice.esfInvoiceFullDto) { //Jde
      const isTurnoverDateEmpty = Utilities.isEmptyValue(invoice.jdeArF03B11UserReservedDate) && Utilities.isEmptyValue(invoice.jdeSalesOrderDetailsTurnoverDate);
      const isKzCustomerWithUSD = invoice.jdeAddressBookCountry === KzCountry && invoice.jdeArF03B11CurrencyCodeFrom !== KztCurrencyCode && !isTurnoverDateEmpty;
      const isCanGetRate = (invoice.jdeAddressBookCountry != KzCountry && !Utilities.isEmptyValue(invoice.jdeArF03B11CurrencyCodeFrom) && !isTurnoverDateEmpty) || isKzCustomerWithUSD;
      return isCanGetRate
    }
    else { //Draft
      const isTurnoverDateEmpty = Utilities.isEmptyValue(invoice.esfInvoiceFullDto?.turnoverDate);
      const isSentInvoice = !Utilities.isEmptyValue(invoice.esfInvoiceFullDto?.registrationNumber)
      const isConvertedToKztDraftInvoice = isSentInvoice || invoice.esfInvoiceFullDto?.currencyCode !== KztCurrencyCode
      const isKzCustomerWithUSD = invoice.jdeAddressBookCountry === KzCountry && invoice.jdeArF03B11CurrencyCodeFrom !== KztCurrencyCode && !isTurnoverDateEmpty && isConvertedToKztDraftInvoice;
      const isCanGetRate = (invoice.jdeAddressBookCountry != KzCountry && !Utilities.isEmptyValue(invoice.jdeArF03B11CurrencyCodeFrom) && !isTurnoverDateEmpty) || isKzCustomerWithUSD;
      return isCanGetRate
    }
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
