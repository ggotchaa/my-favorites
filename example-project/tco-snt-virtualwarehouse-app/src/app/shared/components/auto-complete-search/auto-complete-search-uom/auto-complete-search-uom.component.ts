import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NgControl } from '@angular/forms';
import {ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MeasureUnitDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISearchable } from 'src/app/model/interfaces/ISearchable';
import { MeasureUnitSearchService } from 'src/app/shared/services/auto-complete-searches/measure-unit-search/measure-unit-search.service';
import { MeasureUnitFillableToken, MeasureUnitSearchToken } from 'src/app/shared/tokens/measure-unit-search.token';
@Component({
    selector: 'app-auto-complete-search-uom',
    templateUrl: './auto-complete-search-uom.component.html',
    styleUrls: ['./auto-complete-search-uom.component.scss'],
    providers: [
        {
            provide: MatFormFieldControl,
            useExisting: AutoCompleteSearchUOMComponent
        },
        {
            provide: MeasureUnitSearchToken,
            useClass: MeasureUnitSearchService,
        },
    ],
    standalone: false
})
export class AutoCompleteSearchUOMComponent implements OnInit, OnDestroy, MatFormFieldControl<any>, ControlValueAccessor {
  @ViewChild(MatInput, { read: ElementRef, static: true })
  input: ElementRef;
  static nextId = 0;
  filteredMeasureUnits$: Observable<any>
  searchTermMeasureUnit$ = new Subject<string>();

  
  private _value: number
  displayValueInput: string;
  private _errorState: boolean;
  @Input()
  set value(value: number) {
    this._value = value
    this.onChange(value)
    this.stateChanges.next();
  }
  get value() {
    return this._value;
  }
  stateChanges = new Subject<void>();

  @HostBinding()
  id: string = `auto-complete-search-uom-${AutoCompleteSearchUOMComponent.nextId}`;

  @HostBinding('attr.aria-describedby') describedBy = '';
  placeholder: string;
  focused: boolean;
  empty: boolean;
  shouldLabelFloat: boolean;
  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;

  private unsubscribe$: Subject<void> = new Subject();
  disabled: boolean;
  get errorState(): boolean{
    return this.errorMatcher.isErrorState(this.ngControl.control as UntypedFormControl, null)
  }
  
  controlType?: string;
  autofilled?: boolean;
  userAriaDescribedBy?: string;

  constructor(
    private focusMonitor: FocusMonitor,
    @Inject(MeasureUnitSearchToken) private measureUnitSearch: ISearchable<MeasureUnitDto,number>,
    @Optional() @Self() public ngControl: NgControl,
    @Inject(MeasureUnitFillableToken) private measureUnitFillable: IFilliable<MeasureUnitDto, number>,
    public errorMatcher: ErrorStateMatcher,
  ) {
    if (ngControl != null) {
      ngControl.valueAccessor = this;
    }
    this.filteredMeasureUnits$ = this.measureUnitSearch.filteredItems$
    this.searchTermMeasureUnit$ = this.measureUnitSearch.searchTermItems$;
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
  onToutch() {}
  writeValue(obj: any){   
    this.value = obj;
    const uom = this.measureUnitFillable.itemsLookUp.get(obj)
    this.displayValueInput = uom ? uom.name : ''
    this.stateChanges.next()
  }
  onSelected(val: number) {
    this.onChange(val)
  }
  onSearchChange(val: string) {
    if(val === "") this.ngControl.control.setValue('')
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
  displayFnMeasureUnit = (group: number): string => {
    return this.measureUnitFillable.displayFn(group);
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.input);
    this.stateChanges.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
