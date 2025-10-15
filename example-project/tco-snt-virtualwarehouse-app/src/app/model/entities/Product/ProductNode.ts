import { GsvsType, ProductDto } from "../../../api/GCPClient";

export class ProductNode extends ProductDto {

  constructor(
    productDto: ProductDto,
    public level = 1,    
    public isLoading = false) {
    super(productDto);    
  }

  get canBeSelected() {
    return this.gsvsTypeCode === GsvsType.TNVED || this.gsvsTypeCode === GsvsType.GTIN;
    }

  get isGtinNode() {
    return this.gsvsTypeCode === GsvsType.GTIN;
  }

  get isTnvedNode() {
    return this.gsvsTypeCode === GsvsType.TNVED;
  }
}
