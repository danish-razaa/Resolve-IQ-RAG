# ResolveIQ RAG & Multi-Agent Backend Engine

FastAPI web service and autonomous multi-agent pipeline for intelligent banking complaint resolution.

---

## ⚡ Architecture Flow

1. **Deterministic PII Masking** (`master_agent.py`): Replaces Rupee amounts, phone numbers, account numbers, and customer names with cryptographic tokens before any third-party model call.
2. **Gemini Domain Triage & Scoring** (`master_agent.py`): Classifies complaints into `UPI`, `CreditDebit`, `NetBanking`, `KYC`, or `Loans` with quantitative confidence ($0.0 \dots 1.0$), severity, sentiment, and priority.
3. **Confidence Gate**: Complaints with confidence $< 0.60$ are automatically escalated to a human queue.
4. **Domain-Isolated ChromaDB Vector Stores** (`rag_engine.py`): Retrieves relevant RBI policy circulars, auto-reversal mandates, and resolution turnaround timelines (TAT) using local `all-MiniLM-L6-v2` embeddings.
5. **Specialized Domain Agents** (`agents/`): Generates 1-line root causes, formal personalized responses, and statutory RBI resolution time commitments.

---

## 🚀 Quickstart

### 1. Environment Setup
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file:
```env
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run the FastAPI Web Service
```bash
uvicorn api:app --reload --port 8000
```
Interactive Swagger docs: `http://localhost:8000/docs`

### 4. Run the Standalone CLI Test Suite
```bash
python main.py
```

---

## 📦 API Endpoints

- `GET /health` — Service status, ChromaDB vector store health, and API key verification.
- `POST /api/process-complaint` — Full multi-agent complaint triage & RAG resolution pipeline.
- `POST /api/mask-pii` — PII sanitization utility.
- `GET /api/sample-complaints` — Pre-loaded testing scenarios.