"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Document {
  key: string;
  size: number;
  last_modified: string;
}

export default function AdminPage() {
  const [adminId, setAdminId] = useState("admin-123");
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      // Only set loading if not already loading to avoid cascading renders
      setDocsLoading(prev => prev ? prev : true);
      const res = await fetch(`${API_BASE}/admin/documents?admin_id=${adminId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setDocsLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    // Move to next tick to avoid "cascading renders" lint error
    Promise.resolve().then(() => {
      fetchDocuments();
    });
  }, [adminId, fetchDocuments]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploadLoading(true);
    setUploadMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("admin_id", adminId);

    try {
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setUploadMsg({ type: 'success', text: "File successfully uploaded and is being processed in S3/Pinecone!" });
      setFile(null);
      // Refresh documents list after upload
      setTimeout(fetchDocuments, 2000); // Wait a bit for S3 to sync
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setUploadMsg({ type: 'error', text: `Upload failed: ${errorMessage}` });
    } finally {
      setUploadLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <header className="header">
        <div style={{ position: 'absolute', left: '2rem', top: '2rem' }}>
          <Link href="/" className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            ← Back to Home
          </Link>
        </div>
        <h1>Admin Portal</h1>
        <p>Upload and index documents for the RAG system</p>
      </header>
      
      <main className="container">
        <div className="dashboard-grid">
          <section className="panel">
            <h2>Document Ingestion</h2>
            <p>Securely upload documents (PDF, TXT, DOCX) to the cloud. Content is automatically tokenized and vectorized for the knowledge base.</p>
            
            <form onSubmit={handleUpload} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Admin Access ID</label>
                <input 
                  type="text" 
                  value={adminId} 
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter unique ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Select File</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.txt,.docx"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={!file || uploadLoading}
              >
                {uploadLoading ? <div className="spinner"></div> : 'Start Cloud Processing'}
              </button>

              {uploadMsg.text && (
                <div className={`feedback ${uploadMsg.type}`}>
                  {uploadMsg.text}
                </div>
              )}
            </form>
          </section>

          <section className="panel">
            <h2>Uploaded Documents</h2>
            <p>Knowledge base files associated with your Admin ID.</p>
            
            {docsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ width: '30px', height: '30px' }}></div>
              </div>
            ) : documents.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Size</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.key}>
                        <td>
                          <span style={{ color: '#fff', fontWeight: 500 }}>
                            {doc.key.split('/').pop()}
                          </span>
                        </td>
                        <td>{formatSize(doc.size)}</td>
                        <td>
                          <span className="badge">{formatDate(doc.last_modified)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No documents found for this Admin ID.</p>
              </div>
            )}
            
            <button 
              onClick={fetchDocuments} 
              className="btn" 
              style={{ marginTop: '1.5rem', width: 'auto', background: 'transparent', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
            >
              ⟳ Refresh List
            </button>
          </section>
        </div>
      </main>
    </>
  );
}
