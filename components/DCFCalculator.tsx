// components/DCFCalculator.tsx
"use client";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import TickerInput from "@/components/TickerInput";
import InputField from "@/components/InputField";
import type { FormData, DCFResponse } from "@/types/dcf";

// Initial form data
const initialFormData: FormData = {
  revenue: [1200, 1380, 1587, 1825, 2099, 2414],
  ebit: [300, 345, 397, 456, 525, 603],
  taxes: [0.21, 0.21, 0.21, 0.21, 0.21, 0.21],
  d_and_a: [60, 69, 79, 91, 105, 121],
  capital_expenditure: [72, 83, 95, 109, 126, 145],
  change_in_net_working_capital: [18, 20.7, 23.8, 27.4, 31.5, 36.2],
  perpetual_growth_rate: 0.02,
  exit_multiple: 12,
  weight_perpetuity: 0.5,
  risk_free_rate: 0.0375,
  market_risk_premium: 0.06,
  beta: 1.1,
  debt_to_equity: 0.25,
  debt: 500,
  cash: 200,
  shares_outstanding: 100000000,
  projection_years: 6,
  current_share_price: 35.0,
  unit_multiplier: "millions",
};

export default function DCFCalculator(props: {
  onCalculationComplete: (results: DCFResponse) => void;
}) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [years, setYears] = useState<number[]>([
    2023, 2024, 2025, 2026, 2027, 2028,
  ]);

  const handleFinancialDataFetched = (data: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      exit_multiple: prev.exit_multiple,
      projection_years: prev.projection_years,
      current_share_price: data.current_share_price ?? prev.current_share_price,
      shares_outstanding: data.shares_outstanding ?? prev.shares_outstanding,
    }));

    if (data.current_share_price) {
      localStorage.setItem(
        "current_share_price",
        JSON.stringify(data.current_share_price)
      );
    }
  };

  const handleFileUpload = (data: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      // Override only the values from the uploaded file
      revenue: data.revenue ?? prev.revenue,
      ebit: data.ebit ?? prev.ebit,
      taxes: data.taxes ?? prev.taxes,
      d_and_a: data.d_and_a ?? prev.d_and_a,
      capital_expenditure: data.capital_expenditure ?? prev.capital_expenditure,
      change_in_net_working_capital:
        data.change_in_net_working_capital ??
        prev.change_in_net_working_capital,
      // Optional: set additional parameters if provided in the file
      ...(data.perpetual_growth_rate !== undefined && {
        perpetual_growth_rate: data.perpetual_growth_rate,
      }),
      ...(data.exit_multiple !== undefined && {
        exit_multiple: data.exit_multiple,
      }),
      ...(data.market_risk_premium !== undefined && {
        market_risk_premium: data.market_risk_premium,
      }),
      ...(data.beta !== undefined && { beta: data.beta }),
      ...(data.debt !== undefined && { debt: data.debt }),
      ...(data.cash !== undefined && { cash: data.cash }),
      ...(data.shares_outstanding !== undefined && {
        shares_outstanding: data.shares_outstanding,
      }),
    }));
  };

  const handleScalarChange = (name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleYearChange = (index: number, value: number) => {
    const newYears = [...years];
    newYears[index] = value;
    setYears(newYears);
  };

  const handleYearArrayChange = (
    name: string,
    index: number,
    value: number
  ) => {
    setFormData((prev) => {
      const currentArray = prev[name] as number[];
      // Ensure the array is long enough
      const newArray = [...currentArray];
      while (newArray.length <= index) {
        newArray.push(newArray[newArray.length - 1] * 1.15); // Default growth
      }
      newArray[index] = value;
      return { ...prev, [name]: newArray };
    });
  };

  const calculateDCF = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const calculationData = {
        ...formData,
        projection_years: years.length,
      };

      const response = await fetch("/api/calculate_dcf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = (await response.json()) as DCFResponse;
      props.onCalculationComplete(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <TickerInput
        onDataFetched={handleFinancialDataFetched}
        onFileUpload={handleFileUpload}
      />

      <form onSubmit={calculateDCF} className="space-y-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Years of Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            {years.map((year, index) => (
              <InputField
                key={index}
                label={`Year ${index + 1}`}
                name={`year-${index}`}
                value={year}
                onChange={(_, value) => handleYearChange(index, value)}
              />
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Current Market Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <InputField
              label="Current Share Price ($)"
              name="current_share_price"
              value={formData.current_share_price as number}
              onChange={handleScalarChange}
              readOnly={true}
            />
            <InputField
              label="Shares Outstanding"
              name="shares_outstanding"
              value={formData.shares_outstanding as number}
              onChange={handleScalarChange}
              readOnly={true}
            />
          </div>

          <h2 className="text-xl font-semibold mb-4">DCF Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Perpetuity Growth Method vs Exit Multiple Method"
              name="weight_perpetuity"
              value={formData.weight_perpetuity as number}
              onChange={handleScalarChange}
              type="range"
              min={0}
              max={1}
              step={0.01}
            />
            <InputField
              label="Perpetual Growth Rate"
              name="perpetual_growth_rate"
              value={formData.perpetual_growth_rate as number}
              onChange={handleScalarChange}
            />
            <InputField
              label="Exit Multiple"
              name="exit_multiple"
              value={formData.exit_multiple as number}
              onChange={handleScalarChange}
            />
            <InputField
              label="Risk Free Rate"
              name="risk_free_rate"
              value={formData.risk_free_rate as number}
              onChange={handleScalarChange}
            />
            <InputField
              label="Market Risk Premium"
              name="market_risk_premium"
              value={formData.market_risk_premium as number}
              onChange={handleScalarChange}
            />
            <InputField
              label="Beta"
              name="beta"
              value={formData.beta as number}
              onChange={handleScalarChange}
            />
            <InputField
              label="Debt to Equity"
              name="debt_to_equity"
              value={formData.debt_to_equity as number}
              onChange={handleScalarChange}
            />
            <InputField
              label="Debt"
              name="debt"
              value={formData.debt as number}
              onChange={handleScalarChange}
            />
            <InputField
              label="Cash"
              name="cash"
              value={formData.cash as number}
              onChange={handleScalarChange}
            />
          </div>
        </Card>

        {/* Dynamically render financial inputs with years */}
        {[
          "revenue",
          "ebit",
          "taxes",
          "d_and_a",
          "capital_expenditure",
          "change_in_net_working_capital",
        ].map((field) => (
          <Card key={field} className="mb-4 p-4">
            <h2 className="text-xl font-semibold mb-4">
              {field.replace(/_/g, " ").toUpperCase()}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {years.map((year, index) => (
                <InputField
                  key={`${field}-${index}`}
                  label={`${year}`}
                  name={`${field}[${index}]`}
                  value={(formData[field] as number[])[index]}
                  onChange={(_name: string, newValue: number) =>
                    handleYearArrayChange(field, index, newValue)
                  }
                />
              ))}
            </div>
          </Card>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Calculating..." : "Calculate DCF"}
        </button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <p>{error}</p>
        </Alert>
      )}
    </div>
  );
}
