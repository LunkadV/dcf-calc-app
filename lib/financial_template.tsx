import * as XLSX from "xlsx";

export function generateFinancialDataTemplate() {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Prepare data for the template
  const templateData = [
    ["Financial Data Template for DCF Calculator"],
    [""],
    ["Instructions:"],
    ["- Enter financial data for each year"],
    ["- All monetary values should be in millions of dollars"],
    ["- Leave cells blank if data is not available (will be interpolated)"],
    [""],
    [
      "Year",
      "Revenue",
      "EBIT",
      "Taxes Rate",
      "Depreciation & Amortization",
      "Capital Expenditure",
      "Change in Net Working Capital",
    ],
    [2023, 1200, 300, 0.21, 60, 72, 18],
    [2024, 1380, 345, 0.21, 69, 83, 20.7],
    [2025, 1587, 397, 0.21, 79, 95, 23.8],
    [2026, 1825, 456, 0.21, 91, 109, 27.4],
    [2027, 2099, 525, 0.21, 105, 126, 31.5],
    [2028, 2414, 603, 0.21, 121, 145, 36.2],
    [""],
    ["Additional Parameters:"],
    ["Perpetual Growth Rate", 0.025],
    ["Exit Multiple", 12],
    ["Market Risk Premium", 0.055],
    ["Beta", 1.1],
    ["Debt", 500],
    ["Cash", 200],
    ["Shares Outstanding", 100000000],
  ];

  // Convert data to worksheet
  const ws = XLSX.utils.aoa_to_sheet(templateData);

  // Style the headers and instructions
  const headerCells = ["A1", "A3", "A8"];
  headerCells.forEach((cell) => {
    if (ws[cell]) {
      ws[cell].s = {
        font: {
          bold: true,
          sz: 12,
        },
      };
    }
  });

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Financial Data");

  // Write the file
  XLSX.writeFile(wb, "DCF_Financial_Data_Template.xlsx");
}

// If used in a React component
export function DownloadTemplateButton() {
  return (
    <button
      onClick={generateFinancialDataTemplate}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Download Template
    </button>
  );
}
