from dotenv import load_dotenv
from rag_engine import build_vector_stores, load_vector_stores
from master_agent import process_complaint
import os

load_dotenv()

def main():
    # First time — build vector stores
    # After first run — comment this out and use load_vector_stores()
    print("🔨 Building RAG vector stores...")
    stores = build_vector_stores()
    # stores = load_vector_stores()  # Use this after first run

    # Test complaints
    test_complaints = [
        {
            "name": "Rajesh Kumar",
            "complaint": "I made a UPI payment of ₹15000 to Suresh Mehta but money was debited and not received. Transaction ID TXN9834521. Please help urgently."
        },
        {
            "name": "Priya Sharma",
            "complaint": "My credit card was charged ₹8500 for a transaction I never made. I want to raise a chargeback immediately."
        },
        {
            "name": "Amit Patel",
            "complaint": "My net banking login is blocked after 3 failed attempts. I need urgent access to transfer funds for my business."
        },
        {
            "name": "Meena Nair",
            "complaint": "My KYC was rejected even though I submitted all documents. My account has been frozen for 10 days."
        },
        {
            "name": "Vikram Singh",
            "complaint": "My home loan EMI of ₹25000 was deducted twice this month. I need immediate reversal and explanation."
        }
    ]

    for tc in test_complaints:
        result = process_complaint(
            complaint=tc["complaint"],
            customer_name=tc["name"],
            vector_stores=stores
        )
        print(f"\n{'='*50}")
        print(f"👤 Customer: {result['customer_name']}")
        print(f"🏷️  Domain: {result['domain']}")
        print(f"📊 Severity: {result['classification']['severity']}")
        print(f"😠 Sentiment: {result['classification']['sentiment']}")
        print(f"\n💬 AI RESPONSE:\n{result['agent_response']}")
        print(f"{'='*50}\n")

if __name__ == "__main__":
    main()