import { SelectOption } from "../interfaces/ISelectOption";

export const SntOilSetOperationCodes: SelectOption[] = [
  { value: '', viewValue: '-- Не выбрано --' },
  { value: '19', viewValue: 'Отгрузка поставщику нефти ' },
  { value: '20', viewValue: 'Реализация оптовикам' },
  { value: '21', viewValue: 'Реализация в розничную сеть' },
  { value: '22', viewValue: 'Конечному потребителю' },
  { value: '25', viewValue: 'Отгружено на переработку' },
  { value: '26', viewValue: 'Отгрузка на территорию г.Байконур' },
  { value: '28', viewValue: 'Отгрузка поставщику прочего сырья' }
];
