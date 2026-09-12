import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

_client = None

def get_gemini_client():
    """Lazily and safely initialize Google GenAI client."""
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ WARNING: GEMINI_API_KEY environment variable is not set.")
            return None
        try:
            from google import genai
            _client = genai.Client(api_key=api_key)
        except Exception as e:
            print(f"⚠️ Failed to initialize Google GenAI Client: {e}")
            return None
    return _client

def generate_response(prompt: str) -> str:
    """Safe Gemini response generator with robust fallbacks."""
    client = get_gemini_client()
    if client is None:
        return (
            "1. Root Cause: Issue identified and recorded in banking resolution queue.\n"
            "2. Formal Reply: Dear Customer, We have received your complaint and initiated the necessary review with our operations department. "
            "Our team is actively processing your request in accordance with banking safety standards.\n"
            "3. Resolution TAT: Resolution within 24–48 working hours as per standard RBI turnaround norms."
        )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text if hasattr(response, "text") else str(response)
    except Exception as e:
        print(f"⚠️ Gemini API Call Failed: {e}")
        return (
            "1. Root Cause: System verification in progress.\n"
            "2. Formal Reply: Dear Customer, Thank you for bringing this matter to our attention. Your issue has been logged and assigned high priority.\n"
            "3. Resolution TAT: Standard resolution timeline of 24–48 hours applies."
        )

# Step 1 — Classify domain using Gemini
def classify_domain(complaint: str) -> dict:
    prompt = f"""
You are a banking complaint classifier.
Classify this complaint into exactly ONE domain.

Domains: UPI, CreditDebit, NetBanking, KYC, Loans

Complaint: {complaint}

Return ONLY a JSON object like this:
{{
  "domain": "UPI",
  "confidence": 0.95,
  "severity": "Critical",
  "sentiment": "Very Angry",
  "priority": 9
}}
No explanation. Only valid JSON.
"""
    response_text = generate_response(prompt)

    try:
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except Exception as e:
        print("⚠️ JSON parsing failed:", e)

    # Fallback keyword-based heuristic classification
    lower = complaint.lower()
    if "upi" in lower or "gpay" in lower or "phonepe" in lower or "paytm" in lower:
        domain = "UPI"
    elif "card" in lower or "chargeback" in lower or "pos" in lower or "atm" in lower:
        domain = "CreditDebit"
    elif "net banking" in lower or "netbanking" in lower or "login" in lower or "otp" in lower or "neft" in lower or "rtgs" in lower:
        domain = "NetBanking"
    elif "kyc" in lower or "pan" in lower or "aadhaar" in lower or "freeze" in lower:
        domain = "KYC"
    elif "loan" in lower or "emi" in lower or "foreclosure" in lower or "cibil" in lower:
        domain = "Loans"
    else:
        domain = "UPI"

    return {
        "domain": domain,
        "confidence": 0.85,
        "severity": "Critical" if ("debited" in lower or "fraud" in lower or "twice" in lower) else "Medium",
        "sentiment": "Angry" if ("urgently" in lower or "frustrating" in lower) else "Neutral",
        "priority": 8
    }

# Step 2 — PII Masking
def mask_pii(text: str, customer_name: str = "") -> tuple:
    registry = {}
    counter = {"NAME": 0, "ACCT": 0, "PHONE": 0, "AMT": 0}

    def replace_amount(m):
        counter["AMT"] += 1
        key = f"AMT_{counter['AMT']}"
        registry[key] = m.group()
        return f"[{key}]"

    def replace_phone(m):
        counter["PHONE"] += 1
        key = f"PHONE_{counter['PHONE']}"
        registry[key] = m.group()
        return f"[{key}]"

    def replace_acct(m):
        counter["ACCT"] += 1
        key = f"ACCT_{counter['ACCT']}"
        registry[key] = m.group()
        return f"[{key}]"

    masked = re.sub(r'₹\s?\d+[\d,]*', replace_amount, text)
    masked = re.sub(r'Rs\.?\s?\d+[\d,]*', replace_amount, masked)
    masked = re.sub(r'\b\d{10}\b', replace_phone, masked)
    masked = re.sub(r'\b\d{9,18}\b', replace_acct, masked)

    if customer_name:
        counter["NAME"] += 1
        key = f"NAME_{counter['NAME']}"
        masked = masked.replace(customer_name, f"[{key}]")
        registry[key] = customer_name

    return masked, registry

from agents import (
    upi_agent,
    credit_debit_agent,
    netbanking_agent,
    kyc_agent,
    loans_agent
)
from rag_engine import retrieve_context

AGENT_MAP = {
    "UPI": upi_agent,
    "CreditDebit": credit_debit_agent,
    "NetBanking": netbanking_agent,
    "KYC": kyc_agent,
    "Loans": loans_agent
}

DOMAIN_TO_STORE = {
    "UPI": "upi",
    "CreditDebit": "credit_debit",
    "NetBanking": "netbanking",
    "KYC": "kyc",
    "Loans": "loans"
}

def process_complaint(complaint: str,
                      customer_name: str,
                      vector_stores: dict = None) -> dict:

    print(f"\n📥 Complaint received from: {customer_name}", flush=True)

    # Step 1 — Mask PII
    masked_complaint, registry = mask_pii(complaint, customer_name)
    print(f"🔐 PII Masked. Tokens: {list(registry.keys())}", flush=True)

    # Step 2 — Classify domain
    classification = classify_domain(masked_complaint)
    domain = classification.get("domain", "UPI")
    confidence = classification.get("confidence", 0.8)
    print(f"🎯 Domain: {domain} | Confidence: {confidence}", flush=True)

    # Step 3 — Confidence gate
    if confidence < 0.6:
        return {
            "status": "escalated",
            "reason": "Low classification confidence",
            "classification": classification,
            "message": "Complaint escalated to human agent for manual review."
        }

    # Step 4 — RAG retrieval
    store_key = DOMAIN_TO_STORE.get(domain, "upi")
    context = retrieve_context(vector_stores, store_key, masked_complaint)
    print(f"📚 RAG context retrieved for domain: {domain}", flush=True)

    # Step 5 — Route to domain agent
    agent = AGENT_MAP.get(domain, upi_agent)

    try:
        result = agent.run(
            complaint=masked_complaint,
            context=context,
            customer_name=customer_name
        )
        print(f"✅ Response generated by: {result['agent']}", flush=True)
    except Exception as e:
        print(f"❌ Agent failed: {e}", flush=True)
        return {
            "status": "error",
            "message": "AI agent failed. Escalating to human.",
            "error": str(e)
        }

    return {
        "status": "resolved",
        "customer_name": customer_name,
        "original_complaint": complaint,
        "masked_complaint": masked_complaint,
        "pii_registry": registry,
        "classification": classification,
        "rag_context_used": context,
        "agent_response": result["response"],
        "domain": domain
    }