import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, HostBinding, Inject, OnDestroy, OnInit, Optional, Output, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NgControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CurrencyDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { IFilliableNonOption } from 'src/app/model/interfaces/IFillableNonOption';
import { ISearchable } from 'src/app/model/interfaces/ISearchable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';
import { CurrencyFillableService } from 'src/app/shared/services/auto-complete-searches/currency-search/currency-fillable.service';
import { CurrencySearchService } from 'src/app/shared/services/auto-complete-searches/currency-search/currency-search.service';
import { CurrencyFillableToken, CurrencySearchToken } from 'src/app/shared/tokens/currency-search.token';


@Component({
    selector: 'app-auto-complete-search-currency',
    templateUrl: './auto-complete-search-currency.component.html',
    styleUrls: ['./auto-complete-search-currency.component.scss'],
    providers: [
        {
            provide: MatFormFieldControl,
            useExisting: AutoCompleteSearchCurrencyComponent
        },
        {
            provide: CurrencySearchToken,
            useClass: CurrencySearchService
        }
    ],
    standalone: false
})
export class AutoCompleteSearchCurrencyComponent implements OnInit, OnDestroy, MatFormFieldControl<any>, ControlValueAccessor {
  @ViewChild(MatInput, { read: ElementRef, static: true })
  input: ElementRef;

  @Output() selectionEmitted = new EventEmitter<CurrencyDto>();

  @Output() onClicked = new EventEmitter<CurrencyDto>();


  private _value: string
  set value(value: string) {
    this._value = value
  }
  get value() {
    return this._value;
  }
  static nextId = 0;

  filtered$: Observable<any>
  searchTerm$ = new Subject<string>();
  stateChanges = new Subject<void>();
  @HostBinding()
  id: string = `auto-complete-search-currency-${AutoCompleteSearchCurrencyComponent.nextId}`;

  @HostBinding('attr.aria-describedby') describedBy = '';
  placeholder: string;
  focused: boolean;
  empty: boolean;
  shouldLabelFloat: boolean;
  required: boolean;
  disabled: boolean;
  get errorState(): boolean{
    return this.errorMatcher.isErrorState(this.ngControl.control as UntypedFormControl, null)
  }
  controlType?: string;
  autofilled?: boolean;
  userAriaDescribedBy?: string;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    @Inject(CurrencySearchToken) private currencySearch: ISearchable<CurrencyDto,string>,
    @Inject(CurrencyFillableToken) private currencyFillable: IFilliable<CurrencyDto, string>,
    @Optional() @Self() public ngControl: NgControl,
    public errorMatcher: ErrorStateMatcher,
    private focusMonitor: FocusMonitor,
  ) { 
    if (ngControl != null) {
      ngControl.valueAccessor = this;
    }
    this.filtered$ = this.currencySearch.filteredItems$
    this.searchTerm$ = this.currencySearch.searchTermItems$;
  }
  
  
  ngOnInit(): void {
    this.focusMonitor.monitor(this.input)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((focused) => {
        this.focused = !!focused;
        this.stateChanges.next();
      });

    this.focusMonitor
      .monitor(this.input)
      .pipe(
        take(1),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.onToutch();
    });
  }
  onChange(_val: any) {}
  onToutch: () => void;
  onSearchChange(val: string) {
    if(val === "") this.ngControl.control.setValue('')
  }
  writeValue(obj: string): void {
    this.value = obj;
    
    const currency = this.currencyFillable.itemsLookUp.get(obj);

    if(currency) this.selectionEmitted.emit(currency);

    this.stateChanges.next();
  }

  onSelected(val: string) {
    this.onChange(val)
    this.ngControl.control.setValue(val);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onToutch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next()
  }
 
  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }
  onContainerClick(_event: MouseEvent): void {
  }

  onOptionClicked(val: CurrencyDto){
    this.selectionEmitted.emit(val);
    this.onClicked.emit(val);
  }
  displayFn = (group: string): string => {
    return this.currencyFillable.displayFn(group);
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.input);
    this.stateChanges.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
