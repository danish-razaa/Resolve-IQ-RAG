import os

def generate_response(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return (
            "1. Root Cause: Duplicate merchant charge / POS terminal communication delay.\n"
            "2. Dear Customer, We have initiated a chargeback investigation for your card. A temporary credit has been requested.\n"
            "3. Resolution TAT: Dispute resolution within 7–12 working days under RBI Card Services guidelines."
        )
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text if hasattr(response, "text") else str(response)
    except Exception as e:
        print(f"⚠️ Card Agent LLM fallback: {e}")
        return (
            "1. Root Cause: Card transaction discrepancy under review.\n"
            "2. Dear Customer, Your dispute has been registered and assigned to the fraud & chargeback department.\n"
            "3. Resolution TAT: Resolved within 7–12 working days as per RBI guidelines."
        )

SYSTEM_PROMPT = """You are a specialized Credit Card and Debit Card complaint resolution agent 
for an Indian bank. You handle issues like failed transactions, unauthorized charges, card blocking, 
refund delays, ATM issues, and card-related disputes.

Use the provided knowledge base context to give accurate, policy-compliant responses. 
Always mention TAT (resolution time) as per RBI guidelines.

Be empathetic, professional and concise.

If the complaint is not related to Credit/Debit cards, say: 
'This complaint does not fall under Card services domain.'"""

def run(complaint: str, context: str, customer_name: str) -> dict:
    prompt = f"""
{SYSTEM_PROMPT}

KNOWLEDGE BASE CONTEXT:
{context}

CUSTOMER NAME: {customer_name}
COMPLAINT: {complaint}

Respond with:
1. A brief root cause analysis (1 line)
2. A formal reply to the customer addressing their specific issue
3. Resolution timeline as per RBI guidelines
"""
    response_text = generate_response(prompt)
    return {
        "domain": "Cards",
        "agent": "Card Services Agent",
        "response": response_text
    }