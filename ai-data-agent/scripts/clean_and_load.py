import os

def main():
    import sys
    import pandas as pd
    from sqlalchemy import create_engine

    if len(sys.argv) != 3:
        print("Usage: python clean_and_load.py <csv_file> <table_name>")
        sys.exit(1)

    csv_file, table = sys.argv[1], sys.argv[2]

    # Load CSV
    df = pd.read_csv(csv_file)

    # DB URL (default SQLite)
    db_url = os.getenv("DATABASE_URL", "sqlite:///./data.db")

    engine = create_engine(db_url)
    df.to_sql(table, engine, if_exists="replace", index=False)

    # Debug info
    print("=== DEBUG INFO ===")
    print("CWD:", os.getcwd())
    print("DB URL used:", db_url)
    if db_url.startswith("sqlite:///./"):
        print("Absolute path for data.db:", os.path.abspath("data.db"))

    print(f"✅ Loaded cleaned table {table} into {db_url}")


if __name__ == "__main__":
    main()
