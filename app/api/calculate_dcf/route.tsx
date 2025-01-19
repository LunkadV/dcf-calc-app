import { NextRequest, NextResponse } from "next/server";

// Comprehensive type definition
interface DCFInput {
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
  unit_multiplier?: "ones" | "thousands" | "millions" | "billions";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Extensive logging
    console.log(
      "Received DCF calculation request body:",
      JSON.stringify(body, null, 2)
    );

    // Validate and transform input
    const validatedBody: DCFInput = {
      revenue: body.revenue,
      ebit: body.ebit,
      taxes: body.taxes,
      d_and_a: body.d_and_a,
      capital_expenditure: body.capital_expenditure,
      change_in_net_working_capital: body.change_in_net_working_capital,
      perpetual_growth_rate: body.perpetual_growth_rate,
      exit_multiple: body.exit_multiple,
      weight_perpetuity: body.weight_perpetuity,
      risk_free_rate: body.risk_free_rate,
      market_risk_premium: body.market_risk_premium,
      beta: body.beta,
      debt_to_equity: body.debt_to_equity,
      debt: body.debt,
      cash: body.cash,
      shares_outstanding: body.shares_outstanding,
      projection_years: body.projection_years,
      current_share_price: body.current_share_price,
      unit_multiplier: body.unit_multiplier ?? "millions",
    };

    // Validate array fields
    const arrayFields: (keyof DCFInput)[] = [
      "revenue",
      "ebit",
      "taxes",
      "d_and_a",
      "capital_expenditure",
      "change_in_net_working_capital",
    ];

    // Validate and ensure array fields are arrays of numbers
    arrayFields.forEach((field) => {
      const value = validatedBody[field];

      // Ensure it's an array
      if (!Array.isArray(value)) {
        console.error(`${field} is not an array:`, value);
        throw new Error(`${field} must be an array`);
      }

      // Ensure all elements are numbers
      if (!value.every((item) => typeof item === "number")) {
        console.error(`${field} contains non-number elements:`, value);
        throw new Error(`All elements in ${field} must be numbers`);
      }
    });

    // Make request to FastAPI
    const response = await fetch(`${API_URL}/calculate_dcf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(validatedBody),
      cache: "no-store",
    });

    // Log raw response
    const responseText = await response.text();
    console.log("Raw FastAPI response:", responseText);

    // Parse response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse FastAPI response:", parseError);
      return NextResponse.json(
        { error: `Failed to parse response: ${responseText}` },
        { status: 500 }
      );
    }

    // Check for error in parsed response
    if (data.error) {
      console.error("FastAPI returned an error:", data.error);
      return NextResponse.json(
        { error: data.error },
        { status: response.status }
      );
    }

    // Return successful response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Comprehensive error handling
    console.error("DCF Calculation Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error during DCF calculation",
      },
      { status: 500 }
    );
  }
}
