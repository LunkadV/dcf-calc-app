// types/index.ts
export type UnitMultiplier = "ones" | "thousands" | "millions" | "billions";

export interface FormData {
  [key: string]: number | number[] | UnitMultiplier;
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
  unit_multiplier: UnitMultiplier;
}

export interface DCFResponse {
  implied_share_price: number;
  discounted_cash_flows: number[];
  terminal_value: number;
  discounted_terminal_value: number;
  wacc: number;
}

export interface ResultsDisplayProps {
  response: DCFResponse;
  currentSharePrice: number;
}
