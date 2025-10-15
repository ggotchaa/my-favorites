import { UntypedFormControl} from "@angular/forms";
import { IWriteOffFormProduct } from "../../interfaces/Form/FormProduct/IWriteOffFormProduct";
import { FormProductBase } from "./FormProductBase";

export class WriteOffFormProduct extends FormProductBase implements IWriteOffFormProduct{
  productIdentificator?: UntypedFormControl;

  constructor(){
    super();
  }
}

