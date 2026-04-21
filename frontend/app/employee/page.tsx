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
      const res = await fetch(`${API_BASE}/employee/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setQueryError(`Query failed: ${errorMessage}`);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <>
      <header className="header">
        <div style={{ position: 'absolute', left: '2rem', top: '2rem' }}>
          <Link href="/" className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            ← Back to Home
          </Link>
        </div>
        <h1>Employee Portal</h1>
        <p>Query the company&apos;s internal knowledge base</p>
      </header>
      
      <main className="container">
        <section className="panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2>Ask the Assistant</h2>
          <p>Retrieve summarized answers from our collective expertise without needing to search through individual spreadsheets or PDFs.</p>

          <form onSubmit={handleQuery} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>What&apos;s on your mind?</label>
              <textarea 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g. What are our data retention policies for client projects?"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn" 
              disabled={!question.trim() || queryLoading}
            >
              {queryLoading ? <div className="spinner"></div> : 'Ask AI Assistant'}
            </button>

            {queryError && (
              <div className="feedback error">
                {queryError}
              </div>
            )}

            {answer && (
              <div className="result-box">
                <h3>Knowledge Base Response</h3>
                <p>{answer}</p>
              </div>
            )}
          </form>
        </section>
      </main>
    </>
  );
}
