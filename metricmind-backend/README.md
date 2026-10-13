# MetricMind Backend (FastAPI)

A runnable local API for MetricMind. It calculates sales analytics from the included demo CSV and offers a rule-based business-question endpoint. It is not a hosted LLM; real LLM behavior requires provider credentials and configuration.

## Run on Windows PowerShell
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
If activation is blocked:
```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Open http://127.0.0.1:8000/docs and http://127.0.0.1:8000/health.
Endpoints: GET `/api/dashboard?days=90`, GET `/api/analytics`, GET `/api/data`, GET `/api/reports`, POST `/api/chat` with `{"question":"Which category generated the highest profit?"}`.
Included CSV is demo data. Expected columns: date,region,country,product,category,revenue,cost.
