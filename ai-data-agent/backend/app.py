# backend/app.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os, re, json
from sqlalchemy import create_engine, text
import pandas as pd
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

app = FastAPI()
origins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str

def is_destructive(sql_text):
    dangerous = ['drop', 'delete', 'alter', 'update', 'truncate', 'insert', 'replace']
    return any(k in sql_text.lower() for k in dangerous)

def get_schema_snippet():
    with engine.connect() as conn:
        tables = []
        res = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"))
        table_names = [row[0] for row in res]
        for t in table_names:
            cols_df = pd.read_sql_query(text(f"PRAGMA table_info('{t}')"), conn)
            cols = cols_df['name'].tolist()
            tables.append({"table": t, "columns": cols})
    return tables

def extract_sql(response):
    m = re.search(r"```sql(.*?)```", response, re.S|re.I)
    if m: return m.group(1).strip()
    m2 = re.search(r"(select .*;?)", response, re.I|re.S)
    return m2.group(1).strip() if m2 else response.strip()

@app.post("/api/ask")
def ask(req: QueryRequest):
    # For now: demo mode — no OpenAI, just a fixed SQL
    sql = "SELECT region, SUM(quantity * unit_price) AS revenue FROM sales GROUP BY region;"

    if is_destructive(sql):
        raise HTTPException(status_code=400, detail="Destructive SQL is not allowed.")

    try:
        df = pd.read_sql_query(text(sql), engine)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL execution failed: {str(e)}")

    rows = df.to_dict(orient="records")
    columns = df.columns.tolist()
    return {"sql": sql, "summary": "Here is the revenue grouped by region.", "rows": rows, "columns": columns}
