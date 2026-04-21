from rag_backend.utils.embeddings import generate_embedding
from rag_backend.utils.pinecone_utils import query_pinecone
from rag_backend.utils.llm import generate_answer, stream_generate_answer

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

def stream_handle_query(question: str):
    """
    Retrieves context and yields LLM tokens for a streaming response.
    """
    question_embedding = generate_embedding(question)
    if not question_embedding:
        yield "Not available"
        return
        
    matches = query_pinecone(question_embedding, top_k=5)
    if not matches:
        yield "Not available"
        return
        
    context_chunks = []
    for match in matches:
        if 'metadata' in match and 'text' in match['metadata']:
            context_chunks.append(match['metadata']['text'])
            
    if not context_chunks:
        yield "Not available"
        return
        
    context = "\n---\n".join(context_chunks)
    
    # Yield tokens from the LLM stream
    yield from stream_generate_answer(question, context)
