import { SelectedView } from "../../interfaces/ISelectedView";

export const TransportTypeCodes: SelectedView[] = [
  { value: '10', viewValue: "Морской/речной транспорт" },
  { value: '20', viewValue: "Железнодорожный транспорт" },
  { value: '30', viewValue: "Автодорожный транспорт, за исключением транспортных средств, указанных под кодами 31, 32" },
  { value: '31', viewValue: "Состав транспортныз средств (тягач с полуприцепом или прицепом)" },
  { value: '32', viewValue: "Состав транспортныз средств (тягач с полуприцепом (-ами) или прицепом (-ами))" },
  { value: '40', viewValue: "Воздушный транспорт" },
  { value: '50', viewValue: "Почтовое отправление" },
  { value: '71', viewValue: "Трубопроводный транспорт" },
  { value: '72', viewValue: "Линии электропередачи" },
  { value: '80', viewValue: "Внутренний водный транспорт" },
  { value: '90', viewValue: "Транспортное средство, перемещающееся в качестве товара своим ходом" },
  { value: '99', viewValue: "Прочие" },
];
