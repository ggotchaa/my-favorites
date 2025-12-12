import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiEndpointService } from '../../../../core/services/api.service';
import {
  CustomersBiddingDataRequestDto,
  CustomersBiddingDataRequestBaseDto,
  CustomersListDto,
  CustomersListDtoPagedResult,
  FilterDescriptor,
  SortDescriptor,
} from '../../../../core/services/api.types';
import { CustomerListFilters, CustomerListRow, ProductSegment } from '../customer-list.models';
import { PaginationInfo } from '../../../../shared/components/pagination/pagination.component';
import { PaginationState, SortState, FilterOperatorValue } from '../../../../shared/utils/query-models';
import { CustomerListUtils } from '../customer-list.utils';

export interface CustomerListData {
  rows: CustomerListRow[];
  paginationInfo: PaginationInfo;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerListDataService {
  private readonly apiEndpoints = inject(ApiEndpointService);

  searchCustomers(
    filters: CustomerListFilters,
    pagination: PaginationState,
    sort: SortState,
    productSegment: ProductSegment
  ): Observable<CustomerListData> {
    const payload = this.buildSearchPayload(filters, pagination, sort, productSegment);

    return this.apiEndpoints.searchCustomers(payload).pipe(
      map(response => this.mapCustomerListData(response)),
      catchError(error => {
        console.error('Failed to load customers', error);
        return of<CustomerListData>({
          rows: [],
          paginationInfo: {
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            totalCount: 0,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false,
          },
        });
      })
    );
  }

  exportCustomers(
    filters: CustomerListFilters,
    sort: SortState,
    productSegment: ProductSegment
  ): Observable<Blob> {
    const payload = this.buildExportPayload(filters, sort, productSegment);
    return this.apiEndpoints.exportCustomers(payload);
  }

  private buildSearchPayload(
    filters: CustomerListFilters,
    pagination: PaginationState,
    sort: SortState,
    productSegment: ProductSegment
  ): CustomersBiddingDataRequestDto {
    return {
      ...this.buildBasePayload(filters, sort, productSegment),
      paging: {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        includeTotal: true,
        all: false
      },
    };
  }

  private buildExportPayload(
    filters: CustomerListFilters,
    sort: SortState,
    productSegment: ProductSegment
  ): CustomersBiddingDataRequestBaseDto {
    return this.buildBasePayload(filters, sort, productSegment);
  }

  private buildBasePayload(
    filters: CustomerListFilters,
    sort: SortState,
    productSegment: ProductSegment
  ): CustomersBiddingDataRequestBaseDto {
    const filterDescriptors = this.buildFilterDescriptors(filters, productSegment);
    const sortDescriptors = this.buildSortDescriptors(sort);

    return {
      filter: filterDescriptors.length ? filterDescriptors : undefined,
      sorting: sortDescriptors.length ? sortDescriptors : undefined
    };
  }

  private buildFilterDescriptors(filters: CustomerListFilters, productSegment: ProductSegment): FilterDescriptor[] {
    const descriptors: FilterDescriptor[] = [];

    this.addMultiSelectFilter(descriptors, 'Bidder', filters.multipleCustomers);
    this.addMultiSelectFilter(descriptors, 'Status', filters.status);
    this.addMultiSelectFilter(descriptors, 'Month', filters.month);
    this.addYearFilter(descriptors, filters.year);

    this.addRangeFilter(descriptors, 'RollingLiftFactor', filters.rangeFrom, filters.rangeTo);

    this.addContainsFilter(descriptors, 'Bidder', filters.bidderSearch);

    this.addProductSegmentFilter(descriptors, productSegment);

    return descriptors;
  }

  private addMultiSelectFilter(descriptors: FilterDescriptor[], field: string, values: string[]): void {
    if (!values || !values.length) return;

    const uniqueValues = Array.from(new Set(values));
    descriptors.push({
      field,
      operator: FilterOperatorValue.In,
      values: uniqueValues
    });
  }

  private addYearFilter(descriptors: FilterDescriptor[], years: (string | number)[]): void {
    if (!years || !years.length) return;

    const uniqueYears = Array.from(new Set(years.map(y => String(y))));
    descriptors.push({
      field: 'Year',
      operator: FilterOperatorValue.In,
      values: uniqueYears
    });
  }

  private addRangeFilter(
    descriptors: FilterDescriptor[],
    field: string,
    from: string,
    to: string
  ): void {
    const hasFrom = String(from ?? '').trim() !== '';
    const hasTo = String(to ?? '').trim() !== '';

    if (!hasFrom || !hasTo) return;

    const parsedFrom = Number(from);
    const parsedTo = Number(to);

    if (!Number.isFinite(parsedFrom) || !Number.isFinite(parsedTo)) return;

    descriptors.push({
      field,
      operator: FilterOperatorValue.Between,
      values: [parsedFrom, parsedTo]
    });
  }

  private addContainsFilter(descriptors: FilterDescriptor[], field: string, value: string): void {
    if (!value) return;

    descriptors.push({
      field,
      operator: FilterOperatorValue.Contains,
      value: value
    });
  }

  private addProductSegmentFilter(descriptors: FilterDescriptor[], productSegment: ProductSegment): void {
    const productValue = CustomerListUtils.getProductSegmentFilterValue(productSegment);
    if (!productValue) return;

    descriptors.push({
      field: 'Product',
      operator: FilterOperatorValue.Equals,
      value: productValue
    });
  }

  private buildSortDescriptors(sort: SortState): SortDescriptor[] {
    if (!sort.field || sort.direction == null) return [];
    return [{ field: sort.field, direction: sort.direction }];
  }

  private mapCustomerRow(dto: CustomersListDto): CustomerListRow {
    return {
      bidder: dto.bidder ?? "",
      product: dto.product ?? "",
      status: dto.status ?? "",
      month: dto.month ?? "",
      year: dto.year ?? null,
      bidVolume: dto.bidVolume ?? null,
      bidPrice: dto.bidPrice ?? null,
      finalAwardedVolume: dto.finalAwardedVolume ?? null,
      volumeTaken: dto.volumeTaken ?? null,
      additionalVolume: dto.additionalVolume ?? null,
      rollingLiftFactor: dto.rollingLiftFactor ?? null,
      comments: dto.comments ?? "",
    };
  }

  private mapCustomerListData(response: CustomersListDtoPagedResult): CustomerListData {
    return {
      rows: (response.items ?? []).map(item => this.mapCustomerRow(item)),
      paginationInfo: {
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPrevious: response.hasPrevious,
        hasNext: response.hasNext,
      },
    };
  }
}
