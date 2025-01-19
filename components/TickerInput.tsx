// components/TickerInput.tsx
"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { FormData } from "@/types/index";
import * as XLSX from "xlsx";

interface TickerInputProps {
  onDataFetched: (data: Partial<FormData>) => void;
  onFileUpload?: (data: Partial<FormData>) => void;
}

export default function TickerInput({
  onDataFetched,
  onFileUpload,
}: TickerInputProps) {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fetch_financials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${ticker}`);
      }

      const data = await response.json();
      if (data.current_share_price) {
        setCurrentPrice(data.current_share_price);
      }
      onDataFetched(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const generateFinancialDataTemplate = () => {
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

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "Financial Data");
    XLSX.writeFile(wb, "DCF_Financial_Data_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON with explicit typing
        const data = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as unknown[][];

        // Initialize with default empty arrays to prevent undefined errors
        const financialData: Partial<FormData> = {
          revenue: [],
          ebit: [],
          taxes: [],
          d_and_a: [],
          capital_expenditure: [],
          change_in_net_working_capital: [],
        };

        // Assuming data starts from row 9 (index 8) after headers and instructions
        for (let i = 8; i < data.length; i++) {
          const row = data[i];
          if (
            Array.isArray(row) &&
            row.length >= 7 &&
            typeof row[0] === "number"
          ) {
            // Explicitly type check and convert each column
            financialData.revenue?.push(Number(row[1]) || 0);
            financialData.ebit?.push(Number(row[2]) || 0);
            financialData.taxes?.push(Number(row[3]) || 0);
            financialData.d_and_a?.push(Number(row[4]) || 0);
            financialData.capital_expenditure?.push(Number(row[5]) || 0);
            financialData.change_in_net_working_capital?.push(
              Number(row[6]) || 0
            );
          }
        }

        // Extract additional parameters with explicit type checking
        const additionalParams = data.slice(data.length - 7);

        additionalParams.forEach((row) => {
          if (Array.isArray(row)) {
            if (
              row[0] === "Perpetual Growth Rate" &&
              typeof row[1] === "number"
            ) {
              financialData.perpetual_growth_rate = row[1];
            }
            if (row[0] === "Exit Multiple" && typeof row[1] === "number") {
              financialData.exit_multiple = row[1];
            }
            if (
              row[0] === "Market Risk Premium" &&
              typeof row[1] === "number"
            ) {
              financialData.market_risk_premium = row[1];
            }
            if (row[0] === "Beta" && typeof row[1] === "number") {
              financialData.beta = row[1];
            }
            if (row[0] === "Debt" && typeof row[1] === "number") {
              financialData.debt = row[1];
            }
            if (row[0] === "Cash" && typeof row[1] === "number") {
              financialData.cash = row[1];
            }
            if (row[0] === "Shares Outstanding" && typeof row[1] === "number") {
              financialData.shares_outstanding = row[1];
            }
          }
        });

        // Only call onFileUpload if it exists and we have data
        if (onFileUpload) {
          onFileUpload(financialData);
        }
      } catch (error) {
        console.error("Error parsing spreadsheet", error);
        setError("Failed to parse spreadsheet. Please check the file format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Card className="mb-6 p-4">
      <h2 className="text-xl font-semibold mb-4">Import Financial Data</h2>

      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Stock Ticker Symbol
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., AAPL"
              maxLength={5}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !ticker}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "Loading..." : "Import Data"}
          </button>
        </form>

        <div className="flex justify-between items-center">
          <div>
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800 underline"
            >
              Upload Custom Financial Data
            </label>
            <input
              type="file"
              id="file-upload"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={generateFinancialDataTemplate}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Download Template
          </button>
        </div>
      </div>

      {currentPrice && (
        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700">
            Current Share Price: ${currentPrice.toFixed(2)}
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <p>{error}</p>
        </Alert>
      )}
    </Card>
  );
}
