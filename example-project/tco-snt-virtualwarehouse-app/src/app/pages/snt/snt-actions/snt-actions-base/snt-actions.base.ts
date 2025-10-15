import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { forkJoin, Observable, Subject } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { CountryDto, CurrencyDto, ISendSntDto, MeasureUnitDto, ProblemDetails, RoleType, SendSntDto, SntDraftDto, SntFullDto, SntParticipantType, SntShippingInfoDto, TaxpayerStoreSimpleDto, ValidationProblemDetails } from "src/app/api/GCPClient";
import { AccessControlList } from "src/app/model/entities/AccessControlList";
import { SntDraftDtoExtended } from "src/app/model/entities/Snt/SntDraftDtoExtended";
import { SntFullDtoExtended } from "src/app/model/entities/Snt/SntFullDtoExtended";
import { SntProductFullDtoExtended } from "src/app/model/entities/Snt/SntProductFullDtoExtended";
import { ConfirmDialogComponent } from "src/app/shared/components/confirm-dialog/confirm-dialog.component";
import { SntOilProductDtoExtended } from "../../../../model/entities/Snt/SntOilProductDtoExtended";
import { Utilities } from "../../../../shared/helpers/Utils";
import { SntSectionAValidators } from "../../snt-sections/snt-section-a/snt-section-a.validators";
import { SntSectionBValidators } from "../../snt-sections/snt-section-b/snt-section-b.validators";
import { SntSectionCValidators } from "../../snt-sections/snt-section-c/snt-section-c.validators";
import { SntSectionDValidators } from "../../snt-sections/snt-section-d/snt-section-d.validators";
import { SntSectionEValidators } from "../../snt-sections/snt-section-e/snt-section-e.validators";
import { SntSectionFValidators } from "../../snt-sections/snt-section-f/snt-section-f.validators";
import { SntSectionGValidators } from "../../snt-sections/snt-section-g/snt-section-g.validators";
import { SntSectionG6Validators } from "../../snt-sections/snt-section-g6/snt-section-g6.validators";
import { SntFormErrorsDictionary } from "../../snt-sections/SntFormErrorsDictionary";
import { SntFormUtilities } from "../../SntFormUtils";
import { SntActionsDependenciesBase } from "./snt-actions-dependencies.base";
import '../../../../Extensions/string.extensions'
import { DsignDialogComponent } from "src/app/shared/components/dsign-dialog/dsign-dialog.component";
import { SntExportControlProductDtoExtended } from "src/app/model/entities/Snt/SntExportControlProductDtoExtended";
import { SntSectionG10Validators } from "../../snt-sections/snt-section-g10/snt-section-g10.validators";
import { SNTACTIONMODE } from "src/app/shared/tokens/snt-action-mode.token";
import { SntActionMode } from "src/app/model/enums/SntActionMode";
import { Inject } from "@angular/core";
import { SignWidget } from "src/app/shared/interfaces/sign-widget.model";


type section = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "G6" | "G10";

export class SntActionsBase {

  warehouses: TaxpayerStoreSimpleDto[];
  measureUnits: MeasureUnitDto[];
  favouriteMeasureUnits: MeasureUnitDto[]
  currencies: CurrencyDto[]
  favouriteCurrencies: CurrencyDto[]
  countries: CountryDto[]
  favouriteCountries: CountryDto[]
  id: string;
  isLoading: boolean;
  isActionButtonsAvailable: boolean = true;
  sntAccessControlList = AccessControlList.snt;
  currentSection: section = "A";
  sntFullDto: SntFullDto;
  dsignDialog: DsignDialogComponent;
  protected unsubscribe$: Subject<void> = new Subject<void>();
  constructor(
    public deps: SntActionsDependenciesBase,
    @Inject(SNTACTIONMODE) public mode: SntActionMode) { }

  loadInformation(): Observable<[TaxpayerStoreSimpleDto[], MeasureUnitDto[], MeasureUnitDto[], CurrencyDto[]?, CurrencyDto[]?, CountryDto[]?, CountryDto[]?]> {
    return forkJoin([
      this.getUserStores(),
      this.deps.commonDataService.getMeasureUnits(),
      this.deps.commonDataService.getFavouriteMeasureUnits(),
      this.deps.commonDataService.getCurrencies(),
      this.deps.commonDataService.getFavouriteCurrencies(),
      this.deps.commonDataService.getCountries(),
      this.deps.commonDataService.getFavouriteCountries()
    ]);
  }

  patchFormValue(snt: SntFullDto) {
    const sntCloned = { ...snt };
    Utilities.removeEmptyObjects(sntCloned, this.deps.draftSntForm);
    this.deps.draftSntForm.patchValue(sntCloned);
  }


