import { Component, Inject, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { TaxpayerStoreClient, TaxpayerStoreSimpleDto } from 'src/app/api/GCPClient';
import { DataSourceBaseEntity } from 'src/app/model/DataSourceBaseEntity';
import { TaxpayerStoreStatus } from 'src/app/model/enums/TaxPayerStoreStatus';
import { StoreType } from 'src/app/model/enums/StoreType';
import { SelectedView } from 'src/app/model/interfaces/ISelectedView';
import { CommonUpdateValuesService } from 'src/app/services/commonUpdateValues.service';
import { WarehouseTableDataSource } from 'src/app/model/dataSources/WarehouseTableDataSource';

//TODO move to entities folder
const REORGANIZED : SelectedView[] = [
  {value: "true",viewValue: "Да"},
  {value: "false",viewValue: "Нет"}
];
const WAREHOUSESUDSS : SelectedView[] = [
  {value: "true",viewValue: "Да"},
  {value: "false",viewValue: "Нет"}
];
const STATUSES : SelectedView[] = [
  {value: "Active",viewValue: "Активно"},
  {value: "Inactive",viewValue: "Неактивно"}
];

@Component({
    selector: 'app-warehouse',
    templateUrl: './warehouse.component.html',
    styleUrls: ['./warehouse.component.scss'],
    providers: [
        WarehouseTableDataSource,
        { provide: 'loading', useValue: true },
    ],
    standalone: false
})

export class WarehouseComponent implements OnInit {
  menuItems: any[];
  filterForm: UntypedFormGroup;
  displayedColumns: string[] = ["name",'externalId',"warehouseTypeCode",
  "status","address","isDefault","isPostingGoods","isInherited","isJointStore","isCooperativeStore","isRawMaterials", 'responsiblePersonIin'];
  reorginized = REORGANIZED;
  warehouseUDSs = WAREHOUSESUDSS;
  statuses = STATUSES;
  public get TaxpayerStoreStatus(): typeof TaxpayerStoreStatus {
    return TaxpayerStoreStatus;
  }

  public get TaxpayerStoreType(): typeof StoreType {
    return StoreType;
  }

  constructor(
    taxPayerApi: TaxpayerStoreClient, 
    private formBuilder: UntypedFormBuilder, 
    private commonValuesService: CommonUpdateValuesService,
    private titleService: Title,
    public dataSource: WarehouseTableDataSource) {
      this.dataSource.apiClient = taxPayerApi;
      this.titleService.setTitle('Склады');
  }
  

  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      warehouseName: [],
      reorganizedWarehousePerson: [],
      warehouseUDS:[],
      statusWarehouse: []
    });
    this.dataSource.loadSubjects()
      .pipe(takeUntil(this.dataSource.subscription$))
      .subscribe((data) => {
        this.dataSource.dataSourceSubjects.next(data);
      });
  }

  public yesNoFromBoolean(boolValue){
    return this.commonValuesService.yesNoFromBoolean(boolValue);
  }
  submit() {
    if (!this.filterForm.valid) {
      return;
    }
  }
}

