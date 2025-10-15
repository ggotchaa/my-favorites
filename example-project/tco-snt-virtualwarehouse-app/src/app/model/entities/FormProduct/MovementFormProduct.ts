import { FormGroup } from "@angular/forms";
import { IMovementFormProduct } from "../../interfaces/Form/FormProduct/IMovementFormProduct";
import { IUFormProductForm } from "../../interfaces/Form/FormProduct/IUFormProductForm";
import { FormProductBase } from "./FormProductBase";

export class MovementFormProduct extends FormProductBase implements IMovementFormProduct {

  constructor(){
    super();
  }
}
