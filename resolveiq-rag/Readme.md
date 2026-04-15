Go to your project folder: cd Desktop\my-project

Create virtual environment: python -m venv venv
Activate virtual environment: venv\Scripts\activate
Upgrade pip (important): python -m pip install --upgrade pip
Install packages: pip install langchain langchain-google-genai chromadb sentence-transformers python-dotenv google-generativeai
Verify installation: pip list

Create .env file (for your API key)
GEMINI_API_KEY=your_api_key_here

Run:
python main.py


🔄 ResolveIQ Pipeline (How it works)
📥 Input Complaint
User submits a complaint (e.g., UPI failure, card fraud).
🔐 PII Masking
Sensitive data (amounts, phone numbers, account details, names) is masked to ensure privacy.
🧠 AI Classification (Gemini) -> master_agent.py
The complaint is analyzed and classified into a domain (UPI, Cards, KYC, Loans, etc.) along with:
Severity
Sentiment
Priority
📊 Confidence Check
If AI confidence is low → complaint is escalated to human agent.
📚 RAG (Knowledge Retrieval)
Relevant banking guidelines and policies are fetched from domain-specific vector databases.
🤖 Domain-Specific Agent
The complaint + context is passed to a specialized AI agent (e.g., UPI agent, Card agent).
💬 AI Response Generation
Agent generates:
Root cause
Professional response
RBI-compliant resolution timeline (TAT)
✅ Final Output:
Structured response is returned to the user with full context and classification details.