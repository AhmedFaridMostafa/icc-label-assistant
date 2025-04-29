import * as XLSX from 'xlsx';
import { ExcelRow } from '../types';

export default async function readExcelFile(file: File): Promise<ExcelRow[]> {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellStyles: false,
  });

  if (workbook.SheetNames.length === 0)
    throw new Error('No sheets found in the workbook');

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet['!ref']) throw new Error('Worksheet is empty');

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  range.e.r = range.s.r;

  const rawHeader = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    range,
  })[0] as string[];

  if (!rawHeader || rawHeader.length === 0)
    throw new Error('No header row found in the worksheet');

  const cleanedHeader = rawHeader.map((h: string) =>
    typeof h === 'string' ? h.trim() : String(h),
  );

  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: cleanedHeader,
    range: 1,
  }) as ExcelRow[];

  if (jsonData.length === 0)
    throw new Error('No data rows found in the worksheet');

  if (!jsonData[0]['PO#'])
    throw new Error(`PO key field "PO#" not found in the data`);

  return jsonData;
}
