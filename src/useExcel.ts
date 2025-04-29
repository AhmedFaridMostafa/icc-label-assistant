import { useState } from 'react';

import { DataWithHandle, UserFeedback } from './types';
import mapExcelDataWithHandle from './utils/mapExcelDataWithHandle';
import readExcelFile from './utils/readExcelFile';

export default function useExcel() {
  const [iccData, setIccData] = useState<{ [key: string]: DataWithHandle }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<UserFeedback | null>(null);

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

      const jsonData = await readExcelFile(file);
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
