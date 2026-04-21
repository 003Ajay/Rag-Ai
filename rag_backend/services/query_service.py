from rag_backend.utils.embeddings import generate_embedding
from rag_backend.utils.pinecone_utils import query_pinecone
from rag_backend.utils.llm import generate_answer

def handle_query(question: str) -> str:
    """
    Handles the employee query, retrieves context, and calls LLM.
    """
    # 1. Generate embedding for question
    question_embedding = generate_embedding(question)
    
    if not question_embedding:
        return "Not available"
        
    # 2. Query Pinecone
    matches = query_pinecone(question_embedding, top_k=5)
    
    if not matches:
        return "Not available"
        
    # 3. Combine retrieved chunks into context
    # Collect texts from metadata, making sure it doesn't leak paths or docs directly
    context_chunks = []
    for match in matches:
        if 'metadata' in match and 'text' in match['metadata']:
            context_chunks.append(match['metadata']['text'])
            
    if not context_chunks:
        print("DEBUG: No context chunks found.")
        return "Not available"
        
    context = "\n---\n".join(context_chunks)
    print("DEBUG: Extracted Context ->", context)
    
    # 4. Generate answer via LLM
    answer = generate_answer(question, context)
    print("DEBUG: LLM Answer ->", answer)
    return answer
