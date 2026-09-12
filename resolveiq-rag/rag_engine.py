import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

load_dotenv()

_embedding_model = None

# Lazy load embedding model to avoid blocking server port binding
def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("🧠 Loading SentenceTransformer embeddings (all-MiniLM-L6-v2)...")
        _embedding_model = SentenceTransformerEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )
    return _embedding_model

DOMAIN_FILES = {
    "upi":          "knowledge_base/upi.txt",
    "credit_debit": "knowledge_base/credit_debit.txt",
    "netbanking":   "knowledge_base/netbanking.txt",
    "kyc":          "knowledge_base/kyc.txt",
    "loans":        "knowledge_base/loans.txt"
}

# Build one ChromaDB collection per domain
def build_vector_stores():
    stores = {}
    model = get_embedding_model()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=50
    )
    for domain, filepath in DOMAIN_FILES.items():
        if not os.path.exists(filepath):
            continue
        loader = TextLoader(filepath)
        docs = loader.load()
        chunks = splitter.split_documents(docs)
        store = Chroma.from_documents(
            documents=chunks,
            embedding=model,
            collection_name=f"resolveiq_{domain}",
            persist_directory=f"./chroma_db/{domain}"
        )
        stores[domain] = store
        print(f"✅ Built RAG store for: {domain}")
    return stores

# Load existing vector stores
def load_vector_stores():
    stores = {}
    model = get_embedding_model()
    for domain in DOMAIN_FILES.keys():
        store = Chroma(
            collection_name=f"resolveiq_{domain}",
            embedding_function=model,
            persist_directory=f"./chroma_db/{domain}"
        )
        stores[domain] = store
    return stores

# Retrieve top K relevant chunks for a query with fallback to raw file
def retrieve_context(stores, domain, query, k=3):
    if stores and domain in stores:
        try:
            results = stores[domain].similarity_search(query, k=k)
            return "\n\n".join([doc.page_content for doc in results])
        except Exception as e:
            print(f"⚠️ Vector search error: {e}")

    # Graceful fallback: Read domain knowledge file directly
    filepath = DOMAIN_FILES.get(domain)
    if filepath and os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                return f.read()
        except Exception:
            pass

    return "Standard RBI banking turnaround timelines and resolution guidelines apply."