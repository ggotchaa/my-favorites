import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { BalanceUFormDto, BalanceUFormProductDto, ManufactureUFormDto, ManufactureUFormProductDto, MovementUFormDto, MovementUFormProductDto, DetailingUFormDto, DetailingUFormProductDto, UFormClient, UFormDetailingType, UFormType, WriteOffUFormDto, WriteOffUFormProductDto, SigningPageForUFormResponseDto } from "src/app/api/GCPClient";
import { SaveFormDto } from '../../model/entities/SaveFormDto';
import { IFormProduct } from "src/app/model/interfaces/IFormProduct";
import { NotificationService } from "src/app/services/notification.service";

@Injectable({ providedIn: 'root' })
export class FormsService {  

  constructor(
    private notificationService: NotificationService,
    private formsClient: UFormClient) {
    this.formsClient = formsClient;
  }

  private getManufactureFormDto(form: SaveFormDto): ManufactureUFormDto {
    let formProducts: ManufactureUFormProductDto[] = [];

    form.products.forEach(p => {
      let product = new ManufactureUFormProductDto(
        {
          price: +p.price,
          quantity: +p.quantity,
          productId: p.id,
          measureUnitId: p.unitOfMeasurement,
          name: p.name
        });

      formProducts.push(product);
    });

    return new ManufactureUFormDto(
      {
        products: formProducts,
        id: form.id,
        date: form.dateCreation,
        number: form.numberDocument,
        senderTaxpayerStoreId: form.warehouse.warehouseSelector,
        localTimezoneOffsetMinutes: form.dateCreation.getTimezoneOffset() * -1
      }
    );
  }

  private getWriteOffFormDto(form: SaveFormDto): WriteOffUFormDto {
    let formProducts: WriteOffUFormProductDto[] = [];

    form.products.forEach(p => {
      let product = new WriteOffUFormProductDto({
        price: +p.price,
        quantity: +p.quantity,
        balanceId: p.id
      }
      );

      formProducts.push(product);
    });

    return new WriteOffUFormDto(
      {
        products: formProducts,
        id: form.id,
        date: form.dateCreation,
        number: form.numberDocument,
        senderTaxpayerStoreId: form.warehouse.warehouseSelector,
        comment: form.comment,
        writeOffReason: form.writeOffReason,
        localTimezoneOffsetMinutes: form.dateCreation.getTimezoneOffset() * -1
      }
    );
  }

  private getInternalMovingFormDto(form: SaveFormDto): MovementUFormDto {
    let formProducts: MovementUFormProductDto[] = [];

      form.products.forEach(p => {
        let product = new MovementUFormProductDto({
          price: +p.price,
          quantity: +p.quantity,
          balanceId: p.id
        });
  
        formProducts.push(product);
      });

    return new MovementUFormDto(
      {
        products: formProducts,
        id: form.id,
        date: form.dateCreation,
        number: form.numberDocument,
        senderTaxpayerStoreId: form.warehouse.warehouseSelector,
        recipientTaxpayerStoreId: form.warehouse.receiverWarehouseSelector,
        localTimezoneOffsetMinutes: form.dateCreation.getTimezoneOffset() * -1
      }
    );
  }

  private getBalanceFormDto(form: SaveFormDto): BalanceUFormDto {
    let formProducts: BalanceUFormProductDto[] = [];
 
      form.products.forEach(p => {
        let product = new BalanceUFormProductDto({
          price: +p.price,
          quantity: +p.quantity,
          name: p.name,
          measureUnitId: p.unitOfMeasurement,
          manufactureOrImportCountry: p.manufactureOrImportCountry,
          dutyTypeCode: p.dutyType,
          productNameInImportDoc: p.productNameInImportDoc,
          manufactureOrImportDocNumber: p.manufactureOrImportDocNumber,
          productNumberInImportDoc: p.productNumberInImportDoc,
          originCode: p.truOriginCode,
          pinCode: p.pinCode,
          gsvsId: p.id
        });
  
        formProducts.push(product);
      });
    
    return new BalanceUFormDto(
      {
        products: formProducts,
        id: form.id,
        date: form.dateCreation,
        number: form.numberDocument,
        senderTaxpayerStoreId: form.warehouse.warehouseSelector,
        localTimezoneOffsetMinutes: form.dateCreation.getTimezoneOffset() * -1
      }
    );
  }

  private getDetailingFormDto(form: SaveFormDto): DetailingUFormDto | null {
    const modifiedProducts = this.createModifiedProducts(form);
    if(modifiedProducts){
      return this.createDetailingUFormDto(form, modifiedProducts);
    }
  }
  
  private isDetailingForm(form: SaveFormDto): boolean {
    return form.typeForm === UFormType.DETAILING && form.sectionE2Products.length > 0;
  }

