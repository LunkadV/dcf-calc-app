import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

interface FinancialData {
  revenue: number[];
  ebit: number[];
  taxes: number[];
  d_and_a: number[];
  capital_expenditure: number[];
  change_in_net_working_capital: number[];
  beta: number;
  perpetual_growth_rate: number;
  market_risk_premium: number;
  current_share_price: number;
  shares_outstanding?: number;
  unit_multiplier: "millions";
}

async function runPythonScript(ticker: string): Promise<FinancialData> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "fetch_financials.py"
    );
    const pythonProcess = spawn("python", [scriptPath, ticker]);

    let dataString = "";
    let errorString = "";

    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorString += data.toString();
      console.error("Python stderr:", data.toString());
    });

    pythonProcess.on("error", (error) => {
      console.error("Failed to start Python process:", error);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        reject(new Error(errorString || "Failed to fetch financial data"));
        return;
      }

      try {
        const parsedData = JSON.parse(dataString) as FinancialData;

        // Validate the current share price
        if (typeof parsedData.current_share_price !== "number") {
          throw new Error("Invalid or missing current share price");
        }

        resolve(parsedData);
      } catch (parseError) {
        reject(
          new Error(
            `Invalid data format received from Python script: ${
              parseError instanceof Error
                ? parseError.message
                : "Unknown parsing error"
            }`
          )
        );
      }
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker } = body;

    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json(
        { error: "Invalid ticker symbol" },
        { status: 400 }
      );
    }

    console.log(`Fetching data for ticker: ${ticker}`);
    const data = await runPythonScript(ticker);

    if (!data || typeof data !== "object") {
      throw new Error("Invalid response from Python script");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in fetch_financials route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch financial data",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
