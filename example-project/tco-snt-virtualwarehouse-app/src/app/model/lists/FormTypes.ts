import { UFormType } from '../../api/GCPClient';
import { SelectedView } from '../interfaces/ISelectedView';

export const FormTypes: SelectedView[] = [
  { value: UFormType.MANUFACTURE, viewValue: "Производство" },
  { value: UFormType.WRITE_OFF, viewValue: "Списание" },
  { value: UFormType.MOVEMENT, viewValue: "Внутреннее перемещение" },
  { value: UFormType.BALANCE, viewValue: "Остатки" },
  { value: UFormType.DETAILING, viewValue: "Детализация" },
];

export const FormFilterTypes: SelectedView[] = [
  { value: '', viewValue: "-- Не выбрано --" },
  { value: UFormType.MANUFACTURE, viewValue: "Производство" },
  { value: UFormType.WRITE_OFF, viewValue: "Списание" },
  { value: UFormType.MOVEMENT, viewValue: "Внутреннее перемещение" },
  { value: UFormType.BALANCE, viewValue: "Остатки" },
  { value: UFormType.DETAILING, viewValue: "Детализация"}
];
