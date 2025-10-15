export enum InvoiceActionMode{
  Add,
  Edit,
  Show,
  Correction,
  Read
}

export const InvoiceActionModeNames = [
  { mode: InvoiceActionMode.Add, name: 'Новый электронный счет-фактура' },
  { mode: InvoiceActionMode.Edit, name: 'Редактирование электронного счета-фактуры' },
  { mode: InvoiceActionMode.Read, name: 'Просмотр электронного счета-фактуры' },
];
