// components/TickerInput.tsx
"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { FormData } from "@/types/index";

interface TickerInputProps {
  onDataFetched: (data: Partial<FormData>) => void;
}

export default function TickerInput({ onDataFetched }: TickerInputProps) {
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

  return (
    <Card className="mb-6 p-4">
      <h2 className="text-xl font-semibold mb-4">Import Financial Data</h2>
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
