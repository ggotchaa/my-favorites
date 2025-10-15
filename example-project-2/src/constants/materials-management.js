export const TABLE_COLUMNS = [
  {
    id: "stockCode",
    label: "Stock code",
    width: 80,
    isVisible: true,
    order: 1,
    isChecked: true,
    isDisabled: true,
    align: "left",
  },
  {
    id: "manufacturerAndPartNumber",
    label: "Manufacturer & part number",
    width: 150,
    isVisible: true,
    order: 2,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "purchaseOrderNumber",
    label: "Purchase order number",
    width: 150,
    isVisible: true,
    order: 3,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "purchaseOrderNumberLine",
    label: "Purchase order number line",
    width: 150,
    isVisible: true,
    order: 4,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
  {
    id: "description",
    label: "Description",
    width: 250,
    isVisible: true,
    order: 5,
    isChecked: true,
    isDisabled: true,
    align: "left",
  },
  {
    id: "customDeclarationNumber",
    label: "Custom declaration number",
    width: 150,
    isVisible: true,
    order: 6,
    isChecked: true,
    isDisabled: false,
    align: "left",
  },
];

export const TABLE_COLUMN_LABELS = {
  stockCode: "Stock code",
  manufacturer: "Manufacturer",
  manufacturerPartNumber: "Part number",
  purchaseOrderNumber: "Purchase order number",
  purchaseOrderNumberLine: "Purchase order number line",
  description: "Description",
  customDeclarationNumber: "Custom declaration number",
};

export const TABLE_COLUMNS_IN_FILTER = [
  {
    id: "stockCode",
    value: "stockCode",
    label: "Stock code",
  },
  {
    id: "manufacturer",
    value: "manufacturerAndPartNumber",
    label: "Manufacturer",
  },
  {
    id: "manufacturerPartNumber",
    value: "manufacturerAndPartNumber",
    label: "Part number",
  },
  {
    id: "purchaseOrderNumber",
    value: "purchaseOrderNumber",
    label: "Purchase order number",
  },
  {
    id: "purchaseOrderNumberLine",
    value: "purchaseOrderNumberLine",
    label: "Purchase order number line",
  },
  {
    id: "description",
    value: "description",
    label: "Description",
  },
  {
    id: "customDeclarationNumber",
    value: "customDeclarationNumber",
    label: "Custom declaration number",
  },
];

export const OPERATOR = [
  {
    value: "=",
    label: "Equals",
  },
  {
    value: "%",
    label: "Contains",
  },
  {
    value: "%S",
    label: "Starts With",
  },
  {
    value: "%E",
    label: "Ends With",
  },
];

export const FILENAME = "Materials Management";
