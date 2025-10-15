import { SntExportType } from "src/app/api/GCPClient";
import { SelectedView } from "../interfaces/ISelectedView";

//TODO have to return "--Выберите--" in dropdown
export const SntExportTypes: SelectedView[] = [
   { value:  '', viewValue: '--Выберите--' },
  { value: SntExportType.EXPORT, viewValue: '8.1 Вывоз товаров с территории РК (Экспорт)' },
  { value: SntExportType.TEMPORARY_EXPORT, viewValue: '8.3 Временный вывоз' }
];

export const SntFilterExportTypes: SelectedView[] = [
  { value: '', viewValue: 'Все' },
  { value: SntExportType.EXPORT, viewValue: 'Вывоз товаров с территории РК (Экспорт)' },
  { value: SntExportType.TEMPORARY_EXPORT, viewValue: 'Временный вывоз' }
];
