import { Directive, ViewChild } from "@angular/core";
import { UntypedFormArray } from "@angular/forms";
import { forkJoin, Observable, Subject } from "rxjs";
import { finalize, switchMap, takeUntil } from "rxjs/operators";
import { AwpWorksPerformedDto, CountryDto, GetRateResponseDto, GetSntProductBySntIdResponseDto, InvoiceDto, InvoiceFullDto, ISendInvoiceDto, JdeArInvoiceDto, RoleType, SendInvoiceDto } from "src/app/api/GCPClient";
import { AbstractInvoiceFormGroupFactory } from "src/app/model/entities/Einvoicing/Factory/AbstractInvoiceFormGroupFactory";
import { JdeInvoiceFormGroupCreatorBase } from "src/app/model/entities/Einvoicing/Factory/JdeInvoiceFormGroupFactoryBase";
import { ConfirmDialogComponent } from "src/app/shared/components/confirm-dialog/confirm-dialog.component";
import { Utilities } from "src/app/shared/helpers/Utils";
import { CurrencyDto, MeasureUnitDto } from "../../../../../../api/GCPClient";
import { ICurrencyRateSetable } from "src/app/model/entities/Einvoicing/Interfaces/ICurrenyRateSetable";
import { AccessControlList } from "src/app/model/entities/AccessControlList";
import { InvoiceSectionAValidators } from "../../components/invoice-sections/invoice-section-a/invoice-section-a.validators";
import { InvoiceSectionBValidators } from "../../components/invoice-sections/invoice-section-b/invoice-section-b.validators";
import { InvoiceSectionCValidators } from "../../components/invoice-sections/invoice-section-c/invoice-section-c.validators";
import { InvoiceSectionC1Validators } from "../../components/invoice-sections/invoice-section-c1/invoice-section-c1.validators";
import { InvoiceSectionDValidators } from "../../components/invoice-sections/invoice-section-d/invoice-section-d.validators";
import { InvoiceSectionEValidators } from "../../components/invoice-sections/invoice-section-e/invoice-section-e.validators";
import { InvoiceSectionFValidators } from "../../components/invoice-sections/invoice-section-f/invoice-section-f.validators";
import { InvoiceSectionGValidators } from "../../components/invoice-sections/invoice-section-g/invoice-section-g.validators";
import { InvoiceActionsDependenciesBase } from "./invoice-actions-dependencies.base";
import { InvoiceSectionGComponent } from "../../components/invoice-sections/invoice-section-g/invoice-section-g.component";
import { InvoiceSectionAComponent } from "../../components/invoice-sections/invoice-section-a/invoice-section-a.component";
import * as fileSaver from 'file-saver';
import { DsignDialogComponent } from "src/app/shared/components/dsign-dialog/dsign-dialog.component";
import { SignWidget } from "src/app/shared/interfaces/sign-widget.model";


type section = "A" | "B" | "C" | "C1" | "D" | "E" | "F" | "G";

@Directive()
export class InvoiceActionsBase {
  measureUnits: MeasureUnitDto[];
  favouriteMeasureUnits: MeasureUnitDto[]
  currencies: CurrencyDto[]
  favouriteCurrencies: CurrencyDto[]  

  isLoading: boolean;
  currentSection: section = "A";
  countries: CountryDto[];
  favouriteCountries: CountryDto[];

  eiArAccessControlList = AccessControlList.einvoicing.ar;

  jdeInvoiceId?: number;
  esfInvoiceId?: number;

  documentNumber: string;
  isMarineInvoice = false;
  documentType: string;
  registrationNumber: string;
  loadingReport = false;
  protected currrencyRateSetable: ICurrencyRateSetable
  @ViewChild(InvoiceSectionGComponent) sectionG: InvoiceSectionGComponent;
  @ViewChild(InvoiceSectionAComponent) sectionA: InvoiceSectionAComponent;
  protected unsubscribe$: Subject<void> = new Subject<void>();
  invoiceFormGroupCreator: JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto>;
  dsignDialog: DsignDialogComponent
  isSavedForSign = false;
  constructor(
    public deps: InvoiceActionsDependenciesBase,
  ) {
  }

  loadInformation(): Observable<[CountryDto[], CountryDto[], MeasureUnitDto[], MeasureUnitDto[], CurrencyDto[]?, CurrencyDto[]?]> {
    return forkJoin([
      this.deps.commonDataService.getCountries(),
      this.deps.commonDataService.getFavouriteCountries(),
      this.deps.commonDataService.getMeasureUnits(),
      this.deps.commonDataService.getFavouriteMeasureUnits(),
      this.deps.commonDataService.getCurrencies(),
      this.deps.commonDataService.getFavouriteCurrencies(),      
    ]);
  }

