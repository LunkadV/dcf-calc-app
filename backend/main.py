from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
from typing import List
import numpy as np
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DCFInput(BaseModel):
    revenue: List[float] = Field(..., min_items=1)
    ebit: List[float] = Field(..., min_items=1)
    taxes: List[float] = Field(..., min_items=1)
    d_and_a: List[float] = Field(..., min_items=1)
    capital_expenditure: List[float] = Field(..., min_items=1)
    change_in_net_working_capital: List[float] = Field(..., min_items=1)
    perpetual_growth_rate: float = Field(..., ge=-1, le=1)
    exit_multiple: float = Field(..., gt=0)
    weight_perpetuity: float = Field(..., ge=0, le=1)
    risk_free_rate: float = Field(..., ge=0, le=1)
    market_risk_premium: float = Field(..., gt=0)
    beta: float = Field(..., gt=0)
    debt_to_equity: float = Field(..., ge=0)
    debt: float = Field(..., ge=0)
    cash: float = Field(..., ge=0)
    shares_outstanding: int = Field(..., gt=0)
    projection_years: int = Field(..., gt=0)
    current_share_price: float = Field(..., gt=0)

    @validator("projection_years")
    def validate_input_lengths(cls, v, values):
        if not values:
            return v
        required_length = v
        for field in [
            "revenue",
            "ebit",
            "taxes",
            "d_and_a",
            "capital_expenditure",
            "change_in_net_working_capital",
        ]:
            if field in values and len(values[field]) < required_length:
                raise ValueError(f"{field} must have at least {required_length} values")
        return v


@lru_cache(maxsize=128)
def calculate_wacc(
    risk_free_rate: float,
    market_risk_premium: float,
    beta: float,
    debt_to_equity: float,
) -> float:
    """Calculates WACC using cached results for efficiency."""
    cost_of_equity = risk_free_rate + beta * market_risk_premium
    cost_of_debt = 0.05  # Assumed constant
    return cost_of_equity / (1 + debt_to_equity) + cost_of_debt * debt_to_equity / (
        1 + debt_to_equity
    )


def calculate_dcf_values(input_data: DCFInput):
    """Calculates all DCF values using numpy for vectorized operations."""
    # Convert inputs to numpy arrays for faster calculations
    projection_years = input_data.projection_years
    years = np.arange(1, projection_years + 1)

    # Calculate free cash flows
    ebit = np.array(input_data.ebit[:projection_years])
    taxes = np.array(input_data.taxes[:projection_years])
    d_and_a = np.array(input_data.d_and_a[:projection_years])
    capex = np.array(input_data.capital_expenditure[:projection_years])
    nwc_change = np.array(input_data.change_in_net_working_capital[:projection_years])

    net_income = ebit * (1 - taxes)
    free_cash_flows = net_income + d_and_a - capex - nwc_change

    # Calculate WACC
    wacc = calculate_wacc(
        input_data.risk_free_rate,
        input_data.market_risk_premium,
        input_data.beta,
        input_data.debt_to_equity,
    )

    # Calculate discount factors
    discount_factors = 1 / (1 + wacc) ** years

    # Calculate discounted cash flows
    discounted_cash_flows = free_cash_flows * discount_factors

    # Calculate terminal value
    last_fcf = free_cash_flows[-1]
    terminal_value_perpetuity = (
        last_fcf
        * (1 + input_data.perpetual_growth_rate)
        / (wacc - input_data.perpetual_growth_rate)
    )
    terminal_value_multiple = last_fcf * input_data.exit_multiple

    terminal_value = (
        input_data.weight_perpetuity * terminal_value_perpetuity
        + (1 - input_data.weight_perpetuity) * terminal_value_multiple
    )

    discounted_terminal_value = terminal_value * discount_factors[-1]

    # Calculate total present value and implied share price
    total_present_value = np.sum(discounted_cash_flows) + discounted_terminal_value
    enterprise_value = total_present_value + input_data.debt - input_data.cash
    implied_share_price = enterprise_value / input_data.shares_outstanding

    return {
        "implied_share_price": float(implied_share_price),
        "discounted_cash_flows": discounted_cash_flows.tolist(),
        "terminal_value": float(terminal_value),
        "discounted_terminal_value": float(discounted_terminal_value),
        "wacc": float(wacc),
    }


@app.post("/calculate_dcf")
async def calculate_dcf_endpoint(input_data: DCFInput) -> JSONResponse:
    """Endpoint for DCF calculations with error handling."""
    try:
        results = calculate_dcf_values(input_data)
        return JSONResponse(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")
