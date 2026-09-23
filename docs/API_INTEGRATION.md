# InteractMD — Frontend ↔ Backend API Integration Specification

This document details the complete end-to-end REST API integration connecting the **React/Vite Frontend** to the **FastAPI AI Virtual-Patient Backend** powered by **MongoDB Atlas** and **Hugging Face**.

---

## 1. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               React + Vite Frontend                   │
│        (http://localhost:5173 / localhost:5174)        │
└─────────────────────────┬──────────────────────────────┘
                          │ HTTP REST API (JSON)
                          ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Python Chatbot Backend             │
│                 (http://localhost:8001)                │
├────────────────────────────────────────────────────────┤
│ • AI Orchestrator & Safety Validator                  │
│ • Intent Classifier (OPQRST / ROS / Negative / Jargon) │
│ • Tri-State Fact Retriever & Progressive Controller    │
│ • Physical Examination & Diagnostic Testing Engines    │
│ • Clinical Submission & 5-Dimension OSCE Evaluator     │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│       MongoDB Atlas       │ │     Hugging Face LLM     │
│  (Database: `interactmd`) │ │(Conversational Phrasing) │
│ • Cases (Source of Truth) │ └──────────────────────────┘
│ • Sessions & Messages     │
│ • Interaction Events      │
│ • OSCE Evaluations        │
│ • User Accounts           │
└───────────────────────────┘
```

---

## 2. Environment Configuration

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8001
```

### Backend (`chatbot/.env`)
```env
APP_NAME=InteractMD
ENVIRONMENT=development
DEBUG=true

DATABASE_URL=sqlite:///./interactmd.db
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.oubgq77.mongodb.net/interactmd?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=interactmd

JWT_SECRET_KEY=CHANGE_THIS_SECRET_KEY_FOR_PRODUCTION_INTERACTMD_2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174

LLM_PROVIDER=huggingface
HF_TOKEN=hf_**********************************
HF_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
```

---

## 3. Endpoints Contract

### A. Health & Liveness
- **`GET /health`** / **`GET /api/health`**
  - Response:
  ```json
  {
    "status": "online",
    "provider": "HuggingFace (meta-llama/Meta-Llama-3-8B-Instruct)",
    "rag": true,
    "database": "MongoDB Atlas"
  }
  ```

---

### B. User Authentication
- **`POST /api/v1/auth/register`**
  - Request: `{"firstName": "Alex", "lastName": "Morgan", "email": "alex@med.edu", "password": "securepassword123"}`
  - Response: `{"access_token": "ey...", "token_type": "bearer", "user": {"id": "user_...", "email": "alex@med.edu", "first_name": "Alex", "last_name": "Morgan", "role": "LEARNER"}}`
- **`POST /api/v1/auth/login`**
  - Request: `{"email": "alex@med.edu", "password": "securepassword123"}`
  - Response: `{"access_token": "ey...", "token_type": "bearer", "user": {"id": "user_...", "email": "alex@med.edu", "first_name": "Alex", "last_name": "Morgan", "role": "LEARNER"}}`
- **`GET /api/v1/auth/me`**
  - Header: `Authorization: Bearer <jwt>`
  - Response: User Profile.

---

### C. Clinical Case Library
- **`GET /api/v1/cases`**
  - Response: List of cases loaded directly from MongoDB Atlas:
  ```json
  [
    {
      "id": "chest_pain_001",
      "title": "Acute Retrosternal Chest Pain",
      "specialty": "Cardiology",
      "description": "58-year-old male presenting with acute crushing retrosternal chest tightness...",
      "difficulty": "Intermediate",
      "patient_name": "Robert Chen",
      "patient_age": 58,
      "patient_gender": "Male",
      "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      "chief_complaint": "I started having this really heavy pressure in my chest."
    }
  ]
  ```
- **`GET /api/v1/cases/{case_id}`**
  - Response: Case details, physical findings, and investigation catalog (hides hidden answers and evaluation rubric).

---

### D. Simulation Session & Dialogue
- **`POST /api/v1/sessions`**
  - Request: `{"case_id": "chest_pain_001"}`
  - Response:
  ```json
  {
    "id": "93407e35-5b87-4340-9742-df57d4ce9c22",
    "case_id": "chest_pain_001",
    "status": "ACTIVE",
    "started_at": "2026-09-23T09:30:00Z"
  }
  ```

- **`POST /api/v1/sessions/{session_id}/messages`** or **`POST /api/simulation/chat`**
  - Request:
  ```json
  {
    "case_id": "chest_pain_001",
    "session_id": "93407e35-5b87-4340-9742-df57d4ce9c22",
    "message": "Does the pain radiate anywhere?",
    "conversation_history": []
  }
  ```
  - Response:
  ```json
  {
    "reply": "Yes, it radiates up into the left side of my jaw and down my left arm.",
    "category": "HPI",
    "empathy_detected": false,
    "provider": "HuggingFace (meta-llama/Meta-Llama-3-8B-Instruct)",
    "facts_revealed": ["radiation"]
  }
  ```

---

### E. Physical Examination & Diagnostic Investigations
- **`POST /api/v1/sessions/{session_id}/examinations`** / **`POST /api/simulation/exam`**
  - Request: `{"case_id": "chest_pain_001", "exam_id": "exam-cv-ausc", "system": "Cardiovascular"}`
  - Response:
  ```json
  {
    "system": "Cardiovascular",
    "finding": "Precordial & Heart Auscultation",
    "value": "Normal S1 and S2 present. Soft S4 gallop audible at apex. No murmurs or pericardial friction rub.",
    "is_abnormal": true
  }
  ```

- **`POST /api/v1/sessions/{session_id}/investigations`** / **`POST /api/simulation/investigation`**
  - Request: `{"case_id": "chest_pain_001", "test_id": "inv-ecg"}`
  - Response:
  ```json
  {
    "name": "STAT 12-Lead Electrocardiogram (ECG)",
    "category": "Cardiology / Point-of-Care",
    "result": "2.5 mm ST-segment elevation in leads II, III, aVF with reciprocal ST depression in leads I and aVL.",
    "interpretation": "Acute Inferior STEMI."
  }
  ```

---

### F. Clinical Reasoning Submissions & OSCE Evaluation
- **`POST /api/v1/sessions/{session_id}/diagnosis`**
  - Request: `{"primary_diagnosis": "dx-stemi", "differentials": ["dx-stemi", "dx-dissection", "dx-pe"]}`
- **`POST /api/v1/sessions/{session_id}/management`**
  - Request: `{"immediate_actions": ["Administer chewable Aspirin 324 mg STAT", "Activate Cardiac Catheterization Lab for Emergent Primary PCI"]}`
- **`POST /api/v1/sessions/{session_id}/evaluate`** / **`POST /api/simulation/evaluate`**
  - Response: 5-Dimension Competency Assessment with numerical scores (0–100), letter grades, feedback, critical actions audit, and recommendations.

---

## 4. How to Run Locally

1. **Start Backend**:
   ```bash
   cd "c:\Users\ASUS\Desktop\interact MD\chatbot"
   python run.py
   ```
   Backend listens at `http://localhost:8001` (Docs: `http://localhost:8001/docs`).

2. **Start Frontend**:
   ```bash
   cd "c:\Users\ASUS\Desktop\interact MD\frontend"
   npm run dev
   ```
   Frontend opens at `http://localhost:5173` (or `5174`).
