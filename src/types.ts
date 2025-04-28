export interface ExcelRow {
  [key: string]: string | number | Date | undefined; // Allow any field name with undefined
  'PO#'?: string;
  'print qty'?: string | number;
  'carton weight'?: string | number;
  'carton length'?: string | number;
  'carton width'?: string | number;
  'carton height'?: string | number;
  'Ship Date'?: string | Date;
  'Master Box Quantity'?: string | number;
  packing?: string | number;
}

export interface DataWithHandle {
  [key: string]: string | number; // Allow any field name
  cartonWeight: string;
  cartonLength: string;
  cartonWidth: string;
  cartonHeight: string;
  ShipDate: string;
  masterBoxQuantity: string;
  packing: string;
  monthNumber: string;
  month: string;
  year: number;
  printQty: string;
}

export interface DevExpressComboBox {
  SetValue: (value: string) => void;
  GetSelectedItem: () => { value: string };
}

export interface UserFeedback {
  message: string;
  type: 'success' | 'error' | 'info';
}

export type POKeyField = string; // Field to use as the key for PO mapping
