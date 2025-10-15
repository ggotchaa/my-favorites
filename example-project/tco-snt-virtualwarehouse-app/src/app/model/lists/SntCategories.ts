import { SntCategory } from 'src/app/api/GCPClient';
import { SelectedView } from '../interfaces/ISelectedView';

export const SntCategories: SelectedView[] = [
  { value: '', viewValue: 'Все' },
  { value: SntCategory.OUTBOUND, viewValue: 'Отправленные' },
  { value: SntCategory.INBOUND, viewValue: 'Полученные' },
  { value: SntCategory.INPROGRESS, viewValue: 'В работе' }
]
