import { defaultFieldMappings } from '../fieldMappingConfig';
import { DataWithHandle, ExcelRow } from '../types';
import generateYM from './generateYM';

export default function mapExcelDataWithHandle(
  acc: { [key: string]: DataWithHandle },
  row: ExcelRow,
) {
  const po = String(row['PO#'] || '');
  if (!po) return acc;
  const shipDateField =
    defaultFieldMappings.find((m) => m.targetField === 'ShipDate')
      ?.excelField || 'Ship Date';
  const shipDate = row[shipDateField];
  if (!shipDate) {
    console.warn(`Missing ship date for PO: ${po}`);
    return acc;
  }

  let safeShipDate: string | Date;

  if (typeof shipDate === 'number') {
    safeShipDate = String(shipDate);
  } else {
    safeShipDate = shipDate as string | Date;
  }

  const { year, month, monthNumber } = generateYM(safeShipDate);

  const record = {
    monthNumber,
    month,
    year,
    ShipDate:
      typeof shipDate === 'object' && shipDate instanceof Date
        ? shipDate.toISOString().split('T')[0]
        : String(shipDate).trim(),
  } as DataWithHandle;

  defaultFieldMappings.forEach((mapping) => {
    const { excelField, targetField, transform } = mapping;
    const value = row[excelField];

    if (value !== undefined) {
      if (transform) {
        record[targetField] = transform(value);
      } else {
        record[targetField] = String(value);
      }
    }
  });

  acc[po] = record as DataWithHandle;
  return acc;
}
