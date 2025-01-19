// app/page.tsx (Home Page)
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to DCF Calculator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A powerful tool for Discounted Cash Flow analysis and company
          valuation
        </p>
        <Link
          href="/calculator"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
        >
          Start Your Analysis
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Features
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Real-time stock data integration
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Custom financial projections
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Detailed valuation analysis
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Exportable reports
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="space-y-4 text-gray-600">
            <p className="flex items-center">
              <span className="bg-blue-100 text-blue-800 font-semibold mr-2 px-2.5 py-0.5 rounded">
                1
              </span>
              Enter a stock ticker or input your financial data
            </p>
            <p className="flex items-center">
              <span className="bg-blue-100 text-blue-800 font-semibold mr-2 px-2.5 py-0.5 rounded">
                2
              </span>
              Adjust DCF parameters and assumptions
            </p>
            <p className="flex items-center">
              <span className="bg-blue-100 text-blue-800 font-semibold mr-2 px-2.5 py-0.5 rounded">
                3
              </span>
              Get detailed valuation results
            </p>
            <p className="flex items-center">
              <span className="bg-blue-100 text-blue-800 font-semibold mr-2 px-2.5 py-0.5 rounded">
                4
              </span>
              Download your analysis report
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
