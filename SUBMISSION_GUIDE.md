# MediSight AI — Internship Project Submission Guide

Welcome to the submission and hand-off guide for **MediSight AI**, an enterprise-grade clinical decision support and predictive analytics platform. 

This document explains the system architecture, how the database is connected (Supabase), how to run the services, and provides pre-seeded accounts so evaluators can test the project immediately.

---

## 🏗️ System Architecture

The application is structured as a modern monorepo:
1. **Frontend (`/frontend`)**: Next.js 14 (App Router) client with an elegant, responsive medical dashboard UI.
2. **Database & Auth (`/supabase`)**: Schema migrations, Row Level Security (RLS) policies, and serverless Edge Functions.
3. **ML Inference Service (`/ml-service`)**: FastAPI service loading trained Joblib models to perform diabetes risk predictions, compute SHAP explainability values, and track models.

---

## 💾 Database Integration & Evaluation Options

To evaluate the project, you have **two options** depending on whether you want to run it instantly or fully isolate the database.

> [!TIP]
> **Option A (Instant Cloud Evaluation)** is highly recommended for quick testing because it connects to an already-configured cloud database with all clinical data seeded.

### Option A: Instant Cloud Evaluation (Recommended)
The project comes pre-configured with active environment variables inside `.env` and `frontend/.env.local`. You **do not need to sign up for Supabase or build schemas** to run this.
1. The frontend connects directly to the pre-deployed cloud instance.
2. Follow the **Service Startup** instructions below.
3. Log in using any of the [Pre-seeded Test Accounts](#-pre-seeded-test-accounts).

### Option B: Isolated Local Database (via Supabase CLI)
If you want to run an entirely local, isolated database:
1. Install Docker on your machine.
2. Install the Supabase CLI globally:
   ```bash
   npm install -g supabase
   ```
3. Run the following command from the root directory to spin up the local database containers (which automatically applies all migrations in `/supabase/migrations`):
   ```bash
   supabase start
   ```
4. Copy the local API URL and anon key outputted by the terminal into your `frontend/.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_local_anon_key"
   ```
5. Apply the doctor account seeds using the SQL Editor or by copying the content of `supabase/seed_doctors_via_sql_editor.sql`.

---

## 🚀 Service Startup Instructions

Follow these steps to run the application on your local machine:

### 1. Start the FastAPI ML Service
Open a terminal in the root directory:
```bash
cd ml-service

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the prediction engine
uvicorn app.main:app --port 8000 --reload
```
*The ML Service docs will be accessible at `http://localhost:8000/docs`.*

### 2. Start the Next.js Frontend
Open a new terminal in the root directory:
```bash
cd frontend

# Install packages
npm install

# Run the development server
npm run dev
```
*The web app will run at `http://localhost:3000`.*

---

## 🔑 Pre-seeded Test Accounts

Use the following pre-seeded doctor credentials to log in and inspect the platform's features:

| Email | Password | Role / Department | Name |
| :--- | :--- | :--- | :--- |
| `fatima.ahmed@medisight.ai` | `TempPass1!` | Cardiology | Dr. Fatima Ahmed |
| `hassan.khan@medisight.ai` | `TempPass2!` | Endocrinology | Dr. Hassan Khan |
| `amira.malik@medisight.ai` | `TempPass3!` | Nephrology | Dr. Amira Malik |
| `ali.hussain@medisight.ai` | `TempPass4!` | Internal Medicine | Dr. Ali Hussain |
| `zainab.ali@medisight.ai` | `TempPass5!` | Pulmonology | Dr. Zainab Ali |

---

## 🎯 Key Evaluation Features to Showcase

When reviewing the application, you can guide the evaluators through the following premium features:

1. **Secure Login & Role-Based Access Control**: Standard-compliant authentication using Supabase.
2. **Clinical Patient Registry**: View 400+ pre-seeded patient records with demographic data and clinical observations.
3. **Interactive Diagnostics Tool**:
   * Open any patient and run a new **Diabetes Risk Assessment**.
   * Inputs are sent to the FastAPI service which returns a real-time risk score.
   * View the **SHAP Clinical Explanability Waterfall** which dynamically highlights the patient's individual risk drivers (e.g., BMI, High Blood Pressure).
4. **MLOps Governance Dashboard** (Admin Portal):
   * Inspect current model metrics (AUC-ROC, accuracy, version).
   * Review **Population Drift Metrics (PSI)** calculated live on the CDC dataset.
   * Click **Retrain Model** to trigger asynchronous model retraining in the background.
5. **System Audit Logs**: Real-time security tracking of clinical actions (patient deletions, model retraining requests, profile updates).