  getSectionErrorCount(section: section) {
    switch (section) {
      case "A": return InvoiceSectionAValidators.getSectionAErrorCount(this.deps.draftInvoiceForm);
      case "B": return InvoiceSectionBValidators.getSectionBErrorCount(this.deps.draftInvoiceForm);
      case "C": return InvoiceSectionCValidators.getSectionCErrorCount(this.deps.draftInvoiceForm);
      case "C1": return InvoiceSectionC1Validators.getSectionC1ErrorCount(this.deps.draftInvoiceForm);
      case "D": return InvoiceSectionDValidators.getSectionDErrorCount(this.deps.draftInvoiceForm);
      case "E": return InvoiceSectionEValidators.getSectionEErrorCount(this.deps.draftInvoiceForm);
      case "F": return InvoiceSectionFValidators.getSectionFErrorCount(this.deps.draftInvoiceForm);
      case "G": return InvoiceSectionGValidators.getSectionGErrorCount(this.deps.draftInvoiceForm);
    }
  }

  getInvoiceModel(): any {
    let formValue = this.deps.draftInvoiceForm.getRawValue();
    Utilities.cleanObject(formValue);
    
    formValue["localTimezoneOffsetMinutes"] = new Date().getTimezoneOffset() * -1;
    formValue["jdeArInvoiceId"] = this.jdeInvoiceId;
    formValue["esfInvoiceId"] = this.esfInvoiceId;
    formValue.deliveryTerm.hasContract = this.deps.draftInvoiceForm.get('deliveryTerm.hasContract').value == "true";
    formValue.deliveryDocNum = this.deps.draftInvoiceForm.get('requisites.deliveryDocNum').value
    formValue.deliveryDocDate = this.deps.draftInvoiceForm.get('requisites.deliveryDocDate').value
    formValue.products.forEach(p => {
      p.truOriginCode = (p.truOriginCode as number).toString();
      p.priceWithoutTax = p.sum;
      p.turnoverSize = p.salesAmount;
      p.ndsRate = p.vadRate;
      p.ndsAmount = p.vadSum;
      p.priceWithTax = p.sumWithIndirectTaxes;
      p.additional = p.additionalDetails;
      p.productNumberInSnt = p.productNumberInSnt;
      p.catalogTruId = p.identificator;
    })

    return formValue;
  }

  saveDraft(): void {
    if(this.isFormValid()) {
      this.isLoading = true;
      const model = InvoiceDto.fromJS(this.getInvoiceModel());

      this.deps.facade.invoiceClient.saveDraft(model).pipe(
        finalize(() => this.isLoading = false),
        takeUntil(this.unsubscribe$)
      ).subscribe(
        _ => this.deps.router.navigateByUrl('/einvoicing'),
        error => {
          this.isLoading = false;
          this.deps.facade.displayErrors(error)
        }
      );
    }
  }

  save(): void {
    if (!this.isFormValid()) return;
  
    const model = InvoiceDto.fromJS(this.getInvoiceModel());
    const title = `Вы, действительно, хотите отправить счет ${model.num} в ЭСФ?`;
  
    this.confirmPopup(title).then(result => {
      if (!result) return;
      const dialogRef = this.deps.dialog.open(DsignDialogComponent, {
        closeOnNavigation: true,
        disableClose: true,
        width: "400px",
      });
      this.dsignDialog = dialogRef.componentInstance;
      this.dsignDialog.verifyAuthentication().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(
        isAuthorized => this.startSigningProcess(isAuthorized, model),
        error => this.deps.facade.displayErrors(error)
      );
    });
  }
  
