import { useState } from 'react';
import * as XLSX from 'xlsx';
import { DataWithHandle, ExcelRow, UserFeedback } from './types';
import mapExcelDataWithHandle from './utils/mapExcelDataWithHandle';

export default function useExcel() {
  const [iccData, setIccData] = useState<{ [key: string]: DataWithHandle }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<UserFeedback | null>(null);
  const poKey = 'PO#';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      setFeedback(null);
      const file = e.target.files?.[0];
      if (!file) {
        setFeedback({ message: 'No file selected', type: 'error' });
        return;
      }

      // Check file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        setFeedback({
          message: 'Invalid file type. Please select an Excel or CSV file.',
          type: 'error',
        });
        return;
      }

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

      if (!jsonData[0][poKey])
        throw new Error(`PO key field "${poKey}" not found in the data`);

      const dataWithHandel = jsonData.reduce(mapExcelDataWithHandle, {});

      setIccData(dataWithHandel);
      setFeedback({
        message: `Successfully processed ${Object.keys(dataWithHandel).length} records`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error processing file',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setIccData({});
    setFeedback(null);
  };

  return {
    handleFileChange,
    iccData,
    isLoading,
    feedback,
    clearData,
  };
}
