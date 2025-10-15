import { Injectable } from '@angular/core';
import { ReportFilterModel } from '../components/filter/filter.model';
import { ApReconciliationStatusesEnum } from 'src/app/model/enums/ApReconciliationStatusesEnum';

@Injectable()

export class ReportSearchParametersStateService {
  private _filter: ReportFilterModel<ApReconciliationStatusesEnum>;
  
  get value(): ReportFilterModel<ApReconciliationStatusesEnum> {
    return this._filter;
  }

  set value(newValue: ReportFilterModel<ApReconciliationStatusesEnum>) {
    this._filter = newValue;
  }
}