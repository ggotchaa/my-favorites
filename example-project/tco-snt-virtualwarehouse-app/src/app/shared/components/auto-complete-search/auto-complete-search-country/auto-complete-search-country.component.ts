import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Optional, Output, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NgControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CountryDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISearchable } from 'src/app/model/interfaces/ISearchable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';
import { CountrySearchAmount } from 'src/app/model/lists/CountrySearchAmount';
import { CountryFilliableService } from 'src/app/shared/services/auto-complete-searches/country-search/country-filliable.service';
import { CountrySearchService } from 'src/app/shared/services/auto-complete-searches/country-search/country-search.service';
import { CountryFillableToken, CountrySearchToken } from 'src/app/shared/tokens/country-search.token';

@Component({
    selector: 'app-auto-complete-search-country',
    templateUrl: './auto-complete-search-country.component.html',
    styleUrls: ['./auto-complete-search-country.component.scss'],
    providers: [
        {
            provide: MatFormFieldControl,
            useExisting: AutoCompleteSearchCountryComponent
        },
        {
            provide: CountrySearchToken,
            useClass: CountrySearchService,
            multi: true
        },
        {
            provide: CountrySearchToken,
            useClass: CountrySearchService,
            multi: true
        },
    ],
    standalone: false
})
export class AutoCompleteSearchCountryComponent implements OnInit, OnDestroy, MatFormFieldControl<string>, ControlValueAccessor {
  @ViewChild(MatInput, { read: ElementRef, static: true })
  input: ElementRef;
  @Input() private countrySearchAmount: CountrySearchAmount

  @Output() private onSelectedEmitter = new EventEmitter<string>();
  displayInputText: string;
  private _value: string
  set value(value: string) {
    this._value = value
    this.onChange(value)
    this.stateChanges.next();
  }
  get value() {
    return this._value;
  }

  static nextId = 0;
  @HostBinding() id: string = `auto-complete-search-country-${AutoCompleteSearchCountryComponent.nextId}`;
  stateChanges = new Subject<void>();
  @HostBinding('attr.aria-describedby') describedBy = '';
  placeholder: string;
  focused: boolean;
  empty: boolean;
  shouldLabelFloat: boolean;
  required: boolean;
  disabled: boolean;

  private unsubscribe$: Subject<void> = new Subject();
  get errorState(): boolean{
    return this.errorMatcher.isErrorState(this.ngControl.control as UntypedFormControl, null)
  }
  controlType?: string;
  autofilled?: boolean;
  userAriaDescribedBy?: string;

  filtered$: Observable<any>
  searchTerm$: Subject<string> = new Subject<string>();

  constructor(
    @Inject(CountrySearchToken) @Self() private countrySearch: ISearchable<CountryDto,string>[],
    @Inject(CountryFillableToken) private countryFillable: IFilliable<CountryDto, string>,
    @Optional() @Self() public ngControl: NgControl,
    public errorMatcher: ErrorStateMatcher,
    private focusMonitor: FocusMonitor,
  ) { 
    if (ngControl != null) {
      ngControl.valueAccessor = this;
    }
    
  }
  

  ngOnInit(): void {
    switch(this.countrySearchAmount){
      case CountrySearchAmount.First:
        this.filtered$ = this.countrySearch[0].filteredItems$
        this.searchTerm$ = this.countrySearch[0].searchTermItems$
        break;
      case CountrySearchAmount.Second:
        this.filtered$ = this.countrySearch[1].filteredItems$
        this.searchTerm$ = this.countrySearch[1].searchTermItems$
        break;
      default: {
        throw new Error('The country search type isn\'t sepcified!')
      }
      
    }
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
  writeValue(obj: string): void {
    const country = this.countryFillable.itemsLookUp.get(obj)
    this.displayInputText = country ? country.name : ''
    this.stateChanges.next()
  }
  onSearchChange(val: string) {
    if(val === "") this.ngControl.control.setValue('')
  }
  onSelected(val: string) {
    this.ngControl.control.setValue(val)
    this.onChange(val)
    this.onSelectedEmitter.emit(val)
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

  displayFn = (group: string): string => {
    return this.countryFillable.displayFn(group)
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.input);
    this.stateChanges.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