  private createModifiedProducts(form: SaveFormDto): DetailingUFormProductDto[] {
    const modifiedProducts: DetailingUFormProductDto[] = [];
  
    if (form.detailingType === UFormDetailingType.PACKING || 
        form.detailingType === UFormDetailingType.UNPACKING) {
      const dataE1Products = [...form.products];
      const dataE2Products = [...form.sectionE2Products];
      var isWarning = (dataE1Products.length === 1 && dataE2Products.length === 1);
      if(isWarning) {
        this.notificationService.warning('Недопустимое кол-во товаров');
        return null;
      }
      if (dataE1Products.length > 0 && dataE2Products.length > 0) {
        dataE1Products.forEach((element) => {
          modifiedProducts.push(this.createModifiedProduct(element, null));
        });
        dataE2Products.forEach((element) => {
          modifiedProducts.push(this.createModifiedProduct(element, element.id));
        });
      }
    } else {
      form.products.forEach((element) => {
        const data = form.sectionE2Products.find((editedProduct) => editedProduct.id === element.id);
        if (data) {
          modifiedProducts.push(this.createModifiedProduct(data, null))
          modifiedProducts.push(this.createModifiedProduct(element, null));
        }
      });
    }
    return modifiedProducts;
  }

  private createProductE1(element: IFormProduct): 
  DetailingUFormProductDto {
    return new DetailingUFormProductDto({
      price: element.price,
      quantity: +element.quantity,
      balanceId: element.id,
      productId: null,
      name: element.name,
      measureUnitId: element.unitOfMeasurement,
      manufactureOrImportCountry: element.manufactureOrImportCountry,
      dutyTypeCode: element.dutyType,
      productNameInImportDoc: element.productNameInImportDoc,
      manufactureOrImportDocNumber: element.manufactureOrImportDocNumber,
      productNumberInImportDoc: element.productNumberInImportDoc,
      originCode: element.truOriginCode,
      sectionType: element.sectionType
    });
  }

  private createProductE2(dataE2Product: IFormProduct): DetailingUFormProductDto {
    return new DetailingUFormProductDto({
      price: dataE2Product.price,
      quantity: +dataE2Product.quantity,
      balanceId: 0,
      productId: dataE2Product.id,
      name: dataE2Product.name,
      measureUnitId: dataE2Product.unitOfMeasurement,
      manufactureOrImportCountry: dataE2Product.manufactureOrImportCountry,
      dutyTypeCode: dataE2Product.dutyType,
      productNameInImportDoc: dataE2Product.productNameInImportDoc,
      manufactureOrImportDocNumber: dataE2Product.manufactureOrImportDocNumber,
      productNumberInImportDoc: dataE2Product.productNumberInImportDoc,
      originCode: dataE2Product.truOriginCode,
      sectionType: dataE2Product.sectionType
    });
  }

  private createModifiedProduct(element: IFormProduct, productId: number): DetailingUFormProductDto {
    return new DetailingUFormProductDto({
      price: +element.price,
      quantity: +element.quantity,
      balanceId: productId ? 0 : element.id,
      productId: productId ? productId : null,
      name: element.name,
      measureUnitId: element.unitOfMeasurement,
      manufactureOrImportCountry: element.manufactureOrImportCountry,
      dutyTypeCode: element.dutyType,
      productNameInImportDoc: element.productNameInImportDoc,
      manufactureOrImportDocNumber: element.manufactureOrImportDocNumber,
      productNumberInImportDoc: element.productNumberInImportDoc,
      originCode: element.truOriginCode,
      sectionType: element.sectionType
    });
  }

  private createDetailingUFormDto(form: SaveFormDto, modifiedProducts: DetailingUFormProductDto[]): DetailingUFormDto {
    return new DetailingUFormDto({
      products: modifiedProducts,
      id: form.id,
      date: form.dateCreation,
      number: form.numberDocument,
      senderTaxpayerStoreId: form.warehouse.warehouseSelector,
      localTimezoneOffsetMinutes: form.dateCreation.getTimezoneOffset() * -1,
      detailingType: form.detailingType,
    });
  }

  saveManufactureFormDraft(form: SaveFormDto): Observable<number> {
    const dto = this.getManufactureFormDto(form);
    return this.formsClient.saveManufactureDraft(dto);
  }

  saveWriteOffFormDraft(form: SaveFormDto): Observable<number> {
    const dto = this.getWriteOffFormDto(form);
    return this.formsClient.saveWriteOffDraft(dto)
  }

  saveInternalMovingFormDraft(form: SaveFormDto): Observable<number> {
    const dto = this.getInternalMovingFormDto(form);
    return this.formsClient.saveMovementDraft(dto);
  }

  saveBalanceFormDraft(form: SaveFormDto): Observable<number> {
    const dto = this.getBalanceFormDto(form);

    return this.formsClient.saveBalanceDraft(dto);
  }

  saveDetailingFormDraft(form: SaveFormDto): Observable<number> {
    const dto = this.getDetailingFormDto(form);
    if(dto){
      return this.formsClient.saveDetailingDraft(dto);
    }
  }

  saveFormDraft(form: SaveFormDto, formType: UFormType): Observable<number> {    
    switch (formType) {
      case UFormType.MANUFACTURE: {
        return this.saveManufactureFormDraft(form);        
      }
      case UFormType.WRITE_OFF: {
        return this.saveWriteOffFormDraft(form);                
      }
      case UFormType.MOVEMENT: {
        return this.saveInternalMovingFormDraft(form);        
      }
      case UFormType.BALANCE: {
        return this.saveBalanceFormDraft(form);        
      }
      case UFormType.DETAILING: {
        return this.saveDetailingFormDraft(form);        
      }
    }
  }

  sendForm(id: number): Observable<SigningPageForUFormResponseDto> {
    return this.formsClient.signingPageToSendUForm(id);
  }  
}
