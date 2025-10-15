import { SntImportType } from "src/app/api/GCPClient";
import { SelectedView } from "../interfaces/ISelectedView";

//TODO have to return "--Выберите--" in dropdown
export const SntImportTypes: SelectedView[] = [
  { value: '', viewValue: '--Выберите--' },
  { value: SntImportType[SntImportType.IMPORT], viewValue: '7.1 Ввоз товаров на территорию РК (Импорт)' },
  { value: SntImportType[SntImportType.TEMPORARY_IMPORT], viewValue: '7.3 Временный ввоз' },
];

export const SntFilterImportTypes: SelectedView[] = [
  { value: '', viewValue: 'Все' },
  { value: SntImportType[SntImportType.IMPORT], viewValue: 'Ввоз товаров на территорию РК (Импорт)' },
  { value: SntImportType[SntImportType.TEMPORARY_IMPORT], viewValue: 'Временный ввоз' },
];