  getSectionErrorCount(section: section) {
    switch (section) {
      case "A": return SntSectionAValidators.getSectionAErrorCount(this.deps.draftSntForm);
      case "B": return SntSectionBValidators.getSectionBErrorCount(this.deps.draftSntForm);
      case "C": return SntSectionCValidators.getSectionCErrorCount(this.deps.draftSntForm);
      case "D": return SntSectionDValidators.getSectionDErrorCount(this.deps.draftSntForm);
      case "E": return SntSectionEValidators.getSectionEErrorCount(this.deps.draftSntForm);
      case "F": return SntSectionFValidators.getSectionFErrorCount(this.deps.draftSntForm);
      case "G": return SntSectionGValidators.getSectionGErrorCount(this.deps.draftSntForm);
      case "G6": return SntSectionG6Validators.getSectionG6ErrorCount(this.deps.draftSntForm);
      case "G10": return SntSectionG10Validators.getSectionG10ErrorCount(this.deps.draftSntForm);
    }
  }

  getSntModel(): SntDraftDto {
    let formValue = this.deps.draftSntForm.getRawValue();
    this.productsMapping(formValue);
    
    Utilities.cleanObject(formValue);

    let model: SntDraftDtoExtended = SntDraftDtoExtended.fromJS(formValue);

    if (model.sntBound.isOutbound(model.seller.tin) && model.products)
      model.products.forEach(val => delete val.measureUnitId);

    model.contract.isContract = this.deps.draftSntForm.get('contract.isContract').value == "true";
    return model;
  }

  productsMapping(formValue: any){
    if (formValue.products.length > 0){
      formValue.products.forEach(p => {
        p.priceWithoutTax = p.sum;
        p.ndsRate = p.vadRate;
        p.ndsAmount = p.vadSum;
        p.priceWithTax = p.totalSumWithIndirectTaxes;
      })
    }
    if (formValue.oilProducts.length > 0){
      formValue.oilProducts.forEach(p => {
        p.priceWithoutTax = p.sum;
        p.ndsRate = p.vadRate;
        p.ndsAmount = p.vadSum;
        p.priceWithTax = p.totalSumWithIndirectTaxes;
      })
    }
    if (formValue.exportControlProducts.length > 0){
      formValue.exportControlProducts.forEach(p => {
        p.priceWithoutTax = p.sum;
        p.ndsRate = p.vadRate;
        p.ndsAmount = p.vadSum;
        p.priceWithTax = p.totalSumWithIndirectTaxes;
      })
    }
  }
  getSnt(): Observable<SntFullDto> {
    return this.deps.sntClient.get(+this.id)
  }

  hasAccess(roles: RoleType[]): boolean {
    return this.deps.roleAccessService.hasAccess(roles);
  }

  saveDraft(): void {
    const model = this.getSntModel();
    this.isLoading = true;
    this.deps.sntClient.saveDraft(model).subscribe(
      _ => this.deps.router.navigateByUrl('/snt'),
      error => {
        this.isLoading = false;
        this.deps.sntFacade.displayErrors(error)
      }
    )
  }

  send(): void {
    const model = this.getSntModel();
    if (this.deps.draftSntForm.valid) {
      const dialogRef = this.deps.dialog.open(DsignDialogComponent, {
        closeOnNavigation: true,
        disableClose: true,
        width: "400px",
        maxHeight: 'none', 
        maxWidth: 'none',
      });
      this.dsignDialog = dialogRef.componentInstance;
      this.dsignDialog.verifyAuthentication().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(
        isAuthorized => this.startSigningProcess(isAuthorized, model),
        error => this.deps.sntFacade.displayErrors(error)
      );
    }

  }

  private startSigningProcess(isAuthorized: boolean, model: SntDraftDto): void {
    if (!isAuthorized) return;
    const signWidget: SignWidget = { url: '', hasError: false, errorMessage: '' };

    this.deps.sntClient.saveDraft(model).pipe(
      switchMap(id => {
        let imodelSentSnt: ISendSntDto = {
          sntId: id,
          localTimezoneOffsetMinutes: new Date().getTimezoneOffset() * -1
        }
        let modelSentSnt = new SendSntDto(imodelSentSnt)
        return this.deps.sntClient.signingPageToSendSnt(modelSentSnt)
      })
    ).subscribe(
      response => this.handleSignResponse(response, signWidget),
      error => this.handleSignError(error, signWidget)
    );
  }

  private handleSignResponse(response: any, signWidget: SignWidget): void {
    signWidget.url = response.urlToSign;
    this.dsignDialog.signDocument(signWidget).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(
      isSigned => {
        if(isSigned)
          this.deps.router.navigateByUrl('/snt')
      }
    );
  }

  private handleSignError(error: ProblemDetails | ValidationProblemDetails, signWidget: SignWidget): void {
    signWidget.hasError = true;
    signWidget.errorMessage = Utilities.detectAndReturnErrorMessage(error);
    this.dsignDialog.signDocument(signWidget);
  }

