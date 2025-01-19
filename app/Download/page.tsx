// app/download/page.tsx
"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { DCFResponse } from "@/types/index";

export default function DownloadPage() {
  const [results, setResults] = useState<DCFResponse | null>(null);

  useEffect(() => {
    const storedResults = localStorage.getItem("dcf_results");
    if (storedResults) {
      setResults(JSON.parse(storedResults) as DCFResponse);
    }
  }, []);

  const handleDownload = () => {
    if (!results) return;

    const wb = XLSX.utils.book_new();

    // Create worksheet for summary
    const summaryData = [
      ["DCF Analysis Results"],
      ["Implied Share Price", results.implied_share_price],
      ["WACC", results.wacc],
      ["Terminal Value", results.terminal_value],
      ["Discounted Terminal Value", results.discounted_terminal_value],
    ];
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);

    // Create worksheet for cash flows
    const cashFlowData = [
      ["Year", "Discounted Cash Flow"],
      ...results.discounted_cash_flows.map((dcf: number, i: number) => [
        i + 1,
        dcf,
      ]),
    ];
    const cashFlowWS = XLSX.utils.aoa_to_sheet(cashFlowData);

    XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");
    XLSX.utils.book_append_sheet(wb, cashFlowWS, "Cash Flows");

    XLSX.writeFile(wb, "dcf_analysis.xlsx");
  };

  if (!results) {
    return (
      <div>No results available. Please complete a calculation first.</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Download Analysis</h1>
      <button
        onClick={handleDownload}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Download Excel Report
      </button>
    </div>
  );
}
