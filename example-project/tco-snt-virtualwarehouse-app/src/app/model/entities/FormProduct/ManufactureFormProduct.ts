import { FormGroup } from "@angular/forms";
import { UFormCustomsDutyType } from "src/app/api/GCPClient";
import { IManufactureFormProduct } from "../../interfaces/Form/FormProduct/IManufactureFormProduct";
import { IUFormProductForm } from "../../interfaces/Form/FormProduct/IUFormProductForm";
import { IFormProduct } from "../../interfaces/IFormProduct";
import { FormProductBase } from "./FormProductBase";

export class ManufactureFormProduct extends FormProductBase implements IManufactureFormProduct{
  constructor(){
    super();
  }
  
}
