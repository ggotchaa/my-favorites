import { ProductType } from '../enums/ProductType';
import { SelectOption } from '../interfaces/ISelectOption';

export const PRODUCTTYPES: SelectOption[] = [
  { value: ProductType.PetroleumProducts, viewValue: 'Нефтепродукты' },
  { value: ProductType.EthylAlcohol, viewValue: 'Этиловый спирт и алкоголь' },
  { value: ProductType.TobaccoProducts, viewValue: 'Табачные изделия' }
];
