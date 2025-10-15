
import { SntType } from '../../api/GCPClient';
import { SelectedView } from '../interfaces/ISelectedView';

export const SntTypes: SelectedView[] = [
  { value: "", viewValue: "Все" },
  { value: SntType.PRIMARY_SNT, viewValue: "Первичная СНТ" },
  { value: SntType.RETURNED_SNT, viewValue: "СНТ на возврат" },
  { value: SntType.FIXED_SNT, viewValue: "Исправленная СНТ" }  
];
