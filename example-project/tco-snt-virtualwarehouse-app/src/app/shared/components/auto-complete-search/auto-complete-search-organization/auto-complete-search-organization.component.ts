import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Optional, Output, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NgControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { GetSuppliersResultDto } from 'src/app/api/GCPClient';
import { IFilliable } from 'src/app/model/interfaces/IFillable';
import { ISearchable } from 'src/app/model/interfaces/ISearchable';
import { ISelectGroup } from 'src/app/model/interfaces/ISelectGroup';
import { OrganizationSearchService } from 'src/app/shared/services/auto-complete-searches/organization-search/organization-search.service';
import { OrganizationFillableToken, OrganizationSearchToken } from 'src/app/shared/tokens/organization-search.token';

@Component({
    selector: 'app-auto-complete-search-organization',
    templateUrl: './auto-complete-search-organization.component.html',
    styleUrls: ['./auto-complete-search-organization.component.scss'],
    providers: [
        {
            provide: MatFormFieldControl,
            useExisting: AutoCompleteSearchOrganizationComponent
        },
        {
            provide: OrganizationSearchToken,
            useClass: OrganizationSearchService,
        }
    ],
    standalone: false
})
export class AutoCompleteSearchOrganizationComponent implements OnInit, OnDestroy, MatFormFieldControl<string>, ControlValueAccessor {
  @ViewChild(MatInput, { read: ElementRef, static: true })
  input: ElementRef;

  @Output() private onSelectedEmitter = new EventEmitter<GetSuppliersResultDto>();
  displayInputText: string;
  public _value: string
  set value(value: string) {
    this._value = value
    this.onChange(value)
    this.stateChanges.next();
  }
  get value() {
    return this._value;
  }

  static nextId = 0;
  @HostBinding() id: string = `auto-complete-search-organization-${AutoCompleteSearchOrganizationComponent.nextId}`;
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

  selectedOrganization: GetSuppliersResultDto | null;
  filtered$: Observable<any>
  searchTerm$: Subject<string> = new Subject<string>();
  @Input() label: string;

  constructor(
    @Inject(OrganizationSearchToken) @Self() private organizationSearch: ISearchable<GetSuppliersResultDto,string>,
    @Inject(OrganizationFillableToken) private organizationFillable: IFilliable<GetSuppliersResultDto, string>,
    @Optional() @Self() public ngControl: NgControl,
    public errorMatcher: ErrorStateMatcher,
    private focusMonitor: FocusMonitor,
  ) { 
    if (ngControl != null) {
      ngControl.valueAccessor = this;
    }
    
  }
  

  ngOnInit(): void {
    this.filtered$ = this.organizationSearch.filteredItems$;
    this.searchTerm$ = this.organizationSearch.searchTermItems$;
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

  onChange(_val: any) {
    console.log("onChange "+_val);
  }
  onToutch: () => void;
  writeValue(obj: any): void {
    const org = this.organizationFillable.itemsLookUp.get(obj?.name);
    this.displayInputText = org ? org.name : ''
    this.stateChanges.next();
  }
  
  onSearchChange(val: string) {
    if(val === "") this.ngControl.control.setValue('')
  }
  onSelected(val: GetSuppliersResultDto) {
    this.selectedOrganization=val;
    this.ngControl.control.setValue(val);
    this.onChange(val);
    this.onSelectedEmitter.emit(val);
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

  displayFn = (group: GetSuppliersResultDto): string => {
    return this.organizationFillable.displayFn(group.name)
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.input);
    this.stateChanges.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  
  
  /**
  * this method clears text and organization object (selectedOrganization)
  */
  cleanOrganizationSelect() {
    this.ngControl.control.setValue('');
    this.selectedOrganization=null;
    this.input.nativeElement.value="";
    this.onChange(this.selectedOrganization);
    this.onSelectedEmitter.emit(this.selectedOrganization);
  }

  /**
  * this method clears text if organization not select via drop down list
  */
  onOrgNameChanging(val:any): void {
    this.selectedOrganization=null;
    this.input.nativeElement.value="";
    this.onChange(this.selectedOrganization);
    this.onSelectedEmitter.emit(this.selectedOrganization);
  }


  
}
