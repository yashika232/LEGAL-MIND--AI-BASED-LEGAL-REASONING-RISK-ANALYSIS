import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, FileText, Brain, Shield, ChevronRight, Sparkles, BookOpen, Gavel } from 'lucide-react';

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'LLaMA-3 locally processes your case documents with deep legal understanding', color: '#c5b8e8' },
  { icon: Shield, title: 'Risk Scoring', desc: 'Multi-factor risk probability engine evaluates your case strength instantly', color: '#f4c5c5' },
  { icon: BookOpen, title: 'Precedent Mining', desc: 'Automatically surfaces relevant Indian court judgements and case law', color: '#b8d8cc' },
  { icon: Gavel, title: 'RAG Chat', desc: 'Ask questions directly against your uploaded documents with source citations', color: '#b8d4e8' },
];

const STATS = [
  { value: '50K+', label: 'Cases Analyzed' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '2min', label: 'Avg Analysis Time' },
  { value: '15+', label: 'Case Categories' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrollY > 40 ? 'rgba(250,248,245,0.92)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-dark)' }}>LexAI</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '0.5rem 1.2rem', borderRadius: '99px', border: '1.5px solid var(--primary)',
            background: 'transparent', color: 'var(--primary)', fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = 'var(--lavender)'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; }}
          >
            Log in
          </button>
          <button onClick={() => navigate('/register')} style={{
            padding: '0.5rem 1.2rem', borderRadius: '99px', border: 'none',
            background: 'var(--primary)', color: 'white', fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = 'var(--primary-dark)'; }}
            onMouseLeave={e => { e.target.style.background = 'var(--primary)'; }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Blobs */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'linear-gradient(135deg, rgba(197,184,232,0.4), rgba(244,197,197,0.3))',
          top: '-100px', right: '-150px', animation: 'blob 8s ease-in-out infinite', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', width: 350, height: 350, borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
          background: 'linear-gradient(135deg, rgba(184,216,204,0.35), rgba(184,212,232,0.3))',
          bottom: '50px', left: '-100px', animation: 'blob 10s ease-in-out infinite reverse', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(155,135,212,0.12)', top: '200px', left: '60px',
          animation: 'float 6s ease-in-out infinite',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 760, padding: '0 1.5rem', animation: 'fadeUp 0.8s ease forwards' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem',
            background: 'rgba(155,135,212,0.12)', borderRadius: '99px', marginBottom: '1.5rem',
            border: '1px solid rgba(155,135,212,0.25)', animation: 'fadeUp 0.5s ease forwards',
          }}>
            <Sparkles size={14} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>Powered by LLaMA-3 · Built for Indian Law</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.2rem',
            color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif', fontWeight: 700,
          }}>
            Your AI Legal<br />
            <span style={{ color: 'var(--primary)' }}>Co-counsel</span> is here
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
            Upload case documents, get instant risk analysis, discover relevant precedents from Indian courts, and chat with your documents — all powered by local AI.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.9rem 2rem', borderRadius: '99px', border: 'none',
              background: 'var(--primary)', color: 'white',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '1rem',
              cursor: 'pointer', boxShadow: '0 8px 32px rgba(155,135,212,0.4)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(155,135,212,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(155,135,212,0.4)'; }}
            >
              Start for free <ChevronRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.9rem 2rem', borderRadius: '99px',
              border: '1.5px solid var(--border)',
              background: 'rgba(255,255,255,0.7)', color: 'var(--text-mid)',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '1rem',
              cursor: 'pointer', backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Floating cards */}
        <div style={{
          position: 'absolute', bottom: 80, right: '10%', background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: '16px', padding: '1rem 1.25rem',
          boxShadow: '0 8px 32px rgba(155,135,212,0.15)',
          animation: 'float 7s ease-in-out infinite',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="var(--sage)" style={{ color: '#5da888' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: 2 }}>Risk Score</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>72 / 100</div>
          </div>
        </div>

        <div style={{
          position: 'absolute', top: 160, left: '8%', background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: '16px', padding: '1rem 1.25rem',
          boxShadow: '0 8px 32px rgba(155,135,212,0.15)',
          animation: 'float 9s ease-in-out infinite 2s',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: 2 }}>Documents Analyzed</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>3 PDFs ✓</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '4rem 2rem', background: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ animation: `fadeUp 0.6s ease ${i * 0.1}s forwards`, opacity: 0 }}>
              <div style={{ fontSize: '2.4rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>Everything you need</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '1.05rem' }}>From intake to verdict — LexAI walks with you through every stage</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: '20px', padding: '1.75rem',
                border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(155,135,212,0.06)',
                transition: 'all 0.3s ease', cursor: 'default',
                animation: `fadeUp 0.6s ease ${0.1 + i * 0.1}s forwards`, opacity: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(155,135,212,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(155,135,212,0.06)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '14px', background: f.color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <f.icon size={22} color={f.color === '#c5b8e8' ? 'var(--primary)' : f.color === '#f4c5c5' ? '#d46b6b' : f.color === '#b8d8cc' ? '#5da888' : '#5a91b5'} />
                </div>
                <h3 style={{ fontSize: '1rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', padding: '3rem', borderRadius: '28px',
          background: 'linear-gradient(135deg, var(--lavender), var(--blush))',
          border: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>Ready to try LexAI?</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: '2rem' }}>Join thousands of legal professionals using AI to work smarter.</p>
          <button onClick={() => navigate('/register')} style={{
            padding: '0.9rem 2.5rem', borderRadius: '99px', border: 'none',
            background: 'var(--primary)', color: 'white',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '1rem',
            cursor: 'pointer', boxShadow: '0 8px 32px rgba(155,135,212,0.4)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Create free account →
          </button>
        </div>
      </section>

      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-light)', fontSize: '0.875rem' }}>
        © 2024 LexAI · Built for Indian Legal Practice · Powered by LLaMA-3
      </footer>
    </div>
  );
}
