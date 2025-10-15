import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { InvoiceActionsDependenciesBase } from '../invoice-actions-base/invoice-actions-dependencies.base';
import { InvoiceActionMode, InvoiceActionModeNames } from 'src/app/model/enums/InvoiceActionMode';
import { InvoiceActionsBase } from '../invoice-actions-base/invoice-actions.base';
import { finalize, takeUntil } from 'rxjs/operators';
import { AwpWorksPerformedDto, GetSntProductBySntIdResponseDto } from 'src/app/api/GCPClient';
import { ArDraftInvoiceFormGroupCreator } from 'src/app/model/entities/Einvoicing/Factory/ArDraftInvoiceFormGroupFactory';
import { UntypedFormArray } from '@angular/forms';
import { AbstractInvoiceFormGroupFactory } from 'src/app/model/entities/Einvoicing/Factory/AbstractInvoiceFormGroupFactory';
import { InvoiceProductFormService } from '../../../invoice/services/InvoiceProductFormService';

@Component({
    selector: 'invoice-create',
    templateUrl: '../invoice-actions-base/invoice-actions.template.html',
    styleUrls: ['../invoice-actions-base/invoice-actions.style.scss'],
    providers: [
        InvoiceActionsDependenciesBase,
        {
            provide: 'MODE',
            useValue: InvoiceActionMode.Add
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

export class InvoiceCreateComponent extends InvoiceActionsBase implements OnInit, OnDestroy {

  private formGroupFactory: ArDraftInvoiceFormGroupCreator

  constructor(
    private abstractFactory: AbstractInvoiceFormGroupFactory,
    public deps: InvoiceActionsDependenciesBase
    ) {
    super(deps)
  }

  ngOnInit() {    
    this.isLoading = true;

    this.deps.titleService.setTitle(InvoiceActionModeNames[0].name);
    this.loadInformation()
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.unsubscribe$))
      .subscribe(
          ([countries, favouriteCountries, units, favouriteMeasureUnits, currencies, favouriteCurrencies]) => {          
              this.countries = countries;
              this.favouriteCountries = favouriteCountries;
              this.measureUnits = units;
          this.favouriteMeasureUnits = favouriteMeasureUnits
          this.currencies = currencies;
          this.favouriteCurrencies = favouriteCurrencies;          
        });
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
