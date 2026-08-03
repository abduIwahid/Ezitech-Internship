# COMSATS University Islamabad (CUI), Islamabad Campus
## Department of Computer Science
### Internship Weekly Progress Report — Week 1 & Week 2

**Student Name:** [Your Name]   
**Registration Number:** [Your CUI Registration Number]  
**Degree Program:** BS Computer Science  
**Host Organization:** Ezitech Engineering  
**Project Title:** MediSight AI (Clinical Decision Support Platform)  
**Academic Supervisor:** [Faculty Supervisor Name]  
**Site Supervisor:** [Host/Site Supervisor Name]  

---

## 📅 Week 1 Progress Report
* **Reporting Period:** Week 1 (40 Hours)
* **Domain Focus:** Database Modeling, Monorepo Scaffolding & System Security (RLS)

### 1. Objective of the Week
The primary objective of Week 1 was to establish the structural and security foundation of the MediSight AI monorepo. This included designing the database schema, creating table relations for multi-modal patient records, establishing Row-Level Security (RLS) policies for HIPAA/GDPR compliance, and setting up the authentication flow for hospital staff (doctors, administrators, and assistants).

### 2. Nature of Tasks and Responsibilities Undertaken
As a Full-Stack Machine Learning Engineer Intern, my responsibilities during the first week included:
* **Monorepo Scaffolding:** Initializing the project workspace and separating concerns into `/frontend` (Next.js 14 Web Application), `/ml-service` (FastAPI Python backend), and `/supabase` (database migrations and serverless edge logic).
* **Database Schema Design:** Authoring custom SQL migration files to create 14 interconnected relational tables (`profiles`, `hospitals`, `patients`, `vitals`, `lab_results`, `medications`, `diagnoses`, `predictions`, `explanations`, `alerts`, `audit_logs`, `doctor_patient_assignments`, `ai_chat_sessions`, `ai_messages`).
* **Row-Level Security (RLS) Implementation:** Writing custom SQL policy rules to restrict data access, ensuring that doctors can only view, create, or modify records of patients belonging to their assigned hospital departments.
* **Authentication Infrastructure:** Configuring Supabase Auth redirects, including multi-factor authentication (MFA) requirements for administrative and medical accounts, and password recovery redirection routes.

### 3. Technologies, Frameworks, and Tools Used
* **Frontend Core:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
* **Backend Database:** PostgreSQL, Supabase Local Development Environment.
* **Version Control:** Git, GitHub for repository synchronization.
* **Environment Configuration:** Dotenv modules (`.env.example` configurations).

### 4. Learning Experience (Knowledge & Skills Gained)
* **Technical Knowledge Gained:** Mastered the creation of granular security policies (RLS) at the database engine level. Understood how to map database structures to front-end sessions using modern Server Components.
* **Professional Skills Learned:** Gained insights into HIPAA compliant data engineering and the role of identity management in clinical settings.

### 5. Challenges Faced and Solutions Applied
* **Challenge:** Encountering recursive dependency conflicts when trying to apply database migrations containing self-referencing foreign keys (e.g., matching doctors with profiles and clinical departments).
* **Solution:** Re-ordered the migration execution sequence, separating the creation of core profiles from relational assignment tables, and utilized independent reference constraints.

### 6. Connection to Academic Preparation
This week's assignments directly bridged the concepts learned in **CSC371 (Database Systems)** and **CSC325 (Software Engineering)**. Implementing relational constraints, index optimizations, and database policies allowed me to apply academic transactional theory to a real-world enterprise healthcare system.

---

## 📅 Week 2 Progress Report
* **Reporting Period:** Week 2 (40 Hours)
* **Domain Focus:** Synthetic Ingestion, Feature Engineering & ML Pipeline Development

### 1. Objective of the Week
The primary objective of Week 2 was to implement the machine learning pipeline. This involved generating clinical synthetic datasets, designing a feature engineering pipeline to compute medical biomarkers, training multiple predictive models, selecting the best-performing production candidate, and integrating explainability parameters via SHAP.

### 2. Nature of Tasks and Responsibilities Undertaken
My tasks and responsibilities during the second week included:
* **Dataset Generation & DB Seeding:** Populating the Supabase database with 400 realistic, de-identified patient records across four key categories (Diabetes, Stroke, Heart Disease, Kidney Disease) and 2,100 compliant audit-logged events.
* **Feature Engineering Module Development:** Creating a reusable Python feature transformer (`feature_engineer.py`) that computes clinical indexes, including:
  * WHO Body Mass Index (BMI).
  * AHA Blood Pressure stages (Mean Arterial Pressure, BP flags).
  * eGFR (Estimated Glomerular Filtration Rate) using Age, Sex, and Serum Creatinine values.
  * Composite cardiovascular risk index.
* **ML Model Training & Experiment Tracking:** Training baseline Logistic Regression, Random Forest, XGBoost, and LightGBM models, utilizing MLflow to track parameters, training metrics, and artifact outputs.
* **Model Evaluation & Explainability:** Evaluating model AUC-ROC and Recall. Integrating **SHAP (SHapley Additive exPlanations)** to extract global feature contributions and local waterfall plots for clinical clarity.
* **FastAPI Prediction Microservice:** Building the prediction REST endpoints (`/predict`, `/explain`, `/retrain`, `/model-status`) to serve model predictions in real-time.

### 3. Technologies, Frameworks, and Tools Used
* **Programming Languages:** Python 3.10.
* **Libraries & Core Engines:** Scikit-learn, XGBoost, LightGBM, SHAP, MLflow, SQLAlchemy, Pandas, NumPy, FastAPI.
* **Testing Suite:** Pytest for feature calculation validation.

### 4. Learning Experience (Knowledge & Skills Gained)
* **Technical Knowledge Gained:** Deepened understanding of handling extreme class imbalance in medical data using class weighting (`class_weight='balanced'`). Mastered the use of local explainability frameworks (SHAP) to interpret black-box model decisions.
* **Professional Skills Learned:** Learned how to log model runs, registry schemas, and parameters systematically, which is crucial for MLOps tracking and audit trails.

### 5. Challenges Faced and Solutions Applied
* **Challenge:** High class imbalance in the training datasets caused models to show high accuracy but poor Recall, which could result in dangerous missed diagnoses in a clinical environment.
* **Solution:** Configured model hyperparameters with custom positive class weights (e.g., `scale_pos_weight` in XGBoost and `class_weight='balanced'` in LightGBM) to prioritize Recall over Precision, achieving a validated AUC-ROC of **0.8307** and reducing False Negatives.

### 6. Connection to Academic Preparation
The work completed during this period drew heavily on **CSC483 (Machine Learning)** and **CSC312 (Artificial Intelligence)**. Applying feature scaling, hyperparameter tuning, model performance evaluation, and ensemble strategies turned theoretical learning into an active predictive service.
