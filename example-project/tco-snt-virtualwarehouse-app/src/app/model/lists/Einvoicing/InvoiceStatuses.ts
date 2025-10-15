import { InvoiceStatus } from 'src/app/api/GCPClient';
import { SelectedView } from '../../interfaces/ISelectedView';

export const InvoiceStatuses: SelectedView[] = [
  { value: InvoiceStatus.DRAFT, viewValue: 'Черновик' },
  { value: InvoiceStatus.IN_PROCESSING, viewValue: 'В обработке' },
  { value: InvoiceStatus.DELIVERED, viewValue: 'Доставленный' },
  { value: InvoiceStatus.IMPORTED, viewValue: 'Импортированный' },
  { value: InvoiceStatus.FAILED, viewValue: 'Ошибочный' },
  { value: InvoiceStatus.IN_QUEUE, viewValue: "В очереди" },
  { value: InvoiceStatus.CREATED, viewValue: 'Созданный' },
  { value: InvoiceStatus.CANCELED_BY_OGD, viewValue: 'Аннулирован ИС ЭСФ для отнесения в зачет и на вычеты' },
  { value: InvoiceStatus.CANCELED_BY_SNT_DECLINE, viewValue: 'Аннулирован при отклонении СНТ' },
  { value: InvoiceStatus.CANCELED_BY_SNT_REVOKE, viewValue: 'Аннулирован при отзыве СНТ' },
  { value: InvoiceStatus.DECLINED, viewValue: 'Отклоненный' },
  { value: InvoiceStatus.CANCELED, viewValue: 'Аннулированный' },
  { value: InvoiceStatus.REVOKED, viewValue: 'Отозванный' },
  { value: InvoiceStatus.DELETED, viewValue: 'Удаленный' }
]