import pandas as pd
from pathlib import Path

RAW_FILE = Path("data/filtered_dashboard_data.csv")      # master postings file
OUT_FILE = Path("data/job_trend_by_country.csv")    # destination

def main():
    df = pd.read_csv(RAW_FILE)

    # Standardise column names
    df = df.rename(columns={"Date": "date"})

    # Make sure 'date' is YYYY‑MM‑DD strings
    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")

    ts = (df.groupby(["date", "country"])
            .size()
            .reset_index(name="count")
            .sort_values(["date", "country"]))

    OUT_FILE.parent.mkdir(exist_ok=True)
    ts.to_csv(OUT_FILE, index=False)
    print(f"✔️  Wrote {len(ts):,} rows → {OUT_FILE}")

if __name__ == "__main__":
    main()
