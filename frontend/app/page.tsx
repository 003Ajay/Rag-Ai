"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const router = useRouter();
  
  // Admin Login State
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Employee Login State
  const [empUser, setEmpUser] = useState("");
  const [empPass, setEmpPass] = useState("");
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState("");

  const handleLogin = async (e: React.FormEvent, role: 'admin' | 'employee') => {
    e.preventDefault();
    const username = role === 'admin' ? adminUser : empUser;
    const password = role === 'admin' ? adminPass : empPass;
    const setLoading = role === 'admin' ? setAdminLoading : setEmpLoading;
    const setError = role === 'admin' ? setAdminError : setEmpError;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Login failed");
      }

      const data = await res.json();
      // Store mock session
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", username);
      
      // Redirect to the appropriate portal
      router.push(data.redirect);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="header">
        <h1>Enterprise RAG Core</h1>
        <p>Intelligent Knowledge Management System</p>
      </header>
      
      <main className="container">
        <div className="dashboard-grid">
          
          {/* Admin Login Panel */}
          <section className="panel">
            <h2>Admin Login</h2>
            <p>Access document management and indexing controls.</p>
            
            <form onSubmit={(e) => handleLogin(e, 'admin')} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={adminUser} 
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={adminPass} 
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn btn-success" disabled={adminLoading}>
                {adminLoading ? <div className="spinner"></div> : 'Login as Admin'}
              </button>

              {adminError && <div className="feedback error">{adminError}</div>}
              
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Demo hint: admin / admin123
              </div>
            </form>
          </section>

          {/* Employee Login Panel */}
          <section className="panel">
            <h2>Employee Login</h2>
            <p>Access the internal knowledge base and AI assistant.</p>
            
            <form onSubmit={(e) => handleLogin(e, 'employee')} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={empUser} 
                  onChange={(e) => setEmpUser(e.target.value)}
                  placeholder="employee"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={empPass} 
                  onChange={(e) => setEmpPass(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn" disabled={empLoading}>
                {empLoading ? <div className="spinner"></div> : 'Login as Employee'}
              </button>

              {empError && <div className="feedback error">{empError}</div>}

              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Demo hint: employee / user123
              </div>
            </form>
          </section>

        </div>
      </main>
    </>
  );
}