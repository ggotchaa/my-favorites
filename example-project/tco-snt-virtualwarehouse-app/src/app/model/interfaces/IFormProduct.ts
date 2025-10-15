import { UFormCustomsDutyType, UFormSectionType } from "../../api/GCPClient";

export interface IFormProduct {
  id: number;
  number: number,
  name: string,
  compositeGsvsCode?: string,
  codeTNVED: string,
  unitOfMeasurement: number,
  quantity: number,
  price: number,
  sum: number,
  productIdentificator?: number,
  truOriginCode?: number,
  dutyType?: UFormCustomsDutyType,
  manufactureOrImportCountry? : string,
  manufactureOrImportDocNumber? : string,
  productNameInImportDoc?: string,
  productNumberInImportDoc?: string,
  pinCode?: string,
  sectionType?: UFormSectionType
}
