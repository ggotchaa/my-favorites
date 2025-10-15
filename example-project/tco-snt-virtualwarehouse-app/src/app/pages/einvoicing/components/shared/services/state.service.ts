import { Injectable } from "@angular/core";
import { FilterModel } from '../components/filter/filter.model';
import { ArReconciliationStatusesEnum } from 'src/app/model/enums/ArReconciliationStatusesEnum';

@Injectable({
    providedIn: 'root',
})

export class SearchParametersStateService {
    pageIndex: number;
    pageSize: number;
    filter: FilterModel<ArReconciliationStatusesEnum>;

    setPaginator(pageIndex: number = 1, pageSize: number = 15){
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
    }

    setFilter(filter: FilterModel<ArReconciliationStatusesEnum>){
        this.filter = filter
    }
}