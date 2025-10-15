import { AwpStatus } from "../../../api/GCPClient";
import { SelectedView } from "../../interfaces/ISelectedView";

export const AwpStatuses: SelectedView[] = [
  { value: AwpStatus.DRAFT, viewValue: 'Черновик' },
  { value: AwpStatus.NOT_VIEWED, viewValue: 'Не просмотрен' },
  { value: AwpStatus.DELIVERED, viewValue: 'Доставленный' },
  { value: AwpStatus.CREATED, viewValue: 'Созданный' },
  { value: AwpStatus.IMPORTED, viewValue: 'Черновик импортирован' },
  { value: AwpStatus.FAILED, viewValue: 'Ошибочный' },
  { value: AwpStatus.CONFIRMED, viewValue: 'Подтвержден' },
  { value: AwpStatus.DECLINED, viewValue: 'Отклонен' },
  { value: AwpStatus.REVOKED, viewValue: 'Отозван' },
  { value: AwpStatus.IN_TERMINATING, viewValue: 'В процессе расторжения' },
  { value: AwpStatus.TERMINATED, viewValue: 'Расторгнут' }
];
