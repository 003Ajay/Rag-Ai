"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const router = useRouter();
  
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", username);
      router.push(data.redirect);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        {/* Artistic Left Section */}
        <aside className="login-left">
          <div className="login-left-overlay"></div>
          <div className="role-tabs">
            <button 
              className={`role-tab ${role === 'employee' ? 'active' : ''}`}
              onClick={() => { setRole('employee'); setError(""); }}
            >
              Employees
            </button>
            <button 
              className={`role-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError(""); }}
            >
              Admin
            </button>
          </div>
        </aside>

        {/* Form Right Section */}
        <main className="login-right">
          <div className="login-header">
            <div className="user-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2>Login</h2>
          </div>

          <form onSubmit={handleLogin}>
            <div className={`login-input-group ${isFocused === 'user' ? 'focused' : ''} ${username ? 'has-value' : ''}`}>
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <label>Username / Email</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsFocused('user')}
                onBlur={() => setIsFocused(null)}
                required
              />
            </div>

            <div className={`login-input-group ${isFocused === 'pass' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused('pass')}
                onBlur={() => setIsFocused(null)}
                required
              />
            </div>

            <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>Forgot Password?</a>

            <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              {error && <span style={{ color: '#f85149', fontSize: '0.8rem' }}>{error}</span>}
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Validating...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Footer Social (Placeholders) */}
          <footer className="login-footer">
            <p>Or Login With</p>
            <div className="social-icons">
               <button className="social-btn" onClick={(e) => e.preventDefault()}>
                  <img src="https://www.google.com/favicon.ico" width="14" alt="G" /> Google
               </button>
               <button className="social-btn" onClick={(e) => e.preventDefault()}>
                  <img src="https://www.facebook.com/favicon.ico" width="14" alt="F" /> Facebook
               </button>
            </div>
          </footer>
        </main>

      </div>
    </div>
  );
}