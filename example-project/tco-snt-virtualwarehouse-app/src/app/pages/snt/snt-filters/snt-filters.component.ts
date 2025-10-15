import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SntCategories } from '../../../model/lists/SntCategories';
import { SntStatuses } from '../../../model/lists/SntStatuses';

import { SntTypes } from '../../../model/lists/SntTypes';
import { SntFilter } from './snt-filters.model';
import { SntFilterExportTypes } from '../../../model/lists/SntExportTypes'
import { SntType } from '../../../api/GCPClient';
import { SntFilterImportTypes } from '../../../model/lists/SntImportTypes';
import { SntFilterTransferTypes } from '../../../model/lists/SntTransferTypes';
import { MatOption } from '@angular/material/core';

@Component({
    selector: 'app-snt-filters',
    templateUrl: './snt-filters.component.html',
    standalone: false
})
export class SntFiltersComponent{
  types = SntTypes;
  exportTypes = SntFilterExportTypes;
  importTypes = SntFilterImportTypes;
  transferTypes = SntFilterTransferTypes;
  statuses = SntStatuses;
  categories = SntCategories;
  selectedOptions: any;

  model = this.generateFilter() === null ? new SntFilter() : this.generateFilter();
  @Output() sntFilterEvent = new EventEmitter<SntFilter>();  
  @ViewChild('allSelected') private allSelected: MatOption;
  
  get isImportTypeSelected(): boolean {
    return this.model.type === SntType.PRIMARY_SNT;
  }

  get isExportTypeSelected(): boolean {
    return this.model.type === "EXPORT_SNT";
  }

  get isTransferTypeSelected(): boolean {
    return this.model.type === "MOVEMENT_SNT";
  }
  generateFilter(){
    let sntFilter = JSON.parse(sessionStorage.getItem('snt-filter'))
    if(sntFilter === 'undefined' || sntFilter === null)
      return null;
    else {
      sntFilter.dateFrom = new Date(sntFilter.dateFrom)
      sntFilter.dateTo = new Date(sntFilter.dateTo)
      return sntFilter as SntFilter;
    }
  }

  select(){
    if(this.allSelected.selected){
        this.allSelected.deselect();
      }
      if(this.selectedOptions.length === this.statuses.length)
      this.allSelected.select();
      this.model.statuses = this.selectedOptions;
    }
  
    selectAll(){
      if(this.allSelected.selected){
        this.selectedOptions = [...this.statuses.map(status => status.value), this.allSelected.value];
      }
      else{
        this.selectedOptions = [];
      }
    }

  onSubmit() {
    this.model.statuses = this.selectedOptions;
    if (this.model.statuses?.includes('all')) {
      this.model.statuses = this.selectedOptions.filter(status => status !== 'all');
    }
    sessionStorage.setItem('snt-filter', JSON.stringify(this.model))
    this.sntFilterEvent.emit(this.model);
  }

  onReset(form: NgForm) {
    sessionStorage.clear();
    form.reset();
    form.controls['type'].setValue('');
    form.controls['status'].setValue('');
    form.controls['category'].setValue('');
  }
}
