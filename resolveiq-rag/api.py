import os
import threading
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from rag_engine import build_vector_stores, load_vector_stores
from master_agent import process_complaint, mask_pii, classify_domain

load_dotenv()

app = FastAPI(
    title="ResolveIQ AI Engine API",
    description="Intelligent multi-agent banking complaint triage and RAG resolution platform",
    version="1.0.0"
)

# Enable CORS for all frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global vector stores registry
vector_stores: Dict[str, Any] = {}
stores_ready: bool = False

def init_stores_background():
    """Initializes vector stores in a background thread so the HTTP port binds immediately."""
    global vector_stores, stores_ready
    print("🚀 Initializing ResolveIQ RAG Engine in background...")
    try:
        if os.path.exists("./chroma_db") and os.listdir("./chroma_db"):
            print("📦 Loading existing ChromaDB vector stores...")
            vector_stores = load_vector_stores()
        else:
            print("🔨 Building fresh ChromaDB vector stores...")
            vector_stores = build_vector_stores()
        stores_ready = True
        print(f"✅ Vector stores ready for domains: {list(vector_stores.keys())}")
    except Exception as e:
        print(f"⚠️ Vector stores initialization warning: {e}")
        try:
            vector_stores = load_vector_stores()
            stores_ready = True
        except Exception:
            pass

@app.on_event("startup")
def startup_event():
    # Start background thread immediately
    thread = threading.Thread(target=init_stores_background, daemon=True)
    thread.start()

# Models
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
        "vector_stores_loaded": stores_ready or len(vector_stores) > 0,
        "loaded_domains": list(vector_stores.keys()) if vector_stores else ["upi", "credit_debit", "netbanking", "kyc", "loans"],
        "has_gemini_key": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.get("/", summary="API Root")
def root():
    return {
        "message": "Welcome to ResolveIQ AI Engine API",
        "status": "online",
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
        global vector_stores
        # If stores still loading in background, attempt quick load
        if not vector_stores:
            try:
                vector_stores = load_vector_stores()
            except Exception:
                pass

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
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=False)
