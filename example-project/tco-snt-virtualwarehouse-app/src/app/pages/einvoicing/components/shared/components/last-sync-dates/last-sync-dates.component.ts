import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { InvoiceCurrentModuleToken } from 'src/app/shared/tokens/invoice-current-module';
import { InvoiceModuleMode } from 'src/app/model/enums/InvoiceModuleTypes';
import { ArTableDataSource } from 'src/app/model/dataSources/EInvoicing/ArTableDataSource';
import { takeUntil } from 'rxjs';
import { InvoiceFacade } from '../../invoice.facade';
import { GetApLastUpdateDatesDto, GetArLastUpdateDatesDto } from 'src/app/api/GCPClient';

@Component({
    selector: 'app-last-sync-dates',
    templateUrl: './last-sync-dates.component.html',
    styleUrls: ['./last-sync-dates.component.scss'],
    standalone: false
})
  export class LastSyncDatesComponent implements OnInit {
    isLoading: boolean;
  constructor(
    public dataSource: ArTableDataSource,
    private invoiceFacade: InvoiceFacade,
    
    @Inject(InvoiceCurrentModuleToken) public mode: InvoiceModuleMode,
    ) { 
      this.dataSource.apiClient = this.invoiceFacade.jdeClient;
    }
    public lastUpdateDates = {jdeLastUpdateDate : null, jdeLastSyncDate : null, esfLastUpdateDate : null, esfLastSyncDate : null}
    ngOnInit(): void {
      this.getLastUpdatedDates();
    }

    private getLastUpdatedDates(){
      this.isLoading = true;
      let lastUpdatedDates;
      if (this.mode == InvoiceModuleMode.ARModule)
        lastUpdatedDates = this.dataSource.apiClient.getArLastUpdates()
      else
        lastUpdatedDates = this.dataSource.apiClient.getApLastUpdates()
      lastUpdatedDates.pipe(
          takeUntil(this.dataSource.subscription$)
        )
        .subscribe(
          res => {
            this.setFormatDate(res)
            this.isLoading = false;
          },
          err => {
            this.invoiceFacade.displayErrors(err)
            this.isLoading = false
          }
      );
    }

    private setFormatDate(res: GetArLastUpdateDatesDto | GetApLastUpdateDatesDto){
      let datePipe = new DatePipe('en-US')
      let format = 'dd/MM/yyyy HH:mm'
      let timeZone = 'UTC+5'
      this.lastUpdateDates.jdeLastUpdateDate = this.mode == InvoiceModuleMode.ARModule ? datePipe.transform((res as GetArLastUpdateDatesDto).jdeArLastUpdateDate, format, timeZone)
          : datePipe.transform((res as GetApLastUpdateDatesDto).jdeApLastUpdateDate, format, timeZone)
      this.lastUpdateDates.jdeLastSyncDate = this.mode == InvoiceModuleMode.ARModule ? datePipe.transform((res as GetArLastUpdateDatesDto).jdeArLastSyncDate, format, timeZone)
          : datePipe.transform((res as GetApLastUpdateDatesDto).jdeApLastSyncDate, format, timeZone)
      this.lastUpdateDates.esfLastUpdateDate = datePipe.transform(res.esfLastUpdateDate, format, timeZone)
      this.lastUpdateDates.esfLastSyncDate = datePipe.transform(res.esfLastSyncDate, format, timeZone)
    }
  }