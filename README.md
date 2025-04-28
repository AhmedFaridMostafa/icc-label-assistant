# ICC Label Assistant

A Chrome extension that streamlines the process of filling ICC label information by importing data from Excel spreadsheets.

![ICC Label Assistant Logo](/logo.png)

## Features

- **Excel Import**: Upload your LPO Excel file with label information
- **Automatic Form Filling**: Populate ICC forms with just one click
- **Smart Field Mapping**: Maps Excel columns to the appropriate form fields
- **Date Handling**: Automatically extracts and formats month/year information
- **Error Feedback**: Clear notifications for success or failure

## Installation

1. Download the extension from the Chrome Web Store (coming soon)
2. Or install manually:
   - Clone this repository
   - Run `npm install` and `npm run build`
   - Go to Chrome Extensions (chrome://extensions/)
   - Enable "Developer Mode"
   - Click "Load Unpacked" and select the `dist` folder

## Usage

1. Navigate to the ICC label page in your browser
2. Click the ICC Label Assistant extension icon
3. Upload your Excel file containing LPO data
4. Click "Fill ICC" to automatically populate the forms
5. For advanced options, click "Show Advanced Options" to adjust settings like PO column index

## Expected Excel Format

The extension expects your Excel file to include the following columns:

- `PO#`: The purchase order number (used as a key identifier)
- `print qty`: Print quantity (will be multiplied by 12)
- `carton weight`: Weight of the carton
- `carton length`: Length dimension
- `carton width`: Width dimension
- `carton height`: Height dimension
- `Ship Date`: Date for shipping (used to extract month and year)
- `Master Box Quantity`: Number of items in master box
- `packing`: Packing information

## Configuration

The extension includes configurable mappings in `fieldMappingConfig.ts`:

- `defaultFieldMappings`: Maps Excel column names to internal field names
- `defaultColumnMappings`: Maps data fields to column indices in the ICC form
- `defaultMonthYearMapping`: Configuration for month/year dropdown controls

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

- `src/App.tsx`: Main application component
- `src/useExcel.ts`: Custom hook for Excel file handling
- `src/fieldMappingConfig.ts`: Configuration for field mappings
- `src/types.ts`: TypeScript interfaces and types
- `src/utils/`: Utility functions for data transformation

## Troubleshooting

### Common Issues

- **PO Not Found**: Ensure your Excel file has a "PO#" column and it matches the PO numbers in the ICC form
- **Dropdown Not Working**: If month/year dropdowns aren't filling, try adjusting the advanced PO column index setting
- **Date Format**: Ensure your Ship Date is in a standard format (YYYY-MM-DD or MM/DD/YYYY)

### Reporting Issues

Please report any bugs or feature requests on the [GitHub issues page](https://github.com/yourusername/icc-label-assistant/issues).

## License

[MIT License](LICENSE)

## Acknowledgments

- Built with React, Vite, and Tailwind CSS
- Uses XLSX.js for Excel parsing
