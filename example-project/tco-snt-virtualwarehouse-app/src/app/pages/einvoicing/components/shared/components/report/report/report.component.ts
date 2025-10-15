import { Component, Inject } from '@angular/core';
import { InvoiceFacade } from '../../../invoice.facade';
import { finalize } from 'rxjs';
import * as fileSaver from 'file-saver';
import { ReportSearchParametersStateService } from '../../../services/report-search-parameters-state.service';
import { InvoiceCurrentModuleToken } from 'src/app/shared/tokens/invoice-current-module';
import { InvoiceModuleMode } from 'src/app/model/enums/InvoiceModuleTypes';
import { ApReconciliationStatusesEnum } from 'src/app/model/enums/ApReconciliationStatusesEnum';
import { ArReconciliationStatusesEnum } from 'src/app/model/enums/ArReconciliationStatusesEnum';
import { FilterModel, ReportFilterModel } from '../../filter/filter.model';
import { ApReconciliationStatusesAdapter } from 'src/app/model/entities/Einvoicing/Adapters/ApReconciliationStatusesAdapter';
import { ArReconciliationStatusesAdapter } from 'src/app/model/entities/Einvoicing/Adapters/ArReconciliationStatusesAdapter';
import { ApInvoiceTypesAdapter } from 'src/app/model/entities/Einvoicing/Adapters/ApInvoiceTypesAdapter';
import { SearchParametersStateService } from '../../../services/state.service';

@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.scss'],
    standalone: false
})
export class ReportComponent {
  loadingReport = false;

  private apReconciliationStatusesAdapter: ApReconciliationStatusesAdapter;
  private arReconciliationStatusesAdapter: ArReconciliationStatusesAdapter;

  private apInvoiceTypesAdapter: ApInvoiceTypesAdapter;

  constructor(
    private invoiceFacade: InvoiceFacade,
    private reportSearchParametersStateService: ReportSearchParametersStateService,
    private searchParametersStateService: SearchParametersStateService,
    @Inject(InvoiceCurrentModuleToken) public mode: InvoiceModuleMode
  ) {
    this.apReconciliationStatusesAdapter = new ApReconciliationStatusesAdapter();
    this.arReconciliationStatusesAdapter = new ArReconciliationStatusesAdapter();
    this.apInvoiceTypesAdapter = new ApInvoiceTypesAdapter();
  }

  private getApSoMatchReport(
    filter: ReportFilterModel<ApReconciliationStatusesEnum>
  ) {
    this.invoiceFacade.jdeClient
      .getJdeApSoMatchesReport(
        filter?.dateFrom,
        filter?.dateTo,
        filter?.number,
        this.apReconciliationStatusesAdapter.adapt(
          filter?.reconciliationStatus
        ),
        filter.invoiceStatus,
        undefined,
        this.apInvoiceTypesAdapter.adapt(filter?.invoiceType),
        filter?.orgautocomplete?.tin,
        filter.registerNumber,
        filter.manualReconciliationCommentType
      )
      .pipe(        
        finalize(() => (this.loadingReport = false))
      )
      .subscribe(
        (res) => {
          let blob: any = new Blob([res.data], { type: res.data.type });
          fileSaver.saveAs(blob, res.fileName);
          this.invoiceFacade.displaySuccess('Отчет успешно сформировался');
        },
        (err) => {
          this.invoiceFacade.displayErrors(err);
        }
      );
  }

  private getApPoMatchReport(
    filter: ReportFilterModel<ApReconciliationStatusesEnum>
  ) {
    this.invoiceFacade.jdeClient
      .getJdeApPoMatchesReport(
        filter?.dateFrom,
        filter?.dateTo,
        filter?.number,
        this.apReconciliationStatusesAdapter.adapt(
          filter?.reconciliationStatus
        ),
        filter.invoiceStatus,
        undefined,
        this.apInvoiceTypesAdapter.adapt(filter?.invoiceType),
        filter?.orgautocomplete?.tin,
        filter.registerNumber,
        filter.manualReconciliationCommentType
      )
      .pipe(        
        finalize(() => (this.loadingReport = false))
      )
      .subscribe(
        (res) => {
          let blob: any = new Blob([res.data], { type: res.data.type });
          fileSaver.saveAs(blob, res.fileName);
          this.invoiceFacade.displaySuccess('Отчет успешно сформировался');
        },
        (err) => {
          this.invoiceFacade.displayErrors(err);
        }
      );
  }

