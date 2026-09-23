# 🩺 InteractMD — Clinical AI Simulation Platform

InteractMD is a virtual patient simulation platform designed for medical students, residents, and clinical educators to practice OSCE diagnostic encounters, clinical history taking, physical exams, and structured attending evaluations.

---

## 📁 Repository Structure

```text
interact MD/
├── 📁 frontend/          # React 19 + TypeScript + Vite + Tailwind CSS Application
│   ├── src/              # UI components, clinical views, simulation room, login
│   ├── public/           # Clinical avatars, assets, and icons
│   └── package.json      # Frontend client scripts & dependencies
│
├── 📁 backend/           # NestJS + TypeScript Enterprise API Server
│   ├── src/              # Modules (Auth, Users, Cases, Simulations, Evaluations)
│   ├── prisma/           # Prisma ORM schema & migrations
│   └── package.json      # Backend API scripts & dependencies
│
├── 📁 chatbot/           # Python FastAPI AI Patient Simulation Engine
│   ├── ai_engine.py      # LLM patient persona prompts (OpenAI / Anthropic / Gemini / Mock)
│   ├── main.py           # FastAPI application & REST endpoints
│   ├── models/           # Database models & schemas
│   └── requirements.txt  # Python dependencies
│
├── package.json          # Root workspace launcher
└── docker-compose.yml    # Container orchestration
```

---

## 🚀 Quick Start Guide

### 1. Run the Frontend UI
```bash
# Option A: From root directory
npm run dev:frontend

# Option B: From inside the frontend folder
cd frontend
npm run dev
```
> Open browser at: **`http://localhost:5173`**

---

### 2. Run the NestJS Backend API
```bash
# Option A: From root directory
npm run dev:backend

# Option B: From inside the backend folder
cd backend
npm run dev
```
> API running at: **`http://localhost:8000/api/v1`**  
> Interactive Swagger UI: **`http://localhost:8000/api/docs`**

---

### 3. Run the Python AI Patient Chatbot
```bash
# Option A: From root directory
npm run dev:chatbot

# Option B: From inside the chatbot folder
cd chatbot
python run.py
```
> Chatbot service running at: **`http://localhost:8000`**

---

## 🔑 Quick Demo Login Credentials
- **Medical Student MS3 (Dr. Alex Morgan):** `alex.morgan@medschool.edu` (Any password / 1-Click login)
- **Clinical Attending (Dr. Sarah Chen):** `sarah.chen@medschool.edu`
- **Simulation Director (Admin):** `admin@interactmd.ai`
