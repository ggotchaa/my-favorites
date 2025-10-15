import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GetRateResponseDto } from 'src/app/api/GCPClient';
import { CustomerCategory } from 'src/app/model/enums/CustomerCategory';
import { Utilities } from 'src/app/shared/helpers/Utils';
import { InvoiceFacade } from '../../../invoice.facade';
import { KztCurrencyCode } from 'src/app/model/GlobalConst';

@Component({
    selector: 'app-invoice-section-a',
    templateUrl: './invoice-section-a.component.html',
    styleUrls: ['./invoice-section-a.component.scss'],
    standalone: false
})
export class InvoiceSectionAComponent implements OnDestroy {

  @Input() draftInvoiceForm: UntypedFormGroup;

  @Output() onChangeTurnoverDate = new EventEmitter<boolean>();
  today = new Date();

  private unsubscribe$: Subject<void> = new Subject<void>();
  constructor(
    private facade: InvoiceFacade
  ) {

  }

  get registrationDate(): string {
    const date = this.draftInvoiceForm.get('date').value;
    if (!date)
      return '';

    const registrationDate = date as Date;
    if (registrationDate.getFullYear() > 1)
      return formatDate(registrationDate, 'dd.MM.yyyy', 'en');

    return '';
  }

  private get statusSellerFormControl(): UntypedFormControl {
    return this.draftInvoiceForm.get('seller.statuses') as UntypedFormControl;
  }

  private get currencyCodeFormControl(): UntypedFormControl {
    return this.draftInvoiceForm.get('currencyCode') as UntypedFormControl;
  }

  private get turnOverDateFormControl(): UntypedFormControl {
    return this.draftInvoiceForm.get('turnoverDate') as UntypedFormControl;
  }

  private get currencyRateFormControl(): UntypedFormControl {
    return this.draftInvoiceForm.get('currencyRate') as UntypedFormControl;
  }

  private get invoiceDateFormControl(): UntypedFormControl {
    return this.draftInvoiceForm.get('date') as UntypedFormControl;
  }

  private get invoiceRegNumFormControl(): UntypedFormControl {
    return this.draftInvoiceForm.get('regNum') as UntypedFormControl;
  }

  private isCanGetRate():  boolean {
    const isHasNecessaryStatusesForRate = (this.statusSellerFormControl.value as string[]).some(s =>
      s === CustomerCategory.SHARING_AGREEMENT_PARTICIPANT ||
      s === CustomerCategory.EXPORTER ||
      s === CustomerCategory.TRANSPORTER)
    const isNotKztInvoice = this.currencyCodeFormControl.value as string !== KztCurrencyCode;
    return (isHasNecessaryStatusesForRate || isNotKztInvoice) && !Utilities.isEmptyValue(this.currencyCodeFormControl.value as string) && !Utilities.isEmptyValue(this.turnOverDateFormControl.value as Date);
  }

  turnoverDateChanged($event) {
    //invoice.date is today`s date and cannot be changed by user
    let date = this.today;
    let turnOverDate = $event.value;
    let dayDiff = Utilities.getDatesDayDiff(date, turnOverDate);

    if (dayDiff < -15) {
      this.facade.displayWarning("Предупреждение=Дата выписки не соответствует дате совершения оборота по реализации.");
    }
    if(this.isCanGetRate()){
      this.onChangeTurnoverDate.emit(true);
      this.updateCurrencyRate()
      .pipe(
        takeUntil(this.unsubscribe$),
        //TODO when cancelled, call this.onChangeTurnoverDate.emit(false);
      )
      .subscribe(
        res => {
          if(res.isFound) {
            this.currencyRateFormControl.setValue(res.rate);
          }
          else {
            this.facade.displayWarning("Не удалось получить курс валюты.");
            this.currencyRateFormControl.setValue(null);
          }
          this.onChangeTurnoverDate.emit(false);
        },
        err => {
          this.facade.displayWarning(err)
          this.currencyRateFormControl.setValue(null);
          this.onChangeTurnoverDate.emit(false);
        }
      )
    }
  }

  private updateCurrencyRate(): Observable<GetRateResponseDto> {
    return this.facade.dictionaryClient.getRateByCurrencyAndDate(this.currencyCodeFormControl.value, this.turnOverDateFormControl.value, new Date().getTimezoneOffset() * -1);
  }

  canSaveAsDraft(){
    let valueDate = new Date(this.invoiceDateFormControl.value)
    return valueDate.dateIsActual();
  }
  
  public isSentInvoice(): boolean {
    return !Utilities.isEmptyValue(this.invoiceRegNumFormControl.value)
  }
  
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