  private getApNcMatchReport(
    filter: ReportFilterModel<ApReconciliationStatusesEnum>
  ) {
    this.invoiceFacade.jdeClient
      .getJdeApNcMatchesReport(
        filter?.dateFrom,
        filter?.dateTo,
        filter?.number,
        this.apReconciliationStatusesAdapter.adapt(
          filter?.reconciliationStatus
        ),
        filter.invoiceStatus,
        undefined,
        this.apInvoiceTypesAdapter.adapt(filter?.invoiceType),
        filter?.orgautocomplete?.tin,
        filter.registerNumber,
        filter.manualReconciliationCommentType
      )
      .pipe(        
        finalize(() => (this.loadingReport = false))
      )
      .subscribe(
        (res) => {
          let blob: any = new Blob([res.data], { type: res.data.type });
          fileSaver.saveAs(blob, res.fileName);
          this.invoiceFacade.displaySuccess('Отчет успешно сформировался');
        },
        (err) => {
          this.invoiceFacade.displayErrors(err);
        }
      );
  }

  private getApUdMatchReport(
    filter: ReportFilterModel<ApReconciliationStatusesEnum>
  ) {
    this.invoiceFacade.jdeClient
      .getJdeApUndistributedMatchesReport(
        filter?.dateFrom,
        filter?.dateTo,
        filter?.number,
        this.apReconciliationStatusesAdapter.adapt(
          filter?.reconciliationStatus
        ),
        filter.invoiceStatus,
        undefined,
        this.apInvoiceTypesAdapter.adapt(filter?.invoiceType),
        filter?.orgautocomplete?.tin,
        filter.registerNumber,
        filter.manualReconciliationCommentType
      )
      .pipe(        
        finalize(() => (this.loadingReport = false))
      )
      .subscribe(
        (res) => {
          let blob: any = new Blob([res.data], { type: res.data.type });
          fileSaver.saveAs(blob, res.fileName);
          this.invoiceFacade.displaySuccess('Отчет успешно сформировался');
        },
        (err) => {
          this.invoiceFacade.displayErrors(err);
        }
      );
  }

  private getArMatchReport(
    filter: FilterModel<ArReconciliationStatusesEnum>
  ) {
    this.invoiceFacade.jdeClient
      .getJdeArMatchesReport(
        filter?.dateFrom,
        filter?.dateTo,
        filter?.number,
        this.arReconciliationStatusesAdapter.adapt(
          filter?.reconciliationStatus
        ),
        undefined,
        filter?.tin,
        filter.registerNumber,
        filter.ownInvoices,
        filter.isDrafts
      )
      .pipe(        
        finalize(() => (this.loadingReport = false))
      )
      .subscribe(
        (res) => {
          let blob: any = new Blob([res.data], { type: res.data.type });
          fileSaver.saveAs(blob, res.fileName);
          this.invoiceFacade.displaySuccess('Отчет успешно сформировался');
        },
        (err) => {
          this.invoiceFacade.displayErrors(err);
        }
      );
  }

  onReportClick() {
    const reportFilter = this.reportSearchParametersStateService.value;
    const arReportFilter = this.searchParametersStateService.filter;

    this.loadingReport = true;

    switch (this.mode) {
      case InvoiceModuleMode.ReconciliationContract:
        this.getApSoMatchReport(reportFilter);
        break;
      case InvoiceModuleMode.ReconciliationPO:
        this.getApPoMatchReport(reportFilter);
        break;
      case InvoiceModuleMode.ReconciliationNonContract:
        this.getApNcMatchReport(reportFilter);
        break;
      case InvoiceModuleMode.Undistributed:
        this.getApUdMatchReport(reportFilter);
        break;
      case InvoiceModuleMode.ARModule:
        this.getArMatchReport(arReportFilter);
        break;
      default:
        break;
    }
  }
}