  close(): void {
    const dialogRef = this.deps.dialog.open(ConfirmDialogComponent, {
      closeOnNavigation: true,
      disableClose: true,
      width: "400px",
      maxHeight: 'none', 
      maxWidth: 'none',
      data: {
        title: "Сохранить изменения в черновик?",
        message: ""
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        if (this.isFormValid()) {
          this.saveDraft()
        }
        else {
          let errorLookUp = Utilities.getErrors(this.deps.draftSntForm, '')

          const sntFormErrorDetails = new Map<string, string[]>();

          errorLookUp.forEach(element => {
            const pathToError = element[0].containsNumber() ? SntFormUtilities.convertToValidPath(element[0]) : element[0];
            const namesOfErrors = element[1];

            SntFormUtilities.fillOutSntFormErrorDetails(namesOfErrors, sntFormErrorDetails, SntFormErrorsDictionary[pathToError])
          })

          this.deps.sntFacade.displayErrors(sntFormErrorDetails)
        }
      }
      else this.deps.router.navigateByUrl('/snt');
    })
  }

  private getUserStores(): Observable<TaxpayerStoreSimpleDto[]> {
    if (this.mode === SntActionMode.Show || this.mode === SntActionMode.Correction) {
      return this.deps.commonDataService.getUserTaxpayerStores();
    }else{
      return this.deps.commonDataService.getValidUserTaxpayerStores();
    }
  }

  protected setTransportTypes(shippingInfo: SntShippingInfoDto): void {
    const transporterTypes = this.deps.draftSntForm.get('shippingInfo.transportTypes') as UntypedFormArray
    shippingInfo.transportTypes?.forEach((t, i) => {
      transporterTypes.setControl(i, new UntypedFormControl(t));
      SntSectionEValidators.setTransporterTypesEditMode((this.deps.draftSntForm.get('shippingInfo') as UntypedFormGroup), t);
    });
  }

  protected setIsContract(snt: SntFullDto): void {
    (this.deps.draftSntForm.get('contract.isContract') as UntypedFormControl)
      .setValue(
        snt.contract.isContract.toString(),
        { onlySelf: true, emitEvent: false }
      );
  }

  protected setProducts(snt: SntFullDto): void {
    const products = this.deps.draftSntForm.get('products') as UntypedFormArray;
    const sntFullDtoExtended = SntFullDtoExtended.fromJS(snt);
    if (sntFullDtoExtended.sntBound.isOutbound(sntFullDtoExtended.seller.tin)) {      
      sntFullDtoExtended.products.forEach(product => {
        const sntProductFullDto = SntProductFullDtoExtended.fromJS(product)
        sntProductFullDto.getProductFromBalance(products)
      })
    } else {      
      sntFullDtoExtended.products.forEach(product => {
        const sntProductFullDto = SntProductFullDtoExtended.fromJS(product)
        sntProductFullDto.getProductFromGsvs(products)
      })
    }

    if (snt.oilProducts.length > 0) {
      SntFormUtilities.setHasOilProducts(this.deps.draftSntForm);
      products.clearValidators()
      snt.oilProducts.forEach(product => {
        const sntOilProductFullDto = SntOilProductDtoExtended.fromJS(product);
        sntOilProductFullDto.getProductFromBalance(SntFormUtilities.getOilProducts(this.deps.draftSntForm));
      })

      SntSectionG6Validators.setOilSetValidation(this.deps.draftSntForm);
    }

    if (snt.exportControlProducts.length > 0) {
      SntFormUtilities.setHasExportControlProducts(this.deps.draftSntForm);
      products.clearValidators()
      snt.exportControlProducts.forEach(product => {
        const sntExportControlProductFullDto = SntExportControlProductDtoExtended.fromJS(product);
        sntExportControlProductFullDto.getProductFromBalance(SntFormUtilities.getExportControlProducts(this.deps.draftSntForm));
      })
    }
  }

  isFormValid() {
    const productsEmpty = (this.deps.draftSntForm.get('products') as UntypedFormArray).length === 0;
    const oilProductsEmpty = (this.deps.draftSntForm.get('oilProducts') as UntypedFormArray).length === 0;
    const exportControlProductsEmpty = (this.deps.draftSntForm.get('exportControlProducts') as UntypedFormArray).length === 0;
    const hasOilProducts = this.deps.draftSntForm.get('hasOilProducts').value;
    const hasExportControlProducProducts = this.deps.draftSntForm.get('hasExportControlProducts').value;
    let formValid = this.deps.draftSntForm.valid;
    if (hasOilProducts) {
      formValid &&= !oilProductsEmpty;
    }
    else if (hasExportControlProducProducts){
      formValid &&= !exportControlProductsEmpty;
    }
    else {
      formValid &&= !productsEmpty;
    }
    return formValid;
  }

  protected setSharingAgreementParticipant(snt: SntFullDto): void {
    const sellerStatuses = snt.seller.statuses;    
    this.deps.draftSntForm.get('seller.sharingAgreementParticipantCheckBox').setValue(sellerStatuses.some(s => s === SntParticipantType.SHARING_AGREEMENT_PARTICIPANT));
  }
}
