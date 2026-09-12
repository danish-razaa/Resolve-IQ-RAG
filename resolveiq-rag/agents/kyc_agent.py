import os

def generate_response(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return (
            "1. Root Cause: Document re-verification queue / periodic KYC update backlog.\n"
            "2. Dear Customer, We have received your KYC verification request. Your documents are undergoing expedited verification.\n"
            "3. Resolution TAT: Account freeze will be lifted within 7 working days following successful submission as per RBI directives."
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
        print(f"⚠️ KYC Agent LLM fallback: {e}")
        return (
            "1. Root Cause: KYC verification in progress.\n"
            "2. Dear Customer, We have prioritized your KYC document review.\n"
            "3. Resolution TAT: Freeze lifted within 7 working days as per RBI guidelines."
        )

SYSTEM_PROMPT = """You are a specialized KYC and Account complaint resolution agent 
for an Indian bank. You handle issues like KYC pending, account freeze, document verification, 
account activation, and profile updates.

Use the provided knowledge base context to give accurate, policy-compliant responses. 
Always mention TAT (resolution time) as per RBI guidelines.

Be empathetic, professional and concise.

If the complaint is not related to KYC or account services, say: 
'This complaint does not fall under KYC/Account domain.'"""

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
        "domain": "KYC & Account",
        "agent": "KYC Agent",
        "response": response_text
    }