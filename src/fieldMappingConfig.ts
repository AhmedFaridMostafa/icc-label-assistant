export interface FieldMapping {
  excelField: string;
  targetField: string;
  transform?: (value: string | number | Date) => string | number;
}

export const defaultFieldMappings: FieldMapping[] = [
  {
    excelField: 'print qty',
    targetField: 'printQty',
    transform: (value) => String(Number(value) * 12),
  },
  {
    excelField: 'carton weight',
    targetField: 'cartonWeight',
    transform: (value) => Number(value).toFixed(2),
  },
  {
    excelField: 'carton length',
    targetField: 'cartonLength',
    transform: (value) => String(parseInt(String(value))),
  },
  {
    excelField: 'carton width',
    targetField: 'cartonWidth',
    transform: (value) => String(parseInt(String(value))),
  },
  {
    excelField: 'carton height',
    targetField: 'cartonHeight',
    transform: (value) => String(parseInt(String(value))),
  },
  {
    excelField: 'Ship Date',
    targetField: 'ShipDate',
    transform: (value) => String(value).trim(),
  },
  {
    excelField: 'Master Box Quantity',
    targetField: 'masterBoxQuantity',
    transform: (value) => String(parseInt(String(value))),
  },
  {
    excelField: 'packing',
    targetField: 'packing',
    transform: (value) => String(parseInt(String(value))),
  },
];

export interface FormFieldMapping {
  dataField: string;
  selector: string | ((index: number) => string);
  setValue: (element: Element, value: string) => void;
}

export const defaultFormFieldMappings: FormFieldMapping[] = [
  {
    dataField: 'printQty',
    selector: 'input',
    setValue: (element, value) => {
      (element as HTMLInputElement).value = value;
    },
  },
  {
    dataField: 'cartonWeight',
    selector: 'input',
    setValue: (element, value) => {
      (element as HTMLInputElement).value = value;
    },
  },
  {
    dataField: 'cartonLength',
    selector: 'input',
    setValue: (element, value) => {
      (element as HTMLInputElement).value = value;
    },
  },
  {
    dataField: 'cartonWidth',
    selector: 'input',
    setValue: (element, value) => {
      (element as HTMLInputElement).value = value;
    },
  },
  {
    dataField: 'cartonHeight',
    selector: 'input',
    setValue: (element, value) => {
      (element as HTMLInputElement).value = value;
    },
  },
  {
    dataField: 'masterBoxQuantity',
    selector: 'input',
    setValue: (element, value) => {
      (element as HTMLInputElement).value = value;
    },
  },
  {
    dataField: 'packing',
    selector: 'input',
    setValue: (element, value) => {
      (element as HTMLInputElement).value = value;
    },
  },
];

export interface ColumnMapping {
  columnIndex: number;
  dataField: string;
}

export const defaultColumnMappings: ColumnMapping[] = [
  { columnIndex: 0, dataField: 'printQty' },
  { columnIndex: 1, dataField: 'cartonWeight' },
  { columnIndex: 2, dataField: 'cartonLength' },
  { columnIndex: 3, dataField: 'cartonWidth' },
  { columnIndex: 4, dataField: 'cartonHeight' },
  { columnIndex: 12, dataField: 'masterBoxQuantity' },
  { columnIndex: 13, dataField: 'packing' },
];

export interface MonthYearMapping {
  monthColumnIndex: number;
  monthComboNamePattern: string;
  monthInputSelector: string;
  yearComboNamePattern: string;
  yearInputSelector: string;
}

export const defaultMonthYearMapping: MonthYearMapping = {
  monthColumnIndex: 5,
  monthComboNamePattern: 'lot_month_$INDEX',
  monthInputSelector: '[id*="lot_month"][id$="_I"]',
  yearComboNamePattern: 'lot_year_$INDEX',
  yearInputSelector: '[id*="lot_year"][id$="_I"]',
};
