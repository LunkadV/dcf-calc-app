"use client";

import { useState, useCallback, useMemo } from "react";

// Define types in a separate section for better organization
type ArrayFields =
  | "revenue"
  | "ebit"
  | "taxes"
  | "d_and_a"
  | "capital_expenditure"
  | "change_in_net_working_capital";

interface FormData {
  [key: string]: number | number[];
  revenue: number[];
  ebit: number[];
  taxes: number[];
  d_and_a: number[];
  capital_expenditure: number[];
  change_in_net_working_capital: number[];
  perpetual_growth_rate: number;
  exit_multiple: number;
  weight_perpetuity: number;
  risk_free_rate: number;
  market_risk_premium: number;
  beta: number;
  debt_to_equity: number;
  debt: number;
  cash: number;
  shares_outstanding: number;
  projection_years: number;
  current_share_price: number;
}

interface DCFResponse {
  implied_share_price: number;
  discounted_cash_flows: number[];
  terminal_value: number;
  discounted_terminal_value: number;
  wacc: number;
}

// Initial form data - memoized to prevent recreation
const initialFormData: FormData = {
  revenue: [100, 110, 120, 130, 140, 150],
  ebit: [20, 22, 24, 26, 28, 30],
  taxes: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
  d_and_a: [5, 5, 5, 5, 5, 5],
  capital_expenditure: [10, 12, 10, 15, 12, 10],
  change_in_net_working_capital: [2, 3, 2, 1, 2, 1],
  perpetual_growth_rate: 0.02,
  exit_multiple: 10,
  weight_perpetuity: 0.6,
  risk_free_rate: 0.03,
  market_risk_premium: 0.07,
  beta: 1.2,
  debt_to_equity: 0.5,
  debt: 100,
  cash: 50,
  shares_outstanding: 1000000,
  projection_years: 6,
  current_share_price: 1,
};

// Custom Card component
const Card = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="border rounded-lg shadow-sm p-4 mb-4 bg-white">
    {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
    {children}
  </div>
);

// Custom InputField component to reduce repetition
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "number",
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  type?: "number" | "range";
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1" htmlFor={name}>
      {label}: {type === "range" && value.toFixed(2)}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(name, parseFloat(e.target.value))}
      className="w-full p-2 border rounded"
      {...(min !== undefined && { min })}
      {...(max !== undefined && { max })}
      {...(step !== undefined && { step })}
    />
  </div>
);

export default function DCFCalculator() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [response, setResponse] = useState<DCFResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized handler for scalar field updates
  const handleScalarChange = useCallback((name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Memoized handler for array field updates
  const handleArrayChange = useCallback(
    (name: string, index: number, value: number) => {
      setFormData((prev) => ({
        ...prev,
        [name]: (prev[name] as number[]).map((v, i) =>
          i === index ? value : v
        ),
      }));
    },
    []
  );

  // Memoized array field inputs
  const arrayInputs = useMemo(() => {
    const arrayFields: ArrayFields[] = [
      "revenue",
      "ebit",
      "taxes",
      "d_and_a",
      "capital_expenditure",
      "change_in_net_working_capital",
    ];
    return arrayFields.map((field) => (
      <Card key={field} title={field.replace(/_/g, " ").toUpperCase()}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(formData[field] as number[]).map((value, index) => (
            <InputField
              key={`${field}-${index}`}
              label={`Year ${index + 1}`}
              name={`${field}[${index}]`}
              value={value}
              onChange={(_, value) => handleArrayChange(field, index, value)}
            />
          ))}
        </div>
      </Card>
    ));
  }, [formData, handleArrayChange]);

  // Memoized API call
  const calculateDCF = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/calculate_dcf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          );
        }

        const data: DCFResponse = await response.json();
        setResponse(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formData]
  );

  // Memoized results display
  const ResultsDisplay = useMemo(() => {
    if (!response) return null;

    return (
      <Card title="DCF Analysis Results">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Current Share Price</h4>
              <p>${formData.current_share_price.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-semibold">Implied Share Price</h4>
              <p>${response.implied_share_price.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-semibold">Terminal Value</h4>
              <p>${response.terminal_value.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-semibold">Discounted Terminal Value</h4>
              <p>${response.discounted_terminal_value.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Discounted Cash Flows</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {response.discounted_cash_flows.map((cf, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Year {index + 1}:</span> $
                  {cf.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }, [response, formData.current_share_price]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <form onSubmit={calculateDCF} className="space-y-6">
        <Card title="DCF Parameters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Weight Perpetuity"
              name="weight_perpetuity"
              value={formData.weight_perpetuity}
              onChange={handleScalarChange}
              type="range"
              min={0}
              max={1}
              step={0.01}
            />
            {/* Add other scalar inputs here */}
          </div>
        </Card>

        {arrayInputs}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Calculating..." : "Calculate DCF"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {ResultsDisplay}
    </div>
  );
}
