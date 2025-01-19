import React from "react";

interface ResultsDisplayProps {
  response: {
    implied_share_price: number;
    terminal_value: number;
    discounted_terminal_value: number;
    discounted_cash_flows: number[];
    wacc: number;
  };
  currentSharePrice: number;
}

// Helper function to format numbers
const formatNumber = (value: number, isSharePrice: boolean = false) => {
  if (isSharePrice) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // For values >= 1 million, show in millions with 2 decimal places
  if (Math.abs(value) >= 1000000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  }

  // For smaller values, show full number with 2 decimal places
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  response,
  currentSharePrice,
}) => {
  if (!response) return null;

  return (
    <div className="border rounded-lg shadow-sm p-4 mb-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">DCF Analysis Results</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <h4 className="font-semibold text-gray-700">Current Share Price</h4>
            <p className="text-2xl mt-1">
              {formatNumber(currentSharePrice, true)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h4 className="font-semibold text-gray-700">Implied Share Price</h4>
            <p className="text-2xl mt-1">
              {formatNumber(response.implied_share_price, true)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h4 className="font-semibold text-gray-700">Terminal Value</h4>
            <p className="text-2xl mt-1">
              {formatNumber(response.terminal_value)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h4 className="font-semibold text-gray-700">
              Discounted Terminal Value
            </h4>
            <p className="text-2xl mt-1">
              {formatNumber(response.discounted_terminal_value)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">
            Discounted Cash Flows
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {response.discounted_cash_flows.map((cf, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <span className="font-medium">Year {index + 1}:</span>{" "}
                {formatNumber(cf)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
