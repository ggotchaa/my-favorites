import { SelectedView } from '../../interfaces/ISelectedView';

export const NotificationActionTypes: SelectedView[] = [
  { value: "CREATE", viewValue: 'Создание' },
  { value: "CONFIRM", viewValue: 'Подтверждение' },
  { value: "DECLINE", viewValue: 'Отклонение' },
  { value: "REVOKE", viewValue: 'Отзыв' }
]
