import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NotificationFilterModel } from './allnotification-filters.model';
import { Subject } from 'rxjs';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { NotificationDocumentTypes } from 'src/app/model/lists/Notification/NotificationDocumentTypes';
import { NotificationActionTypes } from 'src/app/model/lists/Notification/NotificationActionTypes';

@Component({
    selector: 'app-allnotification-filters',
    templateUrl: './allnotification-filters.component.html',
    styleUrls: ['./allnotification-filters.component.scss'],
    standalone: false
})
export class AllnotificationFiltersComponent {
  filterForm: UntypedFormGroup;
  model = new NotificationFilterModel();
  documentType = NotificationDocumentTypes;
  actionType = NotificationActionTypes;

  @ViewChild('allDocTypesSelected') private allDocTypesSelected: MatOption;
  @ViewChild('allActionTypesSelected') private allActionTypesSelected: MatOption;
  
  @Output() notificationsFilterEvent =
    new EventEmitter<NotificationFilterModel>();

  constructor() {}

  selectDocType() {
    if (this.allDocTypesSelected.selected) {
      this.allDocTypesSelected.deselect();
    }
    if (this.model.documentTypes.length === this.documentType.length)
      this.allDocTypesSelected.select();
    this.filterForm.get('documentType').setValue(this.model.documentTypes);
  }

  selectAllDocType() {
    if (this.allDocTypesSelected.selected) {
      this.model.documentTypes = [
        ...this.documentType.map((item) => item.value),
        this.allDocTypesSelected.value,
      ];
    } else {
      this.model.documentTypes = [];
    }
    this.filterForm.get('documentType').setValue(this.model.documentTypes);
  }

  selectActionType() {
    if (this.allActionTypesSelected.selected) {
      this.allActionTypesSelected.deselect();
    }
    if (this.model.actionTypes.length === this.actionType.length)
      this.allActionTypesSelected.select();
    this.filterForm.get('actionType').setValue(this.model.actionTypes);
  }

  selectAllActionType() {
    if (this.allActionTypesSelected.selected) {
      this.model.actionTypes = [
        ...this.actionType.map((item) => item.value),
        this.allActionTypesSelected.value,
      ];
    } else {
      this.model.actionTypes = [];
    }
    this.filterForm.get('actionType').setValue(this.model.actionTypes);
  }

  onSubmit() {
    this.notificationsFilterEvent.emit(this.model);
  }

  onReset(form: NgForm) {
    form.reset();
    this.notificationsFilterEvent.emit(this.model);
  }
}
