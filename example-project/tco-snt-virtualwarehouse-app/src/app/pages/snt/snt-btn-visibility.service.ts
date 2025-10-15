import { SelectionModel } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { RoleType, SntSimpleDto, SntStatus } from 'src/app/api/GCPClient';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { COMPANY } from 'src/app/model/GlobalConst';
import { SntFacade } from './snt.facade';
import { SntButtonActions } from 'src/app/model/enums/SntButtonActions';

@Injectable()
export class SntBtnVisibilityService {
  sntAccessControlList: Map<string, RoleType[]> = AccessControlList.snt;

  constructor(private sntFacade: SntFacade) { }

  private hasAccess(roles: RoleType[]): boolean {
    return this.sntFacade.roleAccessService.hasAccess(roles);
  }

  private buttonConditions = {
    isSingleRowSelection: (selection: SelectionModel<SntSimpleDto>) => selection.selected.length === 1,
    isNoSelection: (selection: SelectionModel<SntSimpleDto>) => selection.selected.length === 0,
    isSenderBinEqualCompanyBin: (selection: SelectionModel<SntSimpleDto>) => selection.selected[0].senderTin === COMPANY.tin,
    isRecipientBinEqualCompanyBin: (selection: SelectionModel<SntSimpleDto>) => selection.selected[0].recipientTin === COMPANY.tin,

    hasNotViewedOrDeliveredStatus: (selection: SelectionModel<SntSimpleDto>) => [SntStatus.NOT_VIEWED, SntStatus.DELIVERED].includes(selection.selected[0].status),
    hasNotViewedStatus: (selection: SelectionModel<SntSimpleDto>) => selection.selected[0].status === SntStatus.NOT_VIEWED,
    hasDeliveredStatus: (selection: SelectionModel<SntSimpleDto>) => selection.selected[0].status === SntStatus.DELIVERED,
    hasDraftStatus: (selection: SelectionModel<SntSimpleDto>) => selection.selected[0].status === SntStatus.DRAFT,
    hasFailedStatus: (selection: SelectionModel<SntSimpleDto>) => selection.selected[0].status === SntStatus.FAILED,

    hasCreateAccess: this.hasAccess(this.sntAccessControlList.get('new')),
    hasViewAccess: this.hasAccess(this.sntAccessControlList.get('show')),
    hasImportAccess: this.hasAccess(this.sntAccessControlList.get('import')),
    hasReportAccess: this.hasAccess(this.sntAccessControlList.get('snt_report')),
    hasEditAccess: this.hasAccess(this.sntAccessControlList.get('edit')),
    hasCorrectionAccess: this.hasAccess(this.sntAccessControlList.get('correction')),
    hasCopyAccess: this.hasAccess(this.sntAccessControlList.get('copy')),
    hasAcceptDeclineAccess: this.hasAccess(AccessControlList.snt.get('decline_confirm')),
    hasRevokeAccess: this.hasAccess(this.sntAccessControlList.get('revoke'))
  };

  private buttonConfig(selection: SelectionModel<SntSimpleDto>): Record<SntButtonActions, () => boolean> {
    return {
      [SntButtonActions.CREATE]: () => this.buttonConditions.hasCreateAccess,

      [SntButtonActions.IMPORT]: () => this.buttonConditions.hasImportAccess,

      [SntButtonActions.VIEW]: () =>
        this.buttonConditions.hasViewAccess &&
        this.buttonConditions.isSingleRowSelection(selection),

      [SntButtonActions.EDIT]: () =>
        this.buttonConditions.hasEditAccess &&
        this.buttonConditions.isSingleRowSelection(selection) &&
        this.buttonConditions.hasDraftStatus(selection),

      [SntButtonActions.CORRECT]: () =>
        this.buttonConditions.hasCorrectionAccess &&
        this.buttonConditions.isSingleRowSelection(selection) &&
        (
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && this.buttonConditions.isSenderBinEqualCompanyBin(selection) && !this.buttonConditions.isRecipientBinEqualCompanyBin(selection)) ||
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && this.buttonConditions.isSenderBinEqualCompanyBin(selection) && this.buttonConditions.isRecipientBinEqualCompanyBin(selection))
        ),

      [SntButtonActions.COPY]: () =>
        this.buttonConditions.hasCopyAccess &&
        this.buttonConditions.isSingleRowSelection(selection) &&
        this.buttonConditions.isSenderBinEqualCompanyBin(selection),  

      [SntButtonActions.ACCEPT]: () =>
        this.buttonConditions.hasAcceptDeclineAccess &&
        this.buttonConditions.isSingleRowSelection(selection) &&
        (
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && this.buttonConditions.isRecipientBinEqualCompanyBin(selection)) ||
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && this.buttonConditions.isSenderBinEqualCompanyBin(selection) && this.buttonConditions.isRecipientBinEqualCompanyBin(selection)) ||
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && !this.buttonConditions.isSenderBinEqualCompanyBin(selection) && this.buttonConditions.isRecipientBinEqualCompanyBin(selection))
        ),

      [SntButtonActions.REJECT]: () =>
        this.buttonConditions.hasAcceptDeclineAccess &&
        this.buttonConditions.isSingleRowSelection(selection) &&
        (
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && this.buttonConditions.isRecipientBinEqualCompanyBin(selection)) ||
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && this.buttonConditions.isSenderBinEqualCompanyBin(selection) && this.buttonConditions.isRecipientBinEqualCompanyBin(selection)) ||
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && !this.buttonConditions.isSenderBinEqualCompanyBin(selection) && this.buttonConditions.isRecipientBinEqualCompanyBin(selection))
        ),

      [SntButtonActions.REVOKE]: () =>
        this.buttonConditions.hasRevokeAccess &&
        this.buttonConditions.isSingleRowSelection(selection) &&
        (
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && this.buttonConditions.isSenderBinEqualCompanyBin(selection) && !this.buttonConditions.isRecipientBinEqualCompanyBin(selection)) ||
          (this.buttonConditions.hasNotViewedOrDeliveredStatus(selection) && this.buttonConditions.isSenderBinEqualCompanyBin(selection) && this.buttonConditions.isRecipientBinEqualCompanyBin(selection))
        ),

      [SntButtonActions.REPORT]: () =>
        this.buttonConditions.hasReportAccess &&
        this.buttonConditions.isNoSelection(selection)
    };
  }

  isButtonAvailable(action: SntButtonActions, selection: SelectionModel<SntSimpleDto>): boolean {
    const btnConfig = this.buttonConfig(selection);
    return btnConfig[action]();
  }
}
