import os
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from rag_engine import build_vector_stores, load_vector_stores
from master_agent import process_complaint, mask_pii, classify_domain

load_dotenv()

# Global vector stores registry
vector_stores: Dict[str, Any] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load or build vector stores
    global vector_stores
    print("🚀 Initializing ResolveIQ RAG Engine...")
    try:
        if os.path.exists("./chroma_db") and os.listdir("./chroma_db"):
            print("📦 Loading existing ChromaDB vector stores...")
            vector_stores = load_vector_stores()
        else:
            print("🔨 Building fresh ChromaDB vector stores from knowledge base...")
            vector_stores = build_vector_stores()
        print("✅ Vector stores initialized successfully.")
    except Exception as e:
        print(f"⚠️ Vector stores initialization warning: {e}")
        # Try loading anyway if build failed
        try:
            vector_stores = load_vector_stores()
        except Exception:
            pass
    yield
    # Shutdown
    vector_stores.clear()

app = FastAPI(
    title="ResolveIQ AI Engine API",
    description="Intelligent multi-agent banking complaint triage and RAG resolution platform",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend clients (local and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request & Response Models
class ComplaintRequest(BaseModel):
    customer_name: str = Field(..., example="Rajesh Kumar")
    complaint: str = Field(..., example="I made a UPI payment of ₹15000 to Suresh Mehta but money was debited and not received. Transaction ID TXN9834521.")

class MaskPIIRequest(BaseModel):
    text: str = Field(..., example="Customer Rajesh Kumar paid ₹15000 via 9876543210")
    customer_name: Optional[str] = Field(default="", example="Rajesh Kumar")

@app.get("/health", summary="Health and Status Check")
def health_check():
    return {
        "status": "healthy",
        "service": "ResolveIQ AI Engine",
        "vector_stores_loaded": len(vector_stores) > 0,
        "loaded_domains": list(vector_stores.keys()),
        "has_gemini_key": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.get("/", summary="API Root")
def root():
    return {
        "message": "Welcome to ResolveIQ AI Engine API",
        "docs_url": "/docs",
        "health_url": "/health"
    }

@app.post("/api/process-complaint", summary="Full Multi-Agent Complaint Processing")
def api_process_complaint(req: ComplaintRequest):
    if not req.complaint.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint text cannot be empty."
        )

    customer_name = req.customer_name.strip() or "Valued Customer"

    try:
        # Fallback to loading stores if empty
        global vector_stores
        if not vector_stores:
            try:
                vector_stores = load_vector_stores()
            except Exception:
                vector_stores = build_vector_stores()

        result = process_complaint(
            complaint=req.complaint,
            customer_name=customer_name,
            vector_stores=vector_stores
        )
        return result
    except Exception as e:
        print(f"❌ Error in process_complaint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process complaint: {str(e)}"
        )

@app.post("/api/mask-pii", summary="Utility to Preview PII Masking")
def api_mask_pii(req: MaskPIIRequest):
    masked_text, registry = mask_pii(req.text, req.customer_name or "")
    return {
        "original_text": req.text,
        "masked_text": masked_text,
        "pii_registry": registry,
        "tokens_found": len(registry)
    }

@app.get("/api/sample-complaints", summary="Get Pre-configured Sample Complaints")
def get_sample_complaints():
    return [
        {
            "category": "UPI",
            "name": "Rajesh Kumar",
            "complaint": "I made a UPI payment of ₹15000 to Suresh Mehta but money was debited and not received. Transaction ID TXN9834521. Please help urgently."
        },
        {
            "category": "Credit Card",
            "name": "Priya Sharma",
            "complaint": "My credit card ending 7832 was charged ₹8500 twice for a transaction at Reliance Digital that I only authorized once. Reverse duplicate charge."
        },
        {
            "category": "NetBanking",
            "name": "Amit Patel",
            "complaint": "My net banking login is blocked after 3 failed attempts. I need urgent access to transfer funds for my business."
        },
        {
            "category": "KYC",
            "name": "Meena Nair",
            "complaint": "My KYC was rejected even though I submitted my PAN and Aadhaar. My account has been frozen for 10 days."
        },
        {
            "category": "Loans",
            "name": "Vikram Singh",
            "complaint": "My home loan EMI of ₹25000 was deducted twice this month. I need immediate reversal and explanation."
        }
    ]

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=True)
