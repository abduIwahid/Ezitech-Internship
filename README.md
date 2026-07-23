# MediSight AI

Enterprise Healthcare Early Disease Risk Prediction & Clinical Decision Support Platform.

## Project Structure

- `frontend/`: Next.js 14 web application (App Router, Tailwind CSS, shadcn/ui).
- `supabase/`: Database migrations, Edge Functions, and Supabase config.
- `ml-service/`: FastAPI service for machine learning inference, explainability (SHAP), and model tracking.

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase CLI
- Docker (optional, for local Supabase)

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. ML Service
```bash
cd ml-service
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Supabase
```bash
supabase start
```

*Note: As this is an internship case study, the dataset used for the ML models is a synthetic/de-identified derivative of public healthcare datasets (e.g., Pima Diabetes/UCI Heart Disease), extended with synthetic time-series vitals to simulate hospital data.*
