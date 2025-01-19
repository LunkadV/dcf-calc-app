# scripts/fetch_financials.py
import sys
import json
import yfinance as yf
import pandas as pd


def debug_print(label, value):
    print(f"\nDEBUG - {label}:", file=sys.stderr)
    print(value, file=sys.stderr)


def clean_array(values, fill_length=6, growth_rate=1.15):
    # Remove any invalid values
    cleaned = [float(val) for val in values if pd.notna(val) and float(val) != 0]
    debug_print(f"Cleaned array from {len(values)} to {len(cleaned)} values", cleaned)

    # Fill to required length
    result = []
    for i in range(fill_length):
        if i < len(cleaned):
            result.append(cleaned[i])
        else:
            last = result[-1] if result else 1000
            result.append(last * growth_rate)

    return result


def fetch_financial_data(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        debug_print("Fetching data for ticker", ticker)

        # Get statements
        income = stock.income_stmt
        debug_print("Income Statement", income)

        # Process Revenue
        debug_print(
            "Raw Revenue",
            (
                income.loc["Total Revenue"].values
                if "Total Revenue" in income.index
                else "No revenue found"
            ),
        )
        revenues = []
        if "Total Revenue" in income.index:
            raw_revenues = income.loc["Total Revenue"].values
            revenues = clean_array([val / 1e6 for val in raw_revenues])
        else:
            revenues = [1000 * (1.15**i) for i in range(6)]
        debug_print("Processed Revenues", revenues)

        # Process EBIT
        debug_print(
            "Raw EBIT",
            (
                income.loc["Operating Income"].values
                if "Operating Income" in income.index
                else "No EBIT found"
            ),
        )
        if "Operating Income" in income.index:
            raw_ebit = income.loc["Operating Income"].values
            ebits = clean_array([val / 1e6 for val in raw_ebit])
        else:
            ebits = [rev * 0.15 for rev in revenues]
        debug_print("Processed EBIT", ebits)

        # Get market data
        info = stock.info
        current_price = info.get("regularMarketPrice", 0)
        if not current_price:
            current_price = float(stock.history(period="1d")["Close"].iloc[-1])
        debug_print("Current Price", current_price)

        shares = float(info.get("sharesOutstanding", 0))
        beta = float(info.get("beta", 1.1))
        debug_print("Market Info", {"shares": shares, "beta": beta})

        # Prepare the output data
        data = {
            "revenue": revenues,
            "ebit": ebits,
            "taxes": [0.21] * 6,
            "d_and_a": [rev * 0.05 for rev in revenues],  # 5% of revenue
            "capital_expenditure": [rev * 0.07 for rev in revenues],  # 7% of revenue
            "change_in_net_working_capital": [
                rev * 0.02 for rev in revenues
            ],  # 2% of revenue
            "beta": beta,
            "perpetual_growth_rate": 0.025,
            "market_risk_premium": 0.055,
            "current_share_price": current_price,
            "shares_outstanding": shares,
            "unit_multiplier": "millions",
        }

        # Verify no NaN values in final data
        for key, value in data.items():
            if isinstance(value, list):
                if any(pd.isna(x) for x in value):
                    raise ValueError(f"NaN found in {key}: {value}")
            elif pd.isna(value):
                raise ValueError(f"NaN found in {key}: {value}")

        debug_print("Final Data", data)
        return data

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        raise Exception(f"Error fetching data for {ticker}: {str(e)}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide a ticker symbol"}))
        sys.exit(1)

    ticker = sys.argv[1].upper()
    try:
        data = fetch_financial_data(ticker)
        # Final verification before JSON serialization
        print(json.dumps(data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
