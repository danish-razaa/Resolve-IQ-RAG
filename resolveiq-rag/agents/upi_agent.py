import os

def generate_response(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return (
            "1. Root Cause: Inter-bank switch timeout during transaction clearing.\n"
            "2. Dear Customer, We apologize for the UPI transaction issue. An auto-reversal has been triggered to your linked bank account.\n"
            "3. Resolution TAT: Funds will be credited back within T+1 working day as per RBI guidelines."
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
        print(f"⚠️ UPI Agent LLM fallback: {e}")
        return (
            "1. Root Cause: UPI payment gateway processing delay.\n"
            "2. Dear Customer, Your UPI complaint has been logged and the reversal process is initiated.\n"
            "3. Resolution TAT: Auto-reversal within T+1 working day as per RBI directives."
        )

SYSTEM_PROMPT = """You are a specialized UPI complaint resolution agent 
for an Indian bank. You only handle UPI payment complaints.
Use the provided knowledge base context to give accurate, 
policy-compliant responses. Always mention TAT (resolution time).
Be empathetic, professional and concise. 
If the complaint is not related to UPI, say: 
'This complaint does not fall under UPI domain.'"""

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
        "domain": "UPI",
        "agent": "UPI Agent",
        "response": response_text
    }