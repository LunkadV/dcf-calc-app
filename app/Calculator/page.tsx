// app/calculator/page.tsx
"use client";
import { useRouter } from "next/navigation";
import DCFCalculator from "@/components/DCFCalculator";
import type { DCFResponse } from "@/types/dcf";

export default function CalculatorPage() {
  const router = useRouter();

  const handleCalculationComplete = (results: DCFResponse) => {
    localStorage.setItem("dcf_results", JSON.stringify(results));
    router.push("/results");
  };

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        DCF Analysis Calculator
      </h1>
      <DCFCalculator onCalculationComplete={handleCalculationComplete} />
    </div>
  );
}
