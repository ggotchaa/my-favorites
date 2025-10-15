export enum SntActionMode{
  Add,
  Edit,
  Show,
  Correction,
  Copy
}

export const SntActionModeNames = [
  {mode: SntActionMode.Add, name: 'Создание СНТ'},
  {mode: SntActionMode.Edit, name: 'Редактирование СНТ'},
  {mode: SntActionMode.Show, name: 'Просмотр СНТ'},
  {mode: SntActionMode.Correction, name: 'Исправление СНТ'},
  {mode: SntActionMode.Copy, name: 'Копирование СНТ'}
];
