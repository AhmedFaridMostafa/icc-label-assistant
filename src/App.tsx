import { useState } from 'react';
import { DataWithHandle, UserFeedback } from './types';
import useExcel from './useExcel';
import ICCLogo from '/logo.png';
import {
  ColumnMapping,
  defaultColumnMappings,
  defaultMonthYearMapping,
  MonthYearMapping,
} from './fieldMappingConfig';
import FeedbackMessage from './FeedbackMessage';

// Define the DevExpress ComboBox interface
interface DevExpressComboBox {
  SetValue: (value: string) => void;
  GetSelectedItem: () => { value: string };
}

// Extend the Window interface to allow indexing with strings
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    saveLot?: (index: number, lotCode: string) => void;
  }
}

function App() {
  const { handleFileChange, iccData, isLoading, feedback, clearData } =
    useExcel();
  const [executionStatus, setExecutionStatus] = useState<UserFeedback | null>(
    null,
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [poColumnIndex, setPoColumnIndex] = useState(8);

  const fillForm = async () => {
    try {
      setExecutionStatus(null);

      // Get current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) {
        setExecutionStatus({
          message: 'Could not access current tab',
          type: 'error',
        });
        return;
      }

      if (!iccData || Object.keys(iccData).length === 0) {
        setExecutionStatus({
          message: 'No data available. Please upload an Excel file first.',
          type: 'error',
        });
        return;
      }

      await chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          args: [
            iccData,
            defaultColumnMappings,
            defaultMonthYearMapping,
            poColumnIndex,
          ],
          func: (
            iccData: { [key: string]: DataWithHandle },
            columnMappings: ColumnMapping[],
            monthYearMapping: MonthYearMapping,
            poColumnIdx: number,
          ) => {
            if (!iccData) {
              console.error('No ICC data found');
              return { success: false, message: 'No data provided' };
            }

            const rows = document.querySelectorAll(
              '.dxgvDataRow_Office2010Silver',
            );
            if (rows.length === 0) {
              console.error('No rows found');
              return { success: false, message: 'No rows found on the page' };
            }

            let filledCount = 0;
            const errors: string[] = [];

            rows.forEach((row, index) => {
              try {
                const children = row?.children;
                if (!children) {
                  throw new Error(`Row ${index} has no children`);
                }

                const PO = children[poColumnIdx]?.textContent?.trim();
                if (!PO || !iccData[PO]) {
                  console.log(`No data found for PO: ${PO}`);
                  return;
                }

                const rowData = iccData[PO];

                // Fill the simple fields
                columnMappings.forEach((mapping) => {
                  try {
                    const { columnIndex, dataField } = mapping;
                    const cell = children[columnIndex];
                    if (!cell) return;

                    const inputs = cell.querySelectorAll('input');
                    inputs.forEach((input) => {
                      input.value = rowData[dataField]
                        ? String(rowData[dataField])
                        : input.value;
                      // Trigger change event
                      const event = new Event('change', { bubbles: true });
                      input.dispatchEvent(event);
                    });
                  } catch (fieldError) {
                    console.error(
                      `Error setting field at column ${mapping.columnIndex}:`,
                      fieldError,
                    );
                  }
                });

                // Handle month and year dropdowns
                try {
                  // Get month and year from the data
                  const monthNum = rowData.monthNumber;
                  const yearLastTwoDigits = String(rowData.year).slice(-2);

                  // Construct ComboBox names using index
                  const monthComboName =
                    monthYearMapping.monthComboNamePattern.replace(
                      '$INDEX',
                      String(index),
                    );
                  const yearComboName =
                    monthYearMapping.yearComboNamePattern.replace(
                      '$INDEX',
                      String(index),
                    );

                  // Access ComboBox from window using short name
                  const monthCombo = window[monthComboName] as
                    | DevExpressComboBox
                    | undefined;
                  const yearCombo = window[yearComboName] as
                    | DevExpressComboBox
                    | undefined;

                  const monthCell = children[monthYearMapping.monthColumnIndex];

                  // Set month value
                  if (monthCombo) {
                    monthCombo.SetValue(monthNum);
                  } else if (monthCell) {
                    // Fallback: Set input value and trigger change
                    const monthInput = monthCell.querySelector(
                      monthYearMapping.monthInputSelector,
                    ) as HTMLInputElement | null;

                    if (monthInput) {
                      monthInput.value = `${parseInt(String(monthNum))} - ${rowData.month.split(' - ')[1]}`;
                      // Trigger change event
                      const event = new Event('change', { bubbles: true });
                      monthInput.dispatchEvent(event);
                    }
                  }

                  // Set year value
                  if (yearCombo) {
                    yearCombo.SetValue(yearLastTwoDigits);
                  } else if (monthCell) {
                    // Fallback: Set input value and trigger change
                    const yearInput = monthCell.querySelector(
                      monthYearMapping.yearInputSelector,
                    ) as HTMLInputElement | null;

                    if (yearInput) {
                      yearInput.value = String(rowData.year);
                      const event = new Event('change', { bubbles: true });
                      yearInput.dispatchEvent(event);
                    }
                  }
                } catch (dateError) {
                  console.error(
                    `Error setting month/year fields in row ${index}:`,
                    dateError,
                  );
                  errors.push(
                    `Row ${index}: ${dateError instanceof Error ? dateError.message : 'Unknown error'}`,
                  );
                }

                filledCount++;
              } catch (rowError) {
                console.error(`Error processing row ${index}:`, rowError);
                errors.push(
                  `Row ${index}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`,
                );
              }
            });

            return {
              success: true,
              message: `Successfully filled ${filledCount} rows out of ${rows.length}`,
              errors: errors.length > 0 ? errors : undefined,
            };
          },
        })
        .then((results) => {
          const result = results[0].result;
          if (result?.success) {
            setExecutionStatus({
              message: result.message,
              type: 'success',
            });

            if (result.errors && result.errors.length > 0) {
              console.warn('Some rows had errors:', result.errors);
            }
          } else {
            setExecutionStatus({
              message: result?.message ?? 'Unknown error',
              type: 'error',
            });
          }
        })
        .catch((error) => {
          console.error('Script execution error:', error);
          setExecutionStatus({
            message: `Error executing script: ${error.message || 'Unknown error'}`,
            type: 'error',
          });
        });
    } catch (error) {
      console.error('Error in fillForm:', error);
      setExecutionStatus({
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  return (
    <div className="container mx-auto min-w-2xs bg-slate-50 px-8 pb-12 text-gray-900">
      <div className="flex w-full justify-center">
        <img
          src={ICCLogo}
          className="h-auto w-full max-w-2xs object-cover"
          draggable={false}
          alt="ICC logo"
        />
      </div>

      <div className="mb-6">
        <FeedbackMessage feedback={feedback} />

        <label
          htmlFor="file_input"
          className="mb-2 block text-center text-lg font-semibold text-gray-900"
        >
          Upload LPO file:
        </label>

        <input
          className="w-full rounded-full border border-stone-200 bg-white font-semibold transition-all duration-300 file:inline-block file:rounded-full file:border-none file:bg-red-700 file:px-4 file:py-2 file:font-semibold file:text-white file:outline-none focus:ring focus:ring-red-400 focus:outline-none"
          id="file_input"
          type="file"
          onChange={handleFileChange}
          accept=".xlsx, .xls, .csv"
          disabled={isLoading}
        />

        {Object.keys(iccData).length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {Object.keys(iccData).length} PO records loaded
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full rounded-full bg-gray-200 px-4 py-1 text-sm font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-300"
          >
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>

          {showAdvanced && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-4">
                <label
                  htmlFor="po_column"
                  className="mb-1 block text-sm font-medium"
                >
                  PO Column Index:
                </label>
                <input
                  type="number"
                  id="po_column"
                  value={poColumnIndex}
                  onChange={(e) => setPoColumnIndex(Number(e.target.value))}
                  className="w-full rounded border border-gray-300 p-2"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Zero-based index of the column containing PO numbers (default:
                  8)
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearData}
                  className="rounded-full bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-400"
                >
                  Clear Data
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={fillForm}
          disabled={isLoading || Object.keys(iccData).length === 0}
          className={`mt-4 w-full rounded-full px-6 py-2 font-semibold text-white transition-colors duration-300 ${
            isLoading || Object.keys(iccData).length === 0
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-red-700 hover:bg-red-800'
          }`}
        >
          {isLoading ? 'Processing...' : 'Fill ICC'}
        </button>

        {executionStatus && (
          <div className="mt-4">
            <FeedbackMessage feedback={executionStatus} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
