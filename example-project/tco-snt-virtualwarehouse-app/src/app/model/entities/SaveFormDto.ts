import { UFormDetailingType, UFormWriteOffType } from "src/app/api/GCPClient";
import { IFormProduct } from "../interfaces/IFormProduct";

export class SaveFormDto {
  id?: number;

  typeForm: string;

  dateCreation: Date;

  detailingType: UFormDetailingType;

  writeOffReason: UFormWriteOffType;

  registrationNumber: number;

  dateFormation: Date;

  numberDocument: string;

  comment?: string;

  warehouse: {
    warehouseSelector: number;
    receiverWarehouseSelector?: number;
  }

  products: IFormProduct[];

  sectionE2Products: IFormProduct[];

  public constructor(init?: Partial<SaveFormDto>) {
    Object.assign(this, init);
  }
}
