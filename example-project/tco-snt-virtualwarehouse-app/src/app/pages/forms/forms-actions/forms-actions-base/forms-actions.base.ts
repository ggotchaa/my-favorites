import { formatDate } from '@angular/common';
import { Directive, Inject, ViewChild } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { forkJoin, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import {
  CompanyOptions,
  CountryDto,
  MeasureUnitDto,
  RoleType,
  TaxpayerStoreSimpleDto,
  UFormClient,
  UFormFullDto,
  UFormSectionType,
  UFormDetailingType,
  ValidationProblemDetails,
  ProblemDetails,
} from 'src/app/api/GCPClient';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { SaveFormDto } from 'src/app/model/entities/SaveFormDto';
import { FormTypes } from 'src/app/model/lists/FormTypes';
import { FormSectionAValidators } from '../../form-sections/form-section-a/form-section-a.validators';
import { FormSectionDValidators } from '../../form-sections/form-section-d/form-section-d.validators';
import { FormSectionEComponent } from '../../form-sections/form-section-e/form-section-e.component';
import { FormSectionEValidators } from '../../form-sections/form-section-e/form-section-e.validators';
import { FormsActionsDependenciesBase } from './forms-actions-dependencies.base';
import { DsignDialogComponent } from 'src/app/shared/components/dsign-dialog/dsign-dialog.component';
import { FormActionMode } from 'src/app/model/enums/UForms/FormActionMode';
import { FORMACTIONMODE } from 'src/app/shared/tokens/form-action-mode.token';
import { SignWidget } from 'src/app/shared/interfaces/sign-widget.model';

@Directive()
export class FormsActionsBase {  

  currentSection = {
    asection: true,
    bsection: false,
    dsection: false,
    esection: false,
  };

  @ViewChild('sectionE', {read: FormSectionEComponent}) viewContainerRef;
  types = FormTypes;
  defaultWarehouse = "defaultWarehouse";
  warehouses: TaxpayerStoreSimpleDto[];
  measureUnits: MeasureUnitDto[];
  favouriteMeasureUnits: MeasureUnitDto[];

  countries: CountryDto[]
  favouriteCountries: CountryDto[]

  isLoading: boolean;
  isSaving: boolean;
  isSending: boolean;

  id: string;
  isSaveAvailable = true;
  formSaveAccessControlList = AccessControlList.formSave;
  formSendAccessControlList = AccessControlList.formSend;
  protected unsubscribe$ = new Subject<void>();

  showDuplicatedTable: boolean;
  dsignDialog: DsignDialogComponent;

  constructor(    
    public deps: FormsActionsDependenciesBase,
    @Inject(FORMACTIONMODE) public mode: FormActionMode) { }

  DateFilter = (d: Date | null): boolean => {
    return d < new Date();
  };
  setSectionE2Elements(data: any) {
    this.showDuplicatedTable = data.isShowSectionE2Table
  }
  loadInformation(): Observable<[TaxpayerStoreSimpleDto[], CompanyOptions, MeasureUnitDto[]?, CountryDto[]?, MeasureUnitDto[]?, CountryDto[]?]> {
    this.isLoading = true;    
    return forkJoin([
      this.getUserStores(),
      this.deps.commonDataService.getCompanyProfile(),      
      this.deps.commonDataService.getMeasureUnits(),
      this.deps.commonDataService.getCountries(),
      this.deps.commonDataService.getFavouriteMeasureUnits(),
      this.deps.commonDataService.getFavouriteCountries()
    ]);
  }

  setInformation(stores: TaxpayerStoreSimpleDto[], companyOptions: CompanyOptions, measureUnits: MeasureUnitDto[], countries: CountryDto[], favouriteMeasureUnits?: MeasureUnitDto[], favouriteCountries?:CountryDto[]) {
    this.warehouses = stores;
    this.deps.formsForm.get('requisites').patchValue(companyOptions);
    this.measureUnits = measureUnits;
    this.favouriteMeasureUnits = favouriteMeasureUnits
    this.countries = countries
    this.favouriteCountries = favouriteCountries
  }

  public goto(elem: string) {
    let element = document.getElementById(elem);
    element.scrollIntoView();
  }

  changeSection(section) {
    Object.keys(this.currentSection).forEach(
      (v) => (this.currentSection[v] = false)
    );
    this.currentSection[section] = true;
  }

  hasAccess(roles: RoleType[]): boolean {
    return roles ? this.deps.roleAccessService.hasAccess(roles) : true;
  }


  saveDraft(): void {
    this.removeEmpty(this.deps.formsForm.value)
    const formDto = new SaveFormDto(this.deps.formsForm.getRawValue());
    this.isLoading = true;
    
    formDto.typeForm = formDto.typeForm ? formDto.typeForm : this.formType
    this.deps.formsService.saveFormDraft(formDto, this.formType).subscribe(
      _ => this.deps.router.navigateByUrl('/forms'),
      error => {
        this.isLoading = false;
        this.deps.formsFacade.displayErrors(error)
      }
    )
  }

  send(): void {
    const formDto = new SaveFormDto(this.deps.formsForm.getRawValue());
    if (this.deps.formsForm.valid) {
      const dialogRef = this.deps.dialog.open(DsignDialogComponent, {
        closeOnNavigation: true,
        disableClose: true,
        width: "400px",
      });
      this.dsignDialog = dialogRef.componentInstance;
      this.dsignDialog.verifyAuthentication().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(
        isAuthorized => this.startSigningProcess(isAuthorized, formDto),
        error => this.deps.formsFacade.displayErrors(error)
      );     
    }
  }

  private startSigningProcess(isAuthorized: boolean, formDto: SaveFormDto): void {
    if (!isAuthorized) return;
    const signWidget: SignWidget = { url: '', hasError: false, errorMessage: '' };
    
    formDto.typeForm = formDto.typeForm ? formDto.typeForm : this.formType
      this.deps.formsService.saveFormDraft(formDto, this.formType)?.pipe(
        switchMap(id => {
          return this.deps.formsService.sendForm(id)
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
          this.deps.router.navigateByUrl('/forms')
      }
    );;
  }
  
  private handleSignError(error: ProblemDetails | ValidationProblemDetails, signWidget: SignWidget): void {
    signWidget.hasError = true;
    signWidget.errorMessage = error.title;
    this.dsignDialog.signDocument(signWidget);
  }

  private getUserStores(): Observable<TaxpayerStoreSimpleDto[]> {
      if (this.mode === FormActionMode.Show || this.mode === FormActionMode.Correction) {
        return this.deps.commonDataService.getUserTaxpayerStores();
      }else{
        return this.deps.commonDataService.getValidUserTaxpayerStores();
      }
    }

  get formType() {
    return this.deps.formsForm.get('typeForm').value;
  }

  get formTypeName() {
    return !this.formType
      ? ''
      : this.types.find((t) => t.value === this.formType).viewValue;
  }

  get aSectionErrors(): number {
    return FormSectionAValidators.getSectionAErrorCount(this.deps.formsForm);
  }

  get dSectionErrors(): number {
    return FormSectionDValidators.getSectionDErrorCount(this.deps.formsForm);
  }

  get eSectionErrors(): number {
    return FormSectionEValidators.getSectionEErrorCount(this.deps.formsForm);
  }

  getForm(): Observable<UFormFullDto> {
    return (<UFormClient>this.deps.uFormClient).get(+this.id);
  }

  isSaveButtonDisabled(): boolean {
    const detailingType = this.deps.formsForm.get('detailingType').value ===UFormDetailingType.PACKING || this.deps.formsForm.get('detailingType').value ===UFormDetailingType.UNPACKING;
    const productLength = (this.deps.formsForm.get('products').value.length === 0 || this.deps.formsForm.get('sectionE2Products').value.length === 0) || (this.deps.formsForm.get('products').value.length === 1 && this.deps.formsForm.get('sectionE2Products').value.length === 1);
    return detailingType && productLength;
  }
  setFormValues(form: UFormFullDto): void {
    this.deps.formsForm.patchValue({
      id: form.uFormId,
      typeForm: form.type,
      detailingType: form.detailingType,
      writeOffReason: form.writeOffReason,
      registrationNumber: form.registrationNumber,
      dateFormation: formatDate(form.date, 'dd.MM.yyyy', 'en'),
      numberDocument: form.number,
      dateCreation: form.date,
      comment: form.comment,
      warehouse: {
        warehouseSelector: +form.sender.storeId,
        warehouseIdForm: this.warehouses.find(
          (el) => el.id === +form.sender.storeId
        )?.externalId,
        warehouseNameForm: this.warehouses.find(
          (el) => el.id === +form.sender.storeId
        )?.name,
        receiverWarehouseSelector: +form.recipientTaxpayerStoreId,
        receiverWarehouseIdForm: this.warehouses.find(
          (el) => el.id === +form.recipientTaxpayerStoreId
        )?.externalId,
        receiverWarehouseNameForm: this.warehouses.find(
          (el) => el.id === +form.recipientTaxpayerStoreId
        )?.name,
      },
    });

    const products = this.deps.formsForm.get('products') as UntypedFormArray;
    const sectionE2Products = this.deps.formsForm.get('sectionE2Products') as UntypedFormArray;
    const allProducts = [...form.products, ...form.sourceProducts]

    allProducts.forEach((product) => {

      let formProductType = this.deps.formsFacade.getFormProductType(form.type);

      formProductType.setValues(product)

      let productFormGroup = formProductType.generateForm();
      if (product.sectionType === UFormSectionType.SectionE2) {
        this.showDuplicatedTable = true;
        if (form.detailingType === UFormDetailingType.EDITING) {
          productFormGroup.controls['quantity'].disable();
          productFormGroup.controls['price'].disable();
          productFormGroup.controls['unitOfMeasurement'].disable();
        } else if (form.detailingType === UFormDetailingType.CONVERSION) {
          productFormGroup.controls['name'].disable();
        }
        sectionE2Products.push(productFormGroup)
      } else {
        productFormGroup.controls['price'].disable();
        productFormGroup.controls['unitOfMeasurement'].disable();
        products.push(productFormGroup);
      }
      this.isLoading = false;
    });
  }
  private removeEmpty(obj: any){
    Object.keys(obj)
      .forEach(
        (k) => {
          if ((obj[k] === null || obj[k] === '') || this.getLengthIfArray(obj[k]) === 0) delete obj[k]
          else if(typeof obj[k] === 'object') this.removeEmpty(obj[k]);
        }
      );
  }

  private getLengthIfArray(obj: any): number{
    if(Array.isArray(obj)){
      const arr = obj as Array<any>;
      return arr.length;
    }else return -1; // not array
  }
}
