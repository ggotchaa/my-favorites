import { AfterViewInit, Component, EventEmitter, Inject, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ApReconciliationStatusesEnum } from 'src/app/model/enums/ApReconciliationStatusesEnum';
import { ArReconciliationStatusesEnum } from 'src/app/model/enums/ArReconciliationStatusesEnum';
import { InvoiceModuleMode } from 'src/app/model/enums/InvoiceModuleTypes';
import { SelectedView } from 'src/app/model/interfaces/ISelectedView';
import { ApInvoiceTypes } from 'src/app/model/lists/Einvoicing/ApInvoiceTypes';
import { ArReconciliationStatuses } from 'src/app/model/lists/Einvoicing/ArReconciliationStatuses';
import { InvoiceCurrentModuleToken } from 'src/app/shared/tokens/invoice-current-module';
import { ApReconciliationStatuses } from '../../../../../../model/lists/Einvoicing/ApReconciliationStatuses';
import { ApManualReconciliationCommentType } from '../../../../../../model/lists/Einvoicing/ApManualReconciliationCommentType';
import { RendererService } from '../../services/renderer.service';
import { FilterModel } from './filter.model';
import { SearchParametersStateService } from 'src/app/pages/einvoicing/components/shared/services/state.service';

import { GetSuppliersResultDto } from 'src/app/api/GCPClient';
import { InvoiceStatuses } from 'src/app/model/lists/Einvoicing/InvoiceStatuses';
import { MatOption } from '@angular/material/core';
import { ReportSearchParametersStateService } from '../../services/report-search-parameters-state.service';

@Component({
    selector: 'app-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss'],
    standalone: false
})
export class FilterComponent implements OnInit, AfterViewInit {

  labelOrgName: string;
  invoiceStatus = InvoiceStatuses;
  filterForm: UntypedFormGroup;
  reconciliationStatuses: SelectedView[];
  manualReconciliationCommentType: SelectedView[];
  apInvoiceTypes : SelectedView[];
  selectedOrganization: GetSuppliersResultDto | null;
  filterModel: FilterModel<ArReconciliationStatusesEnum | ApReconciliationStatusesEnum>;
  selectedOptions: any;
  selectedOptionsCommentType: any;
  invoiceModuleMode = InvoiceModuleMode;

  @ViewChild('reconciliationStatusOptions') reconciliationStatusOptions: MatSelect
  @ViewChild('allSelected') private allSelected: MatOption;
  @ViewChild('allCommentTypeSelected') private allCommentTypeSelected: MatOption;
  @Output() filterOutput: EventEmitter<FilterModel<ArReconciliationStatusesEnum | ApReconciliationStatusesEnum>> = new EventEmitter<FilterModel<ArReconciliationStatusesEnum | ApReconciliationStatusesEnum>>();
  
  constructor(
    private rendererService: RendererService,
    private searchParametersStateService: SearchParametersStateService,
    @Inject(InvoiceCurrentModuleToken) public mode: InvoiceModuleMode,
    @Optional() private reportSearchParametersStateService: ReportSearchParametersStateService
  ) { 
    
      if(mode == InvoiceModuleMode.ARModule){
        this.reconciliationStatuses = ArReconciliationStatuses;
        this.labelOrgName='Customer Name';
      }else{
        this.reconciliationStatuses = ApReconciliationStatuses;
        this.apInvoiceTypes = ApInvoiceTypes;
        this.labelOrgName='Наименование поставщика';
        this.manualReconciliationCommentType = ApManualReconciliationCommentType
      }
}
  

  ngOnInit(): void {
   if(!this.getFromState()){
      let dateNow = new Date();
      let dateFrom = new Date();
  
      dateNow.toDateOnly();
      dateFrom.toDateOnly();
  
      dateFrom.setDate(dateNow.getDate() - 1);
  
      this.filterForm = new UntypedFormGroup({      
        number: new UntypedFormControl(''),
        registerNumber: new UntypedFormControl(),
        dateFrom: new UntypedFormControl(dateFrom),
        dateTo: new UntypedFormControl(dateNow),
        reconciliationStatus: new UntypedFormControl(),
        invoiceType: new UntypedFormControl(),
        orgautocomplete: new UntypedFormControl(),
        tin: new UntypedFormControl(),
        invoiceStatus: new UntypedFormControl(),
        manualReconciliationCommentType: new UntypedFormControl(),
        ownInvoices: new UntypedFormControl(false),
        isDrafts: new UntypedFormControl(false)
      });
    }
    this.filterOutput.emit(this.filterForm.value as FilterModel<ArReconciliationStatusesEnum | ApReconciliationStatusesEnum>);

    this.reportSearchParametersStateService.value = this.filterForm.value;

    this.filterForm.valueChanges.subscribe(() => {            
      this.reportSearchParametersStateService.value = this.filterForm.value;
    });
  }  

