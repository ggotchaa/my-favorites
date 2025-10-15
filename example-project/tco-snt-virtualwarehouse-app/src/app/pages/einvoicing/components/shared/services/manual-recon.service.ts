import { SelectionModel } from "@angular/cdk/collections";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ApMatchType, ChangeManualReconciliationCommentDto, EsfJdeApNcMatchDto, EsfJdeApPoMatchDto, EsfJdeApSoMatchDto, EsfJdeApUndistributedMatchDto, ManualReconciliationCommentType } from "src/app/api/GCPClient";
import { ConfirmDialogComponent } from "src/app/shared/components/confirm-dialog/confirm-dialog.component";
import { InvoiceFacade } from "../invoice.facade";
import { BehaviorSubject, takeUntil } from "rxjs";
import { ApNcModuleTableDataSource } from "src/app/model/dataSources/EInvoicing/ApNcModuleTableDataSource";
import { ApManualReconciliationCommentType } from "src/app/model/lists/Einvoicing/ApManualReconciliationCommentType";
import { ApPoModuleTableDataSource } from "src/app/model/dataSources/EInvoicing/ApPoModuleTableDataSource";
import { ApSoModuleTableDataSource } from "src/app/model/dataSources/EInvoicing/ApSoModulteTableDataSource";
import { ApUndistributedModuleTableDataSource } from "src/app/model/dataSources/EInvoicing/ApUndistributedModuleTableDataSource";

@Injectable({
    providedIn: 'root',
})

export class ManualReconService {
  readonly reconciliationCommentTypes = ApManualReconciliationCommentType;
  isLoadingCommentId = new BehaviorSubject<number>(0);
  selection = new SelectionModel<EsfJdeApNcMatchDto | EsfJdeApPoMatchDto | EsfJdeApSoMatchDto | EsfJdeApUndistributedMatchDto>(true, []);
  bulkReconButtons = new BehaviorSubject<string[]>([]);
  sendingComments = new BehaviorSubject<boolean>(false);
  dataSource: ApNcModuleTableDataSource | ApPoModuleTableDataSource | ApSoModuleTableDataSource | ApUndistributedModuleTableDataSource;
  invoiceFacade: InvoiceFacade;
  apMatchType: ApMatchType;
  
  readonly allComments = Object.keys(ManualReconciliationCommentType).filter(key => isNaN(Number(key)));

  constructor(
    public dialog: MatDialog,
  ){}

  changeReconComment(element: any){
    this.isLoadingCommentId.next(element.id);
    let request = this.createChangeManualReconciliationCommentRequest([element])
    this.dataSource.apiClient.changeManualReconciliationComment(request)
    .pipe(
      takeUntil(this.dataSource.subscription$)
    )
    .subscribe(
      res => {
        this.isLoadingCommentId.next(0);
        this.updateElementWithResponse(element, res[0]);
      },
      err => {
        this.invoiceFacade.displayErrors(err)
        this.isLoadingCommentId.next(0);
      }
    )
  }

  createChangeManualReconciliationCommentRequest = (elements: any[]): ChangeManualReconciliationCommentDto[] => {
    return elements.map(element => {
      const dto = new ChangeManualReconciliationCommentDto({
        id: element.id,
        manualReconciliationCommentType: element.manualReconciliationComment,
        apMatch: this.apMatchType ?? element.apMatchType,
      });
      return dto;
    });
  };

  bulkChangeReconComment(elements: any[]) {
    this.sendingComments.next(true);
    var request = this.createChangeManualReconciliationCommentRequest(elements);
    this.dataSource.apiClient.changeManualReconciliationComment(request)
    .pipe(
        takeUntil(this.dataSource.subscription$)
    )
    .subscribe(
        res => {
          res.forEach((response, index) => this.updateElementWithResponse(elements[index], response));
          this.sendingComments.next(false);
          this.updateButtons();
        },
        err => {
            this.invoiceFacade.displayErrors(err);
            this.sendingComments.next(false);
        }
    );
}


  updateElementWithResponse(element: any, response: any) {
    element.commentUpdatedUserFullName = response.commentUpdatedUserFullName;
    element.manualReconciliationCommentUpdateDate = response.manualReconciliationCommentUpdateDate;
    element.manualReconciliationComment = response.manualReconciliationComment;
  }

  masterToggle() {
    this.isAllSelected() 
        ? this.selection.clear() 
        : this.dataSource.allSourceSubjects.forEach(row => this.selection.select(row as EsfJdeApNcMatchDto | EsfJdeApPoMatchDto | EsfJdeApSoMatchDto | EsfJdeApUndistributedMatchDto));
    this.updateButtons();
  }
  
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.allSourceSubjects.length;
    return numSelected === numRows;
  }
  sendSelected(buttonName: string) {
    const comment = ManualReconciliationCommentType[buttonName as keyof typeof ManualReconciliationCommentType];
    let title = `Вы, действительно, хотите присвоить статус ${buttonName} выбранным счетам?`
    this.confirmPopup(title).then(result => {
      if(result){
        this.selection.selected.forEach(item => item.manualReconciliationComment = comment);
        this.bulkChangeReconComment(this.selection.selected);
      }
    });
  }
  private confirmPopup(title: string): Promise<boolean>{
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      closeOnNavigation: true,
      disableClose: true,
      maxWidth: "400px",
      data: {
        title: title,
        message: ""
      }
    });
    return dialogRef.afterClosed().toPromise();
  }
  toggleSelection(element: any) {
    this.selection.toggle(element);
    this.updateButtons();
  }
  updateButtons() {
    const uniqueComments = new Set(this.selection.selected.map(item => item.manualReconciliationComment.toString()));
    const buttons = uniqueComments.size === this.allComments.length ? [] : this.allComments.filter(comment => !uniqueComments.has(comment));
    this.bulkReconButtons.next(buttons);
  }

}