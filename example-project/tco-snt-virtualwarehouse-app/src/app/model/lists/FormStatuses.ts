
import { UFormStatusType } from 'src/app/api/GCPClient';
import { SelectedView } from '../interfaces/ISelectedView';

export const FormsStatuses: SelectedView[] = [
  { value: '', viewValue: '- Не выбрано -' },
  { value: UFormStatusType.IN_PROCESSING, viewValue: "В обработке" },
  { value: UFormStatusType.PROCESSED, viewValue: "Обработанный" },
  { value: UFormStatusType.CANCELED, viewValue: "Отменено" },
  { value: UFormStatusType.FAILED, viewValue: "Ошибочный" },
  { value: UFormStatusType.DRAFT, viewValue: "Черновик" }
];
