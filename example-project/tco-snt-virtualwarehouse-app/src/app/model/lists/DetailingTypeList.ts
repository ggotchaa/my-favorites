import { UFormDetailingType } from 'src/app/api/GCPClient';
import { SelectedView } from '../interfaces/ISelectedView';

export const DetailingTypeList: SelectedView[] = [
    { value: UFormDetailingType.EDITING, viewValue: "Редактирование данных" },
    { value: UFormDetailingType.CONVERSION, viewValue: "Конвертация между разными единицами измерения" },
    { value: UFormDetailingType.PACKING, viewValue: "Комплектация" },
    { value: UFormDetailingType.UNPACKING, viewValue: "Разукомплектация" },
];
