"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function EmployeePage() {
  const [question, setQuestion] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [queryError, setQueryError] = useState("");

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setQueryLoading(true);
    setAnswer("");
    setQueryError("");

    try {
      const response = await fetch(`${API_BASE}/employee/stream-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the assistant.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Could not start stream reader.");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setAnswer((prev) => prev + chunk);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setQueryError(`Query failed: ${errorMessage}`);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="employee-bg">
      {/* Small logout link at the top right */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '2rem' }}>
        <Link href="/" style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '20px' }}>
          Logout
        </Link>
      </div>

      <main className="hero-section">
        {/* The Chat Window Core */}
        <div className="prompt-card">
          <div className="prompt-input-wrapper">
            <textarea 
               className="prompt-textarea"
               value={question}
               onChange={(e) => setQuestion(e.target.value)}
               placeholder="How can I help you today?"
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleQuery(e as any);
                 }
               }}
            />
            <button 
                className="send-btn-orange" 
                onClick={(e) => handleQuery(e as any)}
                disabled={queryLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Streaming Result Area */}
        {(answer || queryLoading || queryError) && (
          <div className="streaming-result" style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>
             <h3 style={{ fontSize: '0.8rem', color: '#f17b21', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                Assistant
             </h3>
             {queryError ? (
               <p style={{ color: '#f85149' }}>{queryError}</p>
             ) : (
               <div style={{ whiteSpace: 'pre-wrap' }}>
                 {answer}
                 {queryLoading && <span className="cursor"></span>}
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}
