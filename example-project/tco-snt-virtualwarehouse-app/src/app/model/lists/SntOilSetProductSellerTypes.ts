import { SelectOption } from "../interfaces/ISelectOption";

export const SntOilSetProductSellerTypes: SelectOption[] = [
  { value: '', viewValue: '-- Не выбрано --' },
  { value: '1', viewValue: 'Производитель' },
  { value: '2', viewValue: 'Оптовик' },
  { value: '3', viewValue: 'Розничный реализатор' },
  { value: '4', viewValue: 'Импортер' },
  { value: '5', viewValue: 'Поставщик нефти' },
  { value: '6', viewValue: 'Конечный потребитель, осуществляющий внутреннее перемещение приобретенных товаров' },
  { value: '7', viewValue: 'Конечный потребитель, осуществляющий возврат приобретенных товаров' },
  { value: '8', viewValue: 'Потребитель, осуществляющий возврат импортированных товаров' },
  { value: '9', viewValue: 'Окончательное потребление приобретенных товаров конечным потребителем' }
];
