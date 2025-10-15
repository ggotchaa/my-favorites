import { SntTransferType } from "src/app/api/GCPClient";
import { SelectedView } from "../interfaces/ISelectedView";

export const SntTransferTypes: SelectedView[] = [
  { value: '', viewValue: '--Выберите--' },
  { value: SntTransferType[SntTransferType.ONE_PERSON_IN_KZ], viewValue: '9.1 В пределах одного лица на территории РК' },
  { value: SntTransferType[SntTransferType.ONE_PERSON_IN_EAEU], viewValue: '9.2 В пределах одного лица в рамках ЕАЭС' },
  { value: SntTransferType[SntTransferType.OTHER], viewValue: '9.3 Иное перемещение' }
];

export const SntFilterTransferTypes: SelectedView[] = [
  { value: '', viewValue: 'Все' },
  { value: SntTransferType[SntTransferType.ONE_PERSON_IN_KZ], viewValue: 'В пределах одного лица на территории РК' },
  { value: SntTransferType[SntTransferType.ONE_PERSON_IN_EAEU], viewValue: 'В пределах одного лица в рамках ЕАЭС' },
  { value: SntTransferType[SntTransferType.OTHER], viewValue: 'Иное перемещение' }
];
