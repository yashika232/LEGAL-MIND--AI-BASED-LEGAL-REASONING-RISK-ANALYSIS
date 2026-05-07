import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
    borderRadius: '12px', border: '1.5px solid var(--border)',
    background: 'white', fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.95rem', color: 'var(--text-dark)',
    outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--cream)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        background: 'linear-gradient(135deg, rgba(197,184,232,0.3), rgba(244,197,197,0.2))',
        top: '-100px', right: '-100px', animation: 'blob 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 250, height: 250, borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
        background: 'linear-gradient(135deg, rgba(184,216,204,0.3), rgba(184,212,232,0.2))',
        bottom: '50px', left: '-80px', animation: 'blob 10s ease-in-out infinite reverse',
      }} />

      {/* Left panel - hidden on small screens */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem',
        background: 'linear-gradient(135deg, var(--lavender) 0%, var(--blush) 100%)',
        position: 'relative', overflow: 'hidden',
      }} className="auth-left">
        <button onClick={() => navigate('/')} style={{
          position: 'absolute', top: '2rem', left: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'transparent', border: 'none', color: 'var(--text-mid)',
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
        }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={22} color="white" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-dark)' }}>LexAI</span>
        </div>
        <h2 style={{ fontSize: '2.2rem', color: 'var(--text-dark)', marginBottom: '1rem', maxWidth: 300 }}>
          Legal intelligence, amplified.
        </h2>
        <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: 320 }}>
          Analyze case documents, discover precedents from Indian courts, and chat with your legal files — all powered by local AI.
        </p>

        {/* Floating mini card */}
        <div style={{
          marginTop: '3rem', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)',
          borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 32px rgba(155,135,212,0.12)', maxWidth: 260,
          animation: 'float 7s ease-in-out infinite',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.75rem', fontWeight: 500 }}>Case Analysis Complete</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Evidence ✓', 'Risk 68%', 'IPC §302'].map((t, i) => (
              <span key={i} style={{ padding: '0.25rem 0.6rem', borderRadius: '99px', background: 'var(--lavender)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'scaleIn 0.4s ease forwards' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '0.4rem' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            {isLogin ? "Sign in to your LexAI workspace" : "Start your free legal AI journey"}
          </p>

          {error && (
            <div style={{ background: '#fde8e8', border: '1px solid #f4c5c5', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#c44', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="email" placeholder="Email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handle()}
                style={{ ...inputStyle, paddingRight: '3rem' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)',
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button onClick={handle} disabled={loading} style={{
              padding: '0.85rem', borderRadius: '12px', border: 'none',
              background: loading ? 'var(--violet)' : 'var(--primary)',
              color: 'white', fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(155,135,212,0.35)',
              transition: 'all 0.2s', marginTop: '0.5rem',
            }}>
              {loading ? 'Please wait…' : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} style={{
              background: 'none', border: 'none', color: 'var(--primary)',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
            }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
