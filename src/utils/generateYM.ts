export interface DateInfo {
  monthNumber: string;
  month: string;
  year: number;
}

export default function generateYM(shipDate: string | Date): DateInfo {
  try {
    const date = shipDate instanceof Date ? shipDate : new Date(shipDate);

    // Check if date is valid
    if (isNaN(date.getTime())) throw new Error(`Invalid date: ${shipDate}`);

    const monthNumber = date.getMonth() + 1;
    const monthName = date.toLocaleString('default', { month: 'long' });
    const month = `${monthNumber} - ${monthName}`;
    const year = date.getFullYear();

    return {
      monthNumber: monthNumber.toString().padStart(2, '0'),
      month,
      year,
    };
  } catch (error) {
    console.error(`Error processing date: ${shipDate}`, error);
    // Return fallback values
    const currentDate = new Date();
    return {
      monthNumber: (currentDate.getMonth() + 1).toString().padStart(2, '0'),
      month: `${currentDate.getMonth() + 1} - ${currentDate.toLocaleString('default', { month: 'long' })}`,
      year: currentDate.getFullYear(),
    };
  }
}