  private startSigningProcess(isAuthorized: boolean, model: InvoiceDto): void {
    if (!isAuthorized) return;
    const signWidget: SignWidget = { url: '', hasError: false, errorMessage: '' };
    
    this.deps.facade.invoiceClient.saveDraft(model).pipe(
      switchMap(id => {
        let idto: ISendInvoiceDto = {
          id: id,
          localTimezoneOffsetMinutes: new Date().getTimezoneOffset() * -1
        } 
        let dto = new SendInvoiceDto(idto)
        return this.deps.facade.invoiceClient.signingPageForInvoice(dto);
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
          this.deps.router.navigateByUrl('/einvoicing')
      }
    );
  }
  
  private handleSignError(error: any, signWidget: SignWidget): void {
    signWidget.hasError = true;
    signWidget.errorMessage = error.title;
    this.dsignDialog.signDocument(signWidget);
  }

  onGetInvoiceReport(){
    this.loadingReport = true;
    this.deps.facade.jdeClient.getInvoiceReport(this.jdeInvoiceId, this.documentNumber, this.documentType)
    .subscribe(
      res => {
        this.loadingReport = false;
        let blob:any = new Blob([res.data], { type: res.data.type});
        fileSaver.saveAs(blob, res.fileName);
        this.deps.facade.displaySuccess('Отчет успешно сформировался')
      },
      err => {
        this.loadingReport = false
        this.deps.facade.displayErrors(err)
      }
    )
  }

  close(): void {
    if(this.sectionA.canSaveAsDraft() && !this.isReadOnlyInvoice() && !this.isSavedForSign){
      let title = "Сохранить изменения в черновик?"
      this.confirmPopup(title).then(result => {
        if(result)
          this.saveDraft();
      });
    }
    const queryParams = this.isSavedForSign ? { tab: 1 } : { tab: 0 };
    this.deps.router.navigate(['/einvoicing'], { queryParams });
  }

  private confirmPopup(title: string): Promise<boolean>{
    const dialogRef = this.deps.dialog.open(ConfirmDialogComponent, {
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

  private isFormValid = () => this.deps.draftInvoiceForm.valid;

  public hasAccess(roles: RoleType[]): boolean {
    return this.deps.facade.roleAccessService.hasAccess(roles);
  }

  public isSentInvoice(): boolean {
    return this.registrationNumber == null ? false : true
  }

  public isReadOnlyInvoice(): boolean {
    return this.deps.draftInvoiceForm.disabled
  }

  hideExportButton(): boolean {
    let isMarineInvoiceAndNotRi = this.isMarineInvoice && this.documentType !== 'RI'
    return this.isReadOnlyInvoice() || isMarineInvoiceAndNotRi;
  }

  disableExportButton(){
    return this.isMarineInvoice && this.registrationNumber == null;
  }

  protected getInvoice(jdeInvoiceId: number): Observable<JdeArInvoiceDto> {
    return this.deps.facade.jdeClient.getOutboundInvoiceDraftByJdeId(jdeInvoiceId);
  }  

  protected getInvoices(id: number, documentNumber: string, documentType: string): Observable<JdeArInvoiceDto> {
    return this.deps.facade.jdeClient.getJdeArByCompositeId(id, documentNumber, documentType);
  } 

  protected getInvoicesEsf(esfInvoiceId: number): Observable<InvoiceFullDto> {
    return this.deps.facade.invoiceClient.getOutboundInvoice(esfInvoiceId);
  } 

  protected setInvoiceValues(invoice: JdeArInvoiceDto, abstractFactory: AbstractInvoiceFormGroupFactory): void{
    const invoiceFormFactory = abstractFactory.createInvoiceForm(invoice, this.measureUnits, this.deps.draftInvoiceForm)

    const instanseForSetFormValues = invoiceFormFactory.createJdeInvoiceFormGroup()
    this.currrencyRateSetable = invoiceFormFactory.getCurrencyRateSetable();

    instanseForSetFormValues.setFormValues(invoice);

    this.deps.draftInvoiceForm.markAllAsTouched();
  
  }   

  protected setInvoiceValuesEsf(invoice: InvoiceFullDto, abstractFactory: AbstractInvoiceFormGroupFactory): void{
    const invoiceFormFactory = abstractFactory.createInvoiceFormEsf(this.deps.draftInvoiceForm)
    const instanseForSetFormValues = invoiceFormFactory.createEsfInvoiceFormGroup()
    instanseForSetFormValues.setFormValues(invoice);
    this.deps.draftInvoiceForm.markAllAsTouched();
  } 

  protected getCurrencyRate(currencyCode: string, turnoverDate: Date): Observable<GetRateResponseDto>{
    return this.deps.facade.dictionaryClient.getRateByCurrencyAndDate(currencyCode, turnoverDate, new Date().getTimezoneOffset() * -1)
  }


  protected onAwpWorksPerformedChange(awpWorksPerformedDto: AwpWorksPerformedDto, jdeInvoiceFormGroupFactory: JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto> ) {
    let productsArray = this.deps.draftInvoiceForm.get('products') as UntypedFormArray;
    productsArray.clear();

    jdeInvoiceFormGroupFactory.setAwpWorksPerformed(awpWorksPerformedDto);

    this.sectionG.dataSource.data = [...productsArray.controls]
  }

  protected onSntProductsBySntIdChange(sntProductsbysntIdReponseDto: GetSntProductBySntIdResponseDto, jdeInvoiceFormGroupFactory: JdeInvoiceFormGroupCreatorBase<JdeArInvoiceDto>) {
    let productsArray = this.deps.draftInvoiceForm.get('products') as UntypedFormArray;
    productsArray.clear();

    jdeInvoiceFormGroupFactory.setSntProductsSet(sntProductsbysntIdReponseDto);
    this.sectionG.dataSource.data = [...productsArray.controls]
  }
  onUpdateCurrenccRate(isLoading: boolean): void {
    this.sectionG.isLoadingCurrencyRate = isLoading
  }

}
