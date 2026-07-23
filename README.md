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

## Clinical Datasets Disclosures

As this is an enterprise clinical predictive platform, we ingest, process, and train models using de-identified clinical datasets containing real health indicators:
1. **Diabetes Health Indicators**: CDC BRFSS 2015 dataset containing 253,680 survey responses.
2. **Heart Disease Health Indicators**: CDC BRFSS 2015 dataset for cardiovascular disease.
3. **Chronic Kidney Disease (CKD) Dataset**: Containing continuous clinical metrics (GFR, Creatinine, Electrolytes, HbA1c).
4. **Stroke Prediction Dataset**: Structured clinical risk factors (hypertension, heart disease, average glucose level, BMI).
5. **Liver Patient Dataset (LPD)**: Continuous enzyme and protein metrics (bilirubin, SGPT, SGOT, albumin).
6. **Breast Cancer Wisconsin Dataset**: Nuclear feature measurements from fine needle aspirates.
7. **Hypertension Health Indicators**: BRFSS 2015 indicators for blood pressure risk factors.

*Note: All data has been de-identified and is formatted in FHIR-like observations (vitals, lab results, medications, and diagnoses) inside the Supabase Postgres database for demonstration and training.*

