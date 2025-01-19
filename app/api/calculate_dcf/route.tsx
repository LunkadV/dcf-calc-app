import { NextRequest, NextResponse } from "next/server";

// Type-safe environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// Type definitions for input validation
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
}

// Custom error handler with type safety
class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Helper function to validate request body
async function validateRequestBody(req: NextRequest): Promise<DCFInput> {
  try {
    const body = await req.json();

    // Basic validation
    if (!body || typeof body !== "object") {
      throw new APIError(400, "Invalid request body");
    }

    // Validate required fields and types
    const requiredArrayFields = [
      "revenue",
      "ebit",
      "taxes",
      "d_and_a",
      "capital_expenditure",
      "change_in_net_working_capital",
    ];

    for (const field of requiredArrayFields) {
      if (
        !Array.isArray(body[field]) ||
        !body[field].every((item) => typeof item === "number")
      ) {
        throw new APIError(
          400,
          `Invalid ${field}: must be an array of numbers`
        );
      }
    }

    const requiredNumberFields = [
      "perpetual_growth_rate",
      "exit_multiple",
      "weight_perpetuity",
      "risk_free_rate",
      "market_risk_premium",
      "beta",
      "debt_to_equity",
      "debt",
      "cash",
      "shares_outstanding",
      "projection_years",
      "current_share_price",
    ];

    for (const field of requiredNumberFields) {
      if (typeof body[field] !== "number") {
        throw new APIError(400, `Invalid ${field}: must be a number`);
      }
    }

    return body as DCFInput;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(400, "Invalid request data");
  }
}

// Helper function to handle FastAPI response
async function handleFastAPIResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const errorData = isJson ? await response.json() : await response.text();
    throw new APIError(
      response.status,
      "FastAPI error",
      isJson ? errorData : { message: errorData }
    );
  }

  if (!isJson) {
    throw new APIError(500, "Invalid response from FastAPI: Expected JSON");
  }

  return response.json();
}

// Main API route handler
export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const validatedBody = await validateRequestBody(req);

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

    // Process FastAPI response
    const data = await handleFastAPIResponse(response);

    // Return success response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle known errors
    if (error instanceof APIError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: error.statusCode }
      );
    }

    // Handle unknown errors
    console.error(
      "Unexpected error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Configure API route options
export const config = {
  api: {
    bodyParser: false,
  },
};