  ngAfterViewInit(): void {
    this.defineColoursForReconciliationStatuses();
  }

  /**
   * this method is intended to set up necessary colours for ReconciliationStatuses field depending on AR/AP
   */
  private defineColoursForReconciliationStatuses() {
    const reconciliationStatusOptions = this.reconciliationStatusOptions.options.toArray();
    reconciliationStatusOptions.forEach((opt, index) => {
      const htmlElement = opt._getHostElement();
      this.rendererService.defineColourForReconcilationStatusFilter(opt.value, htmlElement, this.mode, index - 1)
    });
  }
  select() {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
    }
    if (this.selectedOptions.length === this.invoiceStatus.length)
      this.allSelected.select();
    this.filterForm.get('invoiceStatus').setValue(this.selectedOptions);
  }
  selectAll() {
    if (this.allSelected.selected) {
      this.selectedOptions = [...this.invoiceStatus.map(status => status.value), this.allSelected.value];
    }
    else {
      this.selectedOptions = [];
    }
    this.filterForm.get('invoiceStatus').setValue(this.selectedOptions);
  }


  selectCommentType() {
    if (this.allCommentTypeSelected.selected) {
      this.allCommentTypeSelected.deselect();
    }
    if (this.selectedOptionsCommentType.length === this.manualReconciliationCommentType.length){
        this.allCommentTypeSelected.select();
    }
    this.filterForm.get('manualReconciliationCommentType').setValue(this.selectedOptionsCommentType);
  }
  
  selectAllCommentType() {
    if (this.allCommentTypeSelected.selected) {
      this.selectedOptionsCommentType = [...this.manualReconciliationCommentType.map(type => type.value), this.allCommentTypeSelected.value];
    }
    else {
      this.selectedOptionsCommentType = [];
    }
    this.filterForm.get('manualReconciliationCommentType').setValue(this.selectedOptionsCommentType);
  }

  filter() {
    //TODO refactor this,not creating tin component for this when emitinng filter model
    if(this.filterForm.get('registerNumber').value !== null){
      this.filterForm.get('registerNumber').setValue(this.filterForm.get('registerNumber').value.trim());
    }
    
    this.filterModel = this.filterForm.value
    if (this.selectedOptions?.includes('all')) {
      this.filterModel.invoiceStatus=this.selectedOptions.filter(status => status !== 'all')
    }

    if (this.selectedOptionsCommentType?.includes('all')) {
        this.filterModel.manualReconciliationCommentType=this.selectedOptionsCommentType.filter(type => type !== 'all')
    }
    this.filterOutput.emit(this.filterModel);
  }


  onOrgChanging(country:GetSuppliersResultDto) {
    this.selectedOrganization=country;
    if (this.selectedOrganization?.tin)
      this.filterForm.get('tin').setValue(this.selectedOrganization.tin)
    else 
      this.filterForm.get('tin').setValue('')
  }

  private getFromState(){ 
    if(this.searchParametersStateService.filter !== undefined && this.mode === InvoiceModuleMode.ARModule){
      this.filterForm = new UntypedFormGroup({      
        number: new UntypedFormControl(this.searchParametersStateService.filter.number),
        registerNumber: new UntypedFormControl(this.searchParametersStateService.filter.registerNumber),
        dateFrom: new UntypedFormControl(this.searchParametersStateService.filter.dateFrom),
        dateTo: new UntypedFormControl(this.searchParametersStateService.filter.dateTo),
        reconciliationStatus: new UntypedFormControl(this.searchParametersStateService.filter.reconciliationStatus),
        invoiceType: new UntypedFormControl(this.searchParametersStateService.filter.invoiceType),
        orgautocomplete: new UntypedFormControl(),
        tin: new UntypedFormControl(this.searchParametersStateService.filter.tin),
        invoiceStatus: new UntypedFormControl(),
        manualReconciliationCommentType: new UntypedFormControl(),
        ownInvoices: new UntypedFormControl(this.searchParametersStateService.filter.ownInvoices),
        isDrafts: new UntypedFormControl(this.searchParametersStateService.filter.isDrafts),
      });
      return true;
    }
  }
}


