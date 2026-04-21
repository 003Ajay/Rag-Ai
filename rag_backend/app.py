from dotenv import load_dotenv
load_dotenv()  # Load environment variables first

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_backend.services.upload_service import handle_upload, list_documents
from rag_backend.services.query_service import handle_query

app = FastAPI(title="Enterprise RAG System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str # 'admin' or 'employee'

@app.post("/auth/login")
async def login(request: LoginRequest):
    # Mock authentication logic
    # In production, this would check a database and return a JWT
    if request.role == "admin":
        if request.username == "admin" and request.password == "admin123":
            return {"message": "Login successful", "role": "admin", "redirect": "/admin"}
        else:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
    elif request.role == "employee":
        if request.username == "employee" and request.password == "user123":
            return {"message": "Login successful", "role": "employee", "redirect": "/employee"}
        else:
            raise HTTPException(status_code=401, detail="Invalid employee credentials")
    
    raise HTTPException(status_code=400, detail="Invalid role specified")

@app.post("/admin/upload")
async def admin_upload(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    admin_id: str = Form(...)
):
    """
    Admin endpoint to upload a document.
    File is stored in S3 and processed in the background.
    """
    if not file.filename.lower().endswith(('.pdf', '.txt', '.docx')):
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: PDF, TXT, DOCX")
        
    try:
        # Pass the file file object to the upload service
        # handle_upload triggers direct S3 upload and background processing
        handle_upload(admin_id, file.file, file.filename, background_tasks)
        return {"message": "File uploaded successfully and is being processed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/documents")
async def get_admin_documents(admin_id: str = None):
    """
    Endpoint for admin to see their uploaded documents.
    """
    try:
        docs = list_documents(admin_id)
        return {"documents": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/employee/query")
async def employee_query(request: QueryRequest):
    """
    Employee endpoint to query the RAG system.
    """
    try:
        answer = handle_query(request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
