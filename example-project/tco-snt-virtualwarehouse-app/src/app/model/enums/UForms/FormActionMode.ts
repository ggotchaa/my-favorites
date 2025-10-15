export enum FormActionMode{
  Add,
  Edit,
  Show,
  Correction
}

export const FormActionModeNames = [
  {mode: FormActionMode.Add, name: 'Создание формы'},
  {mode: FormActionMode.Edit, name: 'Редактирование формы'},
  {mode: FormActionMode.Show, name: 'Просмотр формы'},
  {mode: FormActionMode.Correction, name: 'Исправление формы'}
];
