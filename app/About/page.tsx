// app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        About DCF Calculator
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600">
            We aim to provide financial professionals and investors with a
            powerful, yet easy-to-use tool for company valuation through
            Discounted Cash Flow analysis. Our goal is to make sophisticated
            financial analysis accessible to everyone.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            The Team
          </h2>
          <p className="text-gray-600">
            Created by a team of financial analysts and software developers
            passionate about making financial analysis more accessible and
            accurate. We combine deep financial expertise with modern
            technology.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Methodology
          </h2>
          <p className="text-gray-600 mb-4">
            Our DCF Calculator uses industry-standard valuation methods and
            assumptions:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Two-stage DCF model with customizable growth periods</li>
            <li>WACC calculation using CAPM methodology</li>
            <li>
              Terminal value calculation using both perpetuity growth and exit
              multiple methods
            </li>
            <li>Integration with real-time market data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
