import { UFormCustomsDutyType } from '../../api/GCPClient';
import { SelectOption } from '../interfaces/ISelectOption';

export const DUTYTYPES: SelectOption[] = [
  { value: '', viewValue: '-- Не выбрано --' },
  { value: UFormCustomsDutyType.CCT, viewValue: 'ЕТТ' },
  { value: UFormCustomsDutyType.WTO, viewValue: 'ВТО' },
  { value: UFormCustomsDutyType.EAEU, viewValue: 'ЕАЭС' },
  { value: UFormCustomsDutyType.NOT_INSTALLED, viewValue: 'Не установлено' },
];
