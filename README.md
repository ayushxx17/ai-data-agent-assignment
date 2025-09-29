📊 AI Data Agent Assignment

This project demonstrates a simple AI-powered Data Agent with a FastAPI backend and a React + Vite + Tailwind + Recharts frontend.

It allows users to ask natural language questions about sales data, which are automatically converted into SQL queries, executed on a SQLite database, and visualized with tables and charts.

🚀 Features
🔹 Backend (FastAPI)

.📥 Loads and cleans CSV data into SQLite

.🌐 Exposes an /api/ask endpoint that takes natural language queries

.📊 Returns SQL, summary, rows, and chart metadata

.📖 Interactive API docs available at /docs (Swagger UI)

🔹 Frontend (React + Vite)

.🖊️ User-friendly interface to type queries

.📈 Displays summary, SQL, chart (bar / line / pie) and results table

.💾 Supports download to CSV and copy SQL to clipboard

.🎨 Styled with TailwindCSS and powered by Recharts

📂 Project Structure
ai-data-agent-assignment/
├── ai-data-agent        # Backend (Python, FastAPI)
│   ├── backend          # FastAPI app
│   ├── scripts          # CSV loading scripts
│   └── sample_data      # Example CSV file
│
└── frontend             # Frontend (React, Vite, Tailwind, Recharts)

⚡️ Setup & Run
🔹 Backend (FastAPI)
cd ai-data-agent
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scripts\clean_and_load.py sample_data\sample_sales.csv sales
uvicorn backend.app:app --reload --port 8000


👉 Runs at: http://127.0.0.1:8000

👉 Swagger UI: http://127.0.0.1:8000/docs

🔹 Frontend (React + Vite)
cd frontend
npm install
npm run dev


👉 Runs at: http://localhost:5173

✅ Example Queries

.Show me total revenue by region

.List total quantity sold by region

.Show revenue trend over time

.Compare sales between North and South regions

📌 Notes

.🗄️ Default database file: data.db (created in project root)

.🔐 CORS enabled for http://localhost:5173 so frontend can talk to backend

.🛠️ Works with SQLite out of the box, can be adapted to Postgres/MySQL

👨‍💻 Author

Ayush Kumar Singh































































































