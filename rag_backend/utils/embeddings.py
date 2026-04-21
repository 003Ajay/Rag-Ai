import os
import sys

# Add the project root to the Python path so 'src.embedding' can be found
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import numpy as np
from src.embedding import EmbeddingPipeline

# Initialize the custom pipeline from src/embedding.py
emb_pipeline = EmbeddingPipeline()

def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generates embeddings using the custom embedding pipeline."""
    if not texts:
        return []
    try:
        # The EmbeddingPipeline has a model attribute from SentenceTransformers
        embeddings = emb_pipeline.model.encode(texts, show_progress_bar=False)
        return embeddings.tolist()
    except Exception as e:
        print(f"Error generating custom embeddings: {e}")
        return []

def generate_embedding(text: str) -> list[float]:
    """Generate embedding for a single query."""
    embeddings = generate_embeddings([text])
    if embeddings:
        return embeddings[0]
    return []
