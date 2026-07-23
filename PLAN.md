# Implementation Plan: MediSight AI (Case Study ML-003)

This document outlines the technical approach, folder structure, build sequence, and milestone breakdown for the MediSight AI project, based on the provided Product Requirements Document (PRD).

## 1. Tech Stack (Confirmed & Refined)
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Recharts, React Hook Form, Zod.
- **Backend/Database**: Supabase (Postgres, Auth, Storage, Edge Functions, Realtime, pgvector).
- **ML Service**: Python 3.10+, FastAPI, Scikit-learn, XGBoost, LightGBM, SHAP, MLflow.
- **AI Assistant**: LLM integration (OpenAI or Anthropic) via Supabase Edge Functions with pgvector for RAG.
- **Infrastructure**: Vercel (Frontend), Supabase Cloud (Backend), Render/Railway/Fly.io (ML Service).

## 2. Monorepo Folder Structure
```text
medisight-ai/
├── .github/workflows/          # CI/CD pipelines
├── frontend/                   # Next.js web application
│   ├── src/app/                # App router pages
│   ├── src/components/         # Reusable UI components
│   ├── src/lib/                # Utilities, API clients
│   └── src/store/              # Zustand state
├── supabase/                   # Supabase configuration & Edge Functions
│   ├── migrations/             # SQL schema definitions
│   ├── functions/              # Deno Edge Functions
│   └── config.toml             # Local Supabase config
├── ml-service/                 # FastAPI ML inference & training service
│   ├── app/                    # FastAPI routers and models
│   ├── model_training/         # Training scripts & feature engineering
│   ├── tests/                  # Pytest cases
│   └── requirements.txt        # Python dependencies
├── docs/                       # PRD, Architecture, Deployment guides
│   └── PRD.md
├── scripts/                    # Helper scripts (DB seeding, data gen)
├── .env.example                # Template for environment variables
├── README.md                   # Main project documentation
└── PLAN.md                     # Implementation plan (this file)
```

## 3. Build Order (Sequence of Execution)
Following the 10-step agent sequence from the prompt guidelines, we will execute in this exact order:
1. **Project Scaffolding & Setup**: Initialize git, monorepo folders, base dependencies, and environment files.
2. **Database Schema, RLS & Auth**: Write SQL migrations for all tables, set up RLS policies, and configure Supabase Auth.
3. **Synthetic Data & Feature Engineering**: Generate a realistic synthetic dataset and build the Python feature engineering pipeline.
4. **ML Training & Inference API**: Train models (Logistic Regression, XGBoost, LightGBM), track in MLflow, and build FastAPI endpoints with SHAP.
5. **Supabase Edge Functions**: Implement orchestration layer (`predict-risk`, `ai-assistant-chat`, `send-alert`, etc.) and DB webhooks.
6. **Core Frontend**: Build Auth flows, Dashboard, Patient List, and Patient Detail screens wired to Supabase.
7. **Predictions UI & AI Assistant**: Implement SHAP waterfall charts, Realtime Alerts Center, and the conversational AI interface.
8. **Admin Panel & MLOps UI**: Build user management, model registry view, drift monitoring, and retraining triggers.
9. **Testing, Hardening & CI/CD**: Write automated tests, accessibility pass, GitHub Actions pipeline, and deployment prep.

## 4. Missing Decisions & Ambiguities
Before we begin scaffolding (Prompt 2), I need you to confirm the following decisions:
1. **ML Service Hosting:** FastAPI cannot run natively on Vercel. Where do you prefer to host the ML service? (e.g., Render, Railway, Fly.io, or AWS).
2. **Seed Disease Choice:** Should we start with **Diabetes** (Pima dataset) or **Heart Disease** (UCI dataset) for the initial MVP?
3. **LLM Provider:** Which provider API key will you supply for the AI Assistant? (Anthropic Claude or OpenAI).

## 5. Phased Milestone Breakdown (4-Week Roadmap)
Mapped directly to PRD Section 21:

- **Milestone 1 (Week 1 - Foundations):**
  - Monorepo setup, Next.js UI scaffolding.
  - Supabase Auth, DB Schema, and RLS policies.
  - Synthetic data generation and baseline ML model.
- **Milestone 2 (Week 2 - Core ML + Dashboard):**
  - Advanced models (XGBoost/LightGBM) + MLflow.
  - FastAPI inference service with SHAP integration.
  - Core UI: Dashboard, Patient List, and Predictions view wired to APIs.
- **Milestone 3 (Week 3 - Differentiators):**
  - AI Assistant (RAG) via Edge Functions.
  - Supabase Realtime Alerts Center.
  - Admin Panel and population-level analytics.
- **Milestone 4 (Week 4 - Polish & Handover):**
  - MLOps (retraining triggers, drift detection).
  - Automated testing & CI/CD pipeline setup.
  - Final documentation (Deployment Guide, Presentation prep).
