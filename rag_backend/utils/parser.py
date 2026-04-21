import re
import fitz  # PyMuPDF

def extract_text_from_stream(file_stream, filename: str) -> str:
    """Extracts text from a file stream bytes based on extension."""
    if filename.lower().endswith('.pdf'):
        # For PDF, we load the stream into memory 
        file_bytes = file_stream.read()
        doc = fitz.open("pdf", file_bytes)
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        return text
    elif filename.lower().endswith('.txt'):
        return file_stream.read().decode('utf-8')
    elif filename.lower().endswith('.docx'):
        # Simplified placeholder for docx
        return "DOCX extraction placeholder\n"
    else:
        raise ValueError("Unsupported file format. Only PDF, TXT, and DOCX are supported.")

def split_into_chunks(text: str, chunk_size: int = 400) -> list[str]:
    """Splits text into meaningful chunks (sentence-like, roughly chunk_size characters)."""
    # Simple sentence-based chunking
    sentences = re.split(r'(?<=[.!?]) +', text.replace('\n', ' '))
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
        else:
            current_chunk += sentence + " "
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    return chunks
