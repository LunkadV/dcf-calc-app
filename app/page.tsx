"use client";
import { useState, ChangeEvent, FormEvent } from "react";

// hello
interface FormData {
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
  discounted_cash_flows: number[]; // Add this line
  terminal_value: number; // Add this line
  discounted_terminal_value: number; // Add this line
}

export default function Home() {
  const [dcfValue, setDcfValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discountedCashFlows, setDiscountedCashFlows] = useState<
    number[] | null
  >(null);
  const [terminalValue, setTerminalValue] = useState<number | null>(null);
  const [discountedTerminalValue, setDiscountedTerminalValue] = useState<
    number | null
  >(null);

  const [formData, setFormData] = useState<FormData>({
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
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);

    if (name.includes("[")) {
      const arrayName = name.split("[")[0];
      const index = parseInt(name.split("[")[1].replace("]", ""));
      setFormData((prevFormData) => {
        const existingArray = prevFormData[arrayName as keyof FormData];
        const newArray = Array.isArray(existingArray) ? [...existingArray] : [];
        newArray[index] = parsedValue;
        return { ...prevFormData, [arrayName]: newArray };
      });
    } else {
      setFormData({ ...formData, [name]: parsedValue });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("api/calculate_dcf", {
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
      setDcfValue(data.implied_share_price);
      setDiscountedCashFlows(data.discounted_cash_flows);
      setTerminalValue(data.terminal_value);
      setDiscountedTerminalValue(data.discounted_terminal_value);
    } catch (err: unknown) {
      // Type the error
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred."); // Handle cases where err is not an Error object
        console.error("Caught unknown error:", err); // Log the unknown error for debugging.
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Example of input for revenue array */}
        <label htmlFor="weight_perpetuity">
          Weight Perpetuity: {formData.weight_perpetuity.toFixed(2)}
        </label>{" "}
        {/* Display value with 2 decimal places */}
        <input
          type="range"
          id="weight_perpetuity" // Add an id for the label to correctly associate
          name="weight_perpetuity"
          min="0"
          max="1"
          step="0.01"
          value={formData.weight_perpetuity} // Bind the value to state
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setFormData({
              ...formData,
              weight_perpetuity: parseFloat(e.target.value),
            });
          }}
        />
        {formData.revenue.map((val, index) => (
          <div key={index}>
            <label htmlFor={`revenue[${index}]`}>
              Revenue Year {index + 1}:
            </label>
            <input
              type="number"
              name={`revenue[${index}]`}
              value={val}
              onChange={handleChange}
            />
          </div>
        ))}
        {}
        {/* ... other input fields similar to revenue */}
        <button type="submit">Calculate DCF</button>
      </form>
      {dcfValue !== null && ( // Check if dcfValue is NOT null
        <p>Current Share Price: {formData.current_share_price}</p>
      )}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {dcfValue !== null && <p>Implied Share Price: {dcfValue}</p>}
      {discountedCashFlows && (
        <div>
          <h3>Discounted Cash Flows:</h3>
          <ul>
            {discountedCashFlows.map((cf, index) => (
              <li key={index}>
                Year {index + 1}: {cf}
              </li>
            ))}
          </ul>
        </div>
      )}
      {terminalValue !== null && <p>Terminal Value: {terminalValue}</p>}
      {discountedTerminalValue !== null && (
        <p>Discounted Terminal Value: {discountedTerminalValue}</p>
      )}
    </div>
  );
}
