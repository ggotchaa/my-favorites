import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ArDraftsFilterModel } from './ar-drafts-filter.model';

@Component({
    selector: 'app-ar-drafts-filter',
    templateUrl: './ar-drafts-filter.component.html',
    styleUrls: ['./ar-drafts-filter.component.scss'],
    standalone: false
})
export class ArDraftsFilterComponent implements OnInit {
  filterForm: UntypedFormGroup;
  filterModel: ArDraftsFilterModel;
  @Output() filterOutput: EventEmitter<ArDraftsFilterModel> = new EventEmitter<ArDraftsFilterModel>();

  constructor() { }

  ngOnInit(): void {
    this.filterForm = new UntypedFormGroup({
      ownInvoices: new UntypedFormControl(false)
    });
    this.filterOutput.emit(this.filterForm.value as ArDraftsFilterModel);
  }

  filter() {
    this.filterModel = this.filterForm.value
    this.filterOutput.emit(this.filterModel);
  }
}
