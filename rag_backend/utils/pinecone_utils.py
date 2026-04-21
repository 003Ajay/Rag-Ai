import os
from pinecone import Pinecone

# Initialize Pinecone
try:
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY", "dummy-key"))
    index_name = os.getenv("PINECONE_INDEX_NAME", "enterprise-rag")
    index = pc.Index(index_name)
except Exception:
    index = None

def store_embeddings(vectors: list, namespace: str = ""):
    """
    Store embeddings in Pinecone.
    vectors: list of dicts: {"id": str, "values": list[float], "metadata": dict}
    """
    if index:
        index.upsert(vectors=vectors, namespace=namespace)
    else:
        print("Warning: Pinecone index not initialized. Embeddings not stored.")

def query_pinecone(embedding: list[float], top_k: int = 5, namespace: str = "") -> list[dict]:
    """
    Query pinecone using an embedding.
    Returns matching metadata and score.
    """
    if not index:
        print("Warning: Pinecone index not initialized.")
        return []
        
    response = index.query(
        namespace=namespace,
        vector=embedding,
        top_k=top_k,
        include_metadata=True
    )
    return response.get('matches', [])
