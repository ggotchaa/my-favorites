import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { InvoiceActionsDependenciesBase } from '../invoice-actions-base/invoice-actions-dependencies.base';
import { InvoiceActionMode, InvoiceActionModeNames } from 'src/app/model/enums/InvoiceActionMode';
import { InvoiceActionsBase } from '../invoice-actions-base/invoice-actions.base';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { AbstractInvoiceFormGroupFactory } from 'src/app/model/entities/Einvoicing/Factory/AbstractInvoiceFormGroupFactory';
import { InvoiceProductFormService } from 'src/app/pages/einvoicing/components/invoice/services/InvoiceProductFormService'
import { ArDraftInvoiceFormGroupCreator } from 'src/app/model/entities/Einvoicing/Factory/ArDraftInvoiceFormGroupFactory';
import { AwpWorksPerformedDto, GetSntProductBySntIdResponseDto } from 'src/app/api/GCPClient';
import { UntypedFormArray } from '@angular/forms';

@Component({
    selector: 'invoice-create',
    templateUrl: '../invoice-actions-base/invoice-actions.template.html',
    styleUrls: ['../invoice-actions-base/invoice-actions.style.scss'],
    providers: [
        InvoiceActionsDependenciesBase,
        {
            provide: 'MODE',
            useValue: InvoiceActionMode.Read
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

export class InvoiceReadComponent extends InvoiceActionsBase implements OnInit, OnDestroy {  

  private formGroupFactory: ArDraftInvoiceFormGroupCreator
  public mode: InvoiceActionMode
  constructor(
    public deps: InvoiceActionsDependenciesBase,
    private abstractFactory: AbstractInvoiceFormGroupFactory,
    ) {
    super(deps)
  }

  ngOnInit() {
    this.isLoading = true;
    this.deps.titleService.setTitle(InvoiceActionModeNames[2].name);
    this.esfInvoiceId = this.deps.route.snapshot.params['esfInvoiceId'];
    this.loadInformation()
      .pipe(
        switchMap(([countries, favouriteCountries, units, favouriteMeasureUnits, currencies, favouriteCurrencies]) => {
          this.countries = countries;
          this.favouriteCountries = favouriteCountries;
          this.measureUnits = units;
          this.favouriteMeasureUnits = favouriteMeasureUnits
          this.currencies = currencies;
          this.favouriteCurrencies = favouriteCurrencies;
          this.mode = InvoiceActionMode.Read
          return this.getInvoicesEsf(this.esfInvoiceId);
        }),
        tap(invoice => {
          this.setInvoiceValuesEsf(invoice,this.abstractFactory);
          this.isLoading = false;
        }),
        takeUntil(this.unsubscribe$)
        ).subscribe()
    this.deps.draftInvoiceForm.markAllAsTouched();

  }

  onAwpWorksPerformedChange(awpWorksPerformed: AwpWorksPerformedDto) {
    this.formGroupFactory = this.abstractFactory.arDraftInvoiceFormGroupFactory(this.measureUnits, this.deps.draftInvoiceForm)

    let productsArray = this.deps.draftInvoiceForm.get('products') as UntypedFormArray;
    productsArray.clear();

    this.formGroupFactory.setAwpWorksPerformed(awpWorksPerformed);

    this.sectionG.dataSource.data = [...productsArray.controls];
  }

  onSntProductsBySntIdChange(sntProductsbysntIdReponseDto: GetSntProductBySntIdResponseDto) {
    this.formGroupFactory = this.abstractFactory.arDraftInvoiceFormGroupFactory(this.measureUnits, this.deps.draftInvoiceForm)

    let productsArray = this.deps.draftInvoiceForm.get('products') as UntypedFormArray;
    productsArray.clear();

    this.formGroupFactory.setSntProductsSet(sntProductsbysntIdReponseDto);

    this.sectionG.dataSource.data = [...productsArray.controls]
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
