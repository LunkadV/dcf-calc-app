import sys
import json
import yfinance as yf
import pandas as pd
import numpy as np


def clean_array(values, fill_length=6, growth_rate=1.15):
    try:
        cleaned = []
        for val in values:
            try:
                # Convert to float, handling various input types
                if isinstance(val, (int, float, np.number)):
                    float_val = float(val)
                elif isinstance(val, str):
                    float_val = float(val.replace(",", ""))
                else:
                    continue

                if pd.notna(float_val) and float_val != 0:
                    cleaned.append(float_val)
            except (ValueError, TypeError):
                continue

        # Fill to required length
        result = []
        for i in range(fill_length):
            if i < len(cleaned):
                result.append(cleaned[i] / 1_000_000)  # Convert to millions
            else:
                last = result[-1] if result else 1000
                result.append(last * growth_rate)

        return [float(x) for x in result]

    except Exception as e:
        print(f"Error in clean_array: {e}", file=sys.stderr)
        return [1000 * (1.15**i) for i in range(fill_length)]


def fetch_financial_data(ticker: str):
    try:
        stock = yf.Ticker(ticker)

        # Get financial statements
        income = stock.income_stmt
        balance_sheet = stock.balance_sheet

        # Process Revenue
        revenue_sources = ["Total Revenue", "Revenues", "Revenue"]
        revenues = []
        for source in revenue_sources:
            if source in income.index:
                try:
                    raw_revenues = income.loc[source].values
                    revenues = clean_array(raw_revenues)
                    if revenues:
                        break
                except Exception as e:
                    print(f"Error processing {source}: {e}", file=sys.stderr)

        # Fallback revenue
        if not revenues:
            revenues = [1000 * (1.15**i) for i in range(6)]

        # Process EBIT
        ebit_sources = ["Operating Income", "Income from Operations"]
        ebits = []
        for source in ebit_sources:
            if source in income.index:
                try:
                    raw_ebit = income.loc[source].values
                    ebits = clean_array(raw_ebit)
                    if ebits:
                        break
                except Exception as e:
                    print(f"Error processing {source}: {e}", file=sys.stderr)

        # Fallback EBIT
        if not ebits:
            ebits = [rev * 0.15 for rev in revenues]

        # Market data
        try:
            info = stock.info
            current_price = float(
                info.get("regularMarketPrice", 0)
                or stock.history(period="1d")["Close"].iloc[-1]
            )
            shares = float(info.get("sharesOutstanding", 100_000_000))
            beta = float(info.get("beta", 1.1))
        except Exception as e:
            print(f"Error fetching market data: {e}", file=sys.stderr)
            current_price = 50.0
            shares = 100_000_000
            beta = 1.1

        # Prepare output data
        data = {
            "revenue": revenues,
            "ebit": ebits,
            "taxes": [0.21] * 6,
            "d_and_a": [rev * 0.05 for rev in revenues],
            "capital_expenditure": [rev * 0.07 for rev in revenues],
            "change_in_net_working_capital": [rev * 0.02 for rev in revenues],
            "beta": beta,
            "perpetual_growth_rate": 0.025,
            "market_risk_premium": 0.055,
            "current_share_price": current_price,
            "shares_outstanding": shares,
            "unit_multiplier": "millions",
        }

        # Final validation
        for key, value in data.items():
            if isinstance(value, list):
                if not all(isinstance(x, (int, float)) for x in value):
                    raise ValueError(f"Invalid data type in {key}")

        return data

    except Exception as e:
        error_msg = f"Error fetching data for {ticker}: {str(e)}"
        print(f"DEBUG: {error_msg}", file=sys.stderr)
        raise Exception(error_msg)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide a ticker symbol"}))
        sys.exit(1)

    ticker = sys.argv[1].upper()
    try:
        data = fetch_financial_data(ticker)
        print(json.dumps(data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
