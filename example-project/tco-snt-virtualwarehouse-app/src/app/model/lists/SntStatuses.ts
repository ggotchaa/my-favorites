import { SntStatus } from '../../api/GCPClient';
import { SelectedView } from '../interfaces/ISelectedView';

export const SntStatuses: SelectedView[] = [
  { value: SntStatus.DRAFT, viewValue: 'Черновик' },
  { value: SntStatus.NOT_VIEWED, viewValue: 'Не просмотрен'},
  { value: SntStatus.DELIVERED, viewValue: 'Доставлен'},  
  { value: SntStatus.IMPORTED, viewValue: 'Импортирован' },
  { value: SntStatus.FAILED, viewValue: 'Ошибочный' },
  { value: SntStatus.CONFIRMED, viewValue: "Подтвержден" },
  { value: SntStatus.DECLINED, viewValue: 'Отклонен' },
  { value: SntStatus.CONFIRMED_BY_OGD, viewValue: 'Подтвержден инспектором ОГД' },
  { value: SntStatus.DECLINED_BY_OGD, viewValue: 'Отклонен инспектором ОГД' },
  { value: SntStatus.CANCELED, viewValue: 'Аннулирован' },
  { value: SntStatus.REVOKED, viewValue: 'Отозван' }
]
