from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_response(prompt):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text

SYSTEM_PROMPT = """You are a specialized Net Banking complaint resolution agent 
for an Indian bank. You handle issues like login failures, password reset issues, 
transaction failures, downtime, and fund transfer issues.

Use the provided knowledge base context to give accurate, policy-compliant responses. 
Always mention TAT (resolution time) as per RBI guidelines.

Be empathetic, professional and concise.

If the complaint is not related to Net Banking, say: 
'This complaint does not fall under Net Banking domain.'"""

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
        "domain": "Net Banking",
        "agent": "Net Banking Agent",
        "response": response_text
    }