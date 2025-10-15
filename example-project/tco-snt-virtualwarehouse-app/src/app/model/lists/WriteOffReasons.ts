import { SelectedView } from '../interfaces/ISelectedView';
import { UFormWriteOffType} from 'src/app/api/GCPClient';

export const WRITEOFFREASONS: SelectedView[] = [

  { value: UFormWriteOffType.NO_REQUIREMENTS_FOR_SNT, viewValue: "Отсутствует требование по оформлению следующего СНТ" },
  { value: UFormWriteOffType.SOLD_IN_RETAIL_OR_COUPONS, viewValue: "Реализовано в розничной торговле по чекам ККМ" },
  { value: UFormWriteOffType.MANUFACTURE, viewValue: "Производство" },
  { value: UFormWriteOffType.SERVICE, viewValue: "Услуга, работа" },
  { value: UFormWriteOffType.CONVERSION, viewValue: "Переработка давальческого сырья" },
  { value: UFormWriteOffType.MEDICAL_NEEDS, viewValue: "Медицинские нужды" },
  { value: UFormWriteOffType.TECHNICAL_NEEDS, viewValue: "Технические нужды" },
  { value: UFormWriteOffType.NATURAL_DECREASE_IN_NORM, viewValue: "Естественная убыль в пределах норм" },
  { value: UFormWriteOffType.NATURAL_DECREASE_OVER_NORM, viewValue: "Естественная убыль сверх норм" },
  { value: UFormWriteOffType.SOCIAL_PACKAGE, viewValue: "Гарантированный социальный пакет" },
  { value: UFormWriteOffType.DAMAGE, viewValue: "Порча/утрата" },
  { value: UFormWriteOffType.RECYCLING, viewValue: "Утилизация" },
  { value: UFormWriteOffType.RECLAMATION, viewValue: "Рекламация" },
  { value: UFormWriteOffType.LOSS, viewValue: "Утеря" },
  { value: UFormWriteOffType.THEFT, viewValue: "Хищение" },
  { value: UFormWriteOffType.WRITE_OFF_BY_GUILTY, viewValue: "Обращение на виновное лицо" },
  { value: UFormWriteOffType.ACCOUNTING_FIXED_ASSETS, viewValue: "Учет ОС/ФА" },
  { value: UFormWriteOffType.MISTAKE, viewValue: "Ошибка ввода на ВС" },
  { value: UFormWriteOffType.IS_NOT_VSTORE, viewValue: "Товар с данным кодом ТНВЭД не подлежит ведению в модуле \"Виртуальный склад\"" },
  { value: UFormWriteOffType.OTHER, viewValue: "Прочее" },
  { value: UFormWriteOffType.COUPONS_OR_CARDS_PAYMENTS, viewValue: "Реализовано по талонам или картам по всем видам оплат" }
];
