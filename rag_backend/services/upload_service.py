import uuid
from rag_backend.utils.s3_utils import upload_file_to_s3, get_file_stream_from_s3, list_files_in_s3
from rag_backend.utils.parser import extract_text_from_stream, split_into_chunks
from rag_backend.utils.embeddings import generate_embeddings
from rag_backend.utils.pinecone_utils import store_embeddings

def process_file_background(admin_id: str, file_name: str, object_name: str):
    """
    Background task to process file from S3 and store in Pinecone.
    """
    try:
        # Read from S3 stream
        file_stream = get_file_stream_from_s3(object_name)
        
        # Extract Text
        text = extract_text_from_stream(file_stream, file_name)
        
        # Split into chunks
        chunks = split_into_chunks(text, chunk_size=400)
        
        if not chunks:
            return
            
        # Batch Embeddings & Store in Pinecone
        batch_size = 100
        doc_id = str(uuid.uuid4())
        
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i+batch_size]
            embeddings = generate_embeddings(batch_chunks)
            
            if not embeddings:
                continue
                
            vectors = []
            for j, chunk in enumerate(batch_chunks):
                chunk_id = f"{doc_id}-{i+j}"
                vectors.append({
                    "id": chunk_id,
                    "values": embeddings[j],
                    "metadata": {
                        "text": chunk,
                        "file_name": file_name,
                        "admin_id": admin_id,
                        "doc_id": doc_id
                    }
                })
            
            store_embeddings(vectors)
            
    except Exception as e:
        print(f"Error processing document {object_name}: {str(e)}")

def handle_upload(admin_id: str, file_obj, file_name: str, background_tasks):
    """
    Handles file upload to S3 and triggers background processing.
    """
    object_name = f"{admin_id}/{file_name}"
    
    # 1. Upload directly to S3
    upload_file_to_s3(file_obj, object_name)
    
    # 2. Add background task for processing without holding the request
    background_tasks.add_task(process_file_background, admin_id, file_name, object_name)

def list_documents(admin_id: str = None):
    """
    Lists documents in S3, optionally filtered by admin_id.
    """
    prefix = f"{admin_id}/" if admin_id else ""
    return list_files_in_s3(prefix)
