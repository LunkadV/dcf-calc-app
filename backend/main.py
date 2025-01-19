from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from fastapi.responses import JSONResponse  # Import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",  # Allow requests from your Next.js frontend
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # Allow requests from your backend
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Models for Input Validation
class DCFInput(BaseModel):
    revenue: List[float]
    ebit: List[float]
    taxes: List[float]
    d_and_a: List[float]
    capital_expenditure: List[float]
    change_in_net_working_capital: List[float]
    perpetual_growth_rate: float
    exit_multiple: float
    weight_perpetuity: float
    risk_free_rate: float
    market_risk_premium: float
    beta: float
    debt_to_equity: float
    debt: float
    cash: float
    shares_outstanding: int
    projection_years: int
    current_share_price: float


def calculate_projected_cash_flows(
    revenue,
    ebit,
    taxes,
    d_and_a,
    capital_expenditure,
    change_in_net_working_capital,
    projection_years,
):
    """
    Calculates projected cash flows for a specified number of years.

    Args:
      revenue: A list of projected revenues (should have at least one value).
      ebit: A list of projected EBIT (Earnings Before Interest and Taxes).
      taxes: A list of projected tax expenses.
      d_and_a: A list of projected Depreciation and Amortization.
      capital_expenditure: A list of projected Capital Expenditures.
      change_in_net_working_capital: A list of projected changes in Net Working Capital.
      projection_years: Number of years to project.

    Returns:
      A list of projected Free Cash Flows.
    """
    # Ensure input lists have sufficient length
    for input_list in [
        revenue,
        ebit,
        taxes,
        d_and_a,
        capital_expenditure,
        change_in_net_working_capital,
    ]:
        if len(input_list) < projection_years:
            raise ValueError(
                "Input lists must have at least as many values as projection_years."
            )

    free_cash_flows = []
    for i in range(projection_years):
        ebitda = ebit[i] + d_and_a[i]
        net_income = ebit[i] * (1 - taxes[i])
        free_cash_flow = (
            net_income
            + d_and_a[i]
            - capital_expenditure[i]
            - change_in_net_working_capital[i]
        )
        free_cash_flows.append(free_cash_flow)
    return free_cash_flows


def calculate_wacc(risk_free_rate, market_risk_premium, beta, debt_to_equity):
    """
    Calculates the Weighted Average Cost of Capital (WACC).

    Args:
      risk_free_rate: Risk-free rate (e.g., 10-year Treasury yield).
      market_risk_premium: Market risk premium.
      beta: Equity beta.
      debt_to_equity: Debt-to-equity ratio.

    Returns:
      The calculated WACC.
    """
    # Calculate Cost of Equity
    cost_of_equity = risk_free_rate + beta * market_risk_premium

    # Calculate Cost of Debt (Assuming a reasonable cost of debt)
    cost_of_debt = 0.05  # Example: 5% cost of debt

    # Calculate WACC
    wacc = (cost_of_equity * (1 / (1 + debt_to_equity))) + (
        cost_of_debt * (debt_to_equity / (1 + debt_to_equity))
    )
    return wacc


def calculate_terminal_value(
    last_free_cash_flow, perpetual_growth_rate, exit_multiple, weight_perpetuity, wacc
):
    """
    Calculates terminal value using a weighted average of perpetuity growth and exit multiple methods.

    Args:
      last_free_cash_flow: Free Cash Flow in the final projected year.
      perpetual_growth_rate: Perpetual growth rate assumption.
      exit_multiple: Exit multiple (e.g., EV/EBITDA).
      weight_perpetuity: Weight of perpetuity growth method in the terminal value calculation.
      wacc: Weighted Average Cost of Capital.

    Returns:
      Terminal value.
    """
    terminal_value_perpetuity = (
        last_free_cash_flow
        * (1 + perpetual_growth_rate)
        / (wacc - perpetual_growth_rate)
    )
    terminal_value_multiple = last_free_cash_flow * exit_multiple
    terminal_value = (
        weight_perpetuity * terminal_value_perpetuity
        + (1 - weight_perpetuity) * terminal_value_multiple
    )
    return terminal_value


def calculate_implied_share_price(total_present_value, debt, cash, shares_outstanding):
    """
    Calculates the implied share price based on the DCF valuation.

    Args:
      total_present_value: Total present value of all future cash flows.
      debt: Total debt of the company.
      cash: Total cash and cash equivalents of the company.
      shares_outstanding: Number of shares outstanding.

    Returns:
      Implied share price.
    """
    enterprise_value = total_present_value + debt - cash
    implied_share_price = enterprise_value / shares_outstanding
    return implied_share_price


@app.post("/calculate_dcf")
async def calculate_dcf_endpoint(input_data: DCFInput):
    try:
        if not all(
            len(lst) >= input_data.projection_years
            for lst in [
                input_data.revenue,
                input_data.ebit,
                input_data.taxes,
                input_data.d_and_a,
                input_data.capital_expenditure,
                input_data.change_in_net_working_capital,
            ]
        ):
            raise HTTPException(
                status_code=400,
                detail="Input lists must have at least as many values as projection_years.",
            )
        projected_cash_flows = calculate_projected_cash_flows(
            input_data.revenue,
            input_data.ebit,
            input_data.taxes,
            input_data.d_and_a,
            input_data.capital_expenditure,
            input_data.change_in_net_working_capital,
            input_data.projection_years,
        )

        wacc = calculate_wacc(
            input_data.risk_free_rate,
            input_data.market_risk_premium,
            input_data.beta,
            input_data.debt_to_equity,
        )

        terminal_value = calculate_terminal_value(
            projected_cash_flows[-1],
            input_data.perpetual_growth_rate,
            input_data.exit_multiple,
            input_data.weight_perpetuity,
            wacc,
        )
        discounted_terminal_value = (
            terminal_value / (1 + wacc) ** input_data.projection_years
        )
        print(f"Terminal Value (Before Response): {terminal_value}")  # Check this value
        print(
            f"Discounted Terminal Value (Before Response): {discounted_terminal_value}"
        )  # Check this value

        discounted_cash_flows = []
        data = []
        for year in range(1, input_data.projection_years + 1):
            data.append(
                {
                    "Year": year,
                    "Cash Flow": projected_cash_flows[year - 1],
                    "Discount Factor": 1 / (1 + wacc) ** year,
                    "Discounted Cash Flow": projected_cash_flows[year - 1]
                    / (1 + wacc) ** year,
                }
            )

        data.append(
            {
                "Year": "Terminal",
                "Cash Flow": terminal_value,
                "Discount Factor": 1 / (1 + wacc) ** input_data.projection_years,
                "Discounted Cash Flow": terminal_value
                / (1 + wacc) ** input_data.projection_years,
            }
        )

        discounted_terminal_value = (
            terminal_value / (1 + wacc) ** input_data.projection_years
        )
        discounted_cash_flows.append(discounted_terminal_value)

        # Set an explicit index by year
        df = pd.DataFrame(data).set_index("Year")

        df["Present Value"] = df["Cash Flow"] * df["Discount Factor"]
        df["Total Present Value"] = df["Present Value"].sum()

        implied_share_price = calculate_implied_share_price(
            df["Total Present Value"].iloc[-1],
            input_data.debt,
            input_data.cash,
            input_data.shares_outstanding,
        )
        print(f"Implied Share Price (Before Response): {implied_share_price}")

        response_data = {
            "implied_share_price": implied_share_price,
            "discounted_cash_flows": discounted_cash_flows,
            "terminal_value": terminal_value,
            "discounted_terminal_value": discounted_terminal_value,
        }

        return JSONResponse(response_data)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )
