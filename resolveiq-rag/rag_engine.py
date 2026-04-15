import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

load_dotenv()

# Embedding model (free, runs locally)
embedding_model = SentenceTransformerEmbeddings(
    model_name="all-MiniLM-L6-v2"
)

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
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=50
    )
    for domain, filepath in DOMAIN_FILES.items():
        loader = TextLoader(filepath)
        docs = loader.load()
        chunks = splitter.split_documents(docs)
        store = Chroma.from_documents(
            documents=chunks,
            embedding=embedding_model,
            collection_name=f"resolveiq_{domain}",
            persist_directory=f"./chroma_db/{domain}"
        )
        stores[domain] = store
        print(f"✅ Built RAG store for: {domain}")
    return stores

# Load existing vector stores
def load_vector_stores():
    stores = {}
    for domain in DOMAIN_FILES.keys():
        store = Chroma(
            collection_name=f"resolveiq_{domain}",
            embedding_function=embedding_model,
            persist_directory=f"./chroma_db/{domain}"
        )
        stores[domain] = store
    return stores

# Retrieve top K relevant chunks for a query
def retrieve_context(stores, domain, query, k=3):
    if domain not in stores:
        return "No knowledge base found for this domain."
    results = stores[domain].similarity_search(query, k=k)
    context = "\n\n".join([doc.page_content for doc in results])
    return context