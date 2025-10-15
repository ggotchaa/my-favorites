import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { SntFilterDto } from 'src/app/model/entities/Snt/SntFilterDto';
import { AwpFilter } from 'src/app/model/entities/Awp/AwpFilter';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'app-product-select-egp-table',
    templateUrl: './product-select-egp-table.component.html',
    styleUrls: ['./product-select-egp-table.component.scss'],
    standalone: false
})
export class ProductSelectEgpTableComponent {

  displayedColumns: string[] = ['registrationNumber', 'number', 'approvedDate', 'senderTin', 'customerTin', 'truName', 'status', 'egpStatus'];
  data: any[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  @Output() onItemSelected = new EventEmitter<any>();

  selection = new SelectionModel<any>(true, []);


  filter(_filterDto: AwpFilter) {
    throw new Error('Not implemented')
  }

  select() {
    if (this.selection.selected.length > 0) {
      this.onItemSelected.emit(this.selection.selected[0]);
    }
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return of([]);
        }),
        map((data: any[]) => {
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          this.resultsLength = data.length;
          return data;
        })
      ).subscribe(data => this.data = data);
  }

}
