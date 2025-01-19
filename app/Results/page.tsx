// app/results/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { DCFResponse } from "@/types/dcf";

export default function ResultsPage() {
  const [results, setResults] = useState<DCFResponse | null>(null);
  const [currentSharePrice, setCurrentSharePrice] = useState<number>(0);

  useEffect(() => {
    const storedResults = localStorage.getItem("dcf_results");
    const storedPrice = localStorage.getItem("current_share_price");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedPrice) {
      setCurrentSharePrice(JSON.parse(storedPrice));
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            No Results Available
          </h2>
          <p className="text-gray-600 mb-6">
            Please complete a calculation first.
          </p>
          <Link
            href="/calculator"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Calculator
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Analysis Results
      </h1>

      <Card className="mb-8 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Valuation Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Implied Share Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${results.implied_share_price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Share Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentSharePrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Upside/Downside</p>
                <p
                  className={`text-2xl font-bold ${
                    results.implied_share_price > currentSharePrice
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(
                    ((results.implied_share_price - currentSharePrice) /
                      currentSharePrice) *
                    100
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">WACC</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(results.wacc * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Terminal Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${results.terminal_value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex space-x-4">
        <Link
          href="/download"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Download Report
        </Link>
        <Link
          href="/calculator"
          className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          New Analysis
        </Link>
      </div>
    </div>
  );
}
