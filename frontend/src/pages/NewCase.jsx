import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, X, Scale, FileText, CheckCircle, Loader } from 'lucide-react';
import API from '../utils/api';

const CASE_TYPES = [
  { value: 'criminal', label: 'Criminal', emoji: '⚖️', desc: 'IPC, CrPC, NDPS, cybercrime' },
  { value: 'civil', label: 'Civil', emoji: '📋', desc: 'Contracts, torts, damages' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧', desc: 'Divorce, custody, maintenance' },
  { value: 'corporate', label: 'Corporate', emoji: '🏢', desc: 'Company law, SEBI, M&A' },
  { value: 'property', label: 'Property', emoji: '🏠', desc: 'Land, title disputes, acquisition' },
];

const STEPS = ['Case Type', 'Details', 'Documents', 'Review'];

const Pill = ({ active, done, children, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.4rem 1rem', borderRadius: '99px',
    background: done ? 'var(--mint)' : active ? 'var(--lavender)' : 'var(--cream)',
    border: `1.5px solid ${done ? 'var(--sage)' : active ? 'var(--primary)' : 'var(--border)'}`,
    color: done ? '#2d7a58' : active ? 'var(--primary)' : 'var(--text-light)',
    fontSize: '0.82rem', fontWeight: 600, cursor: done ? 'pointer' : 'default',
    transition: 'all 0.2s',
  }}>
    {done ? <CheckCircle size={13} /> : null}
    {children}
  </div>
);

export default function NewCase() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ case_type: '', title: '', description: '', parties: '', court: '' });
  const [files, setFiles] = useState([]);
  const [caseId, setCaseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState('');
  const [done, setDone] = useState(false);

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files);
    setFiles(prev => [...prev, ...picked]);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const createAndUpload = async () => {
    setLoading(true);
    try {
      // Step 1: Create case
      const r = await API.post('/cases', form);
      const newCaseId = r.data.id;
      setCaseId(newCaseId);

      // Step 2: Upload files
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach(f => fd.append('documents', f));
        await API.post(`/cases/${newCaseId}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!caseId) return;
    setLoading(true);
    setAnalyzeStatus('Ingesting documents…');
    try {
      setTimeout(() => setAnalyzeStatus('Training RAG on your documents…'), 1200);
      setTimeout(() => setAnalyzeStatus('Running LLaMA-3 analysis…'), 3000);
      setTimeout(() => setAnalyzeStatus('Fetching Indian Kanoon precedents…'), 5000);
      await API.post(`/cases/${caseId}/analyze`);
      setAnalyzeStatus('Analysis complete!');
      setDone(true);
    } catch (e) {
      setAnalyzeStatus('Analysis failed — please retry.');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { fontSize: '0.85rem', color: 'var(--text-mid)', fontWeight: 500, marginBottom: '0.4rem', display: 'block' };
  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
    border: '1.5px solid var(--border)', background: 'white',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', color: 'var(--text-dark)',
    outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none',
          color: 'var(--text-mid)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
        }}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale size={18} color="var(--primary)" />
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--text-dark)' }}>New Case</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {STEPS.map((s, i) => (
            <Pill key={i} active={step === i} done={step > i}>{s}</Pill>
          ))}
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 640, animation: 'scaleIn 0.35s ease forwards' }}>

          {/* STEP 0: Case type */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>What type of case is this?</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.95rem' }}>This helps LexAI calibrate risk factors and search relevant statutes.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {CASE_TYPES.map(ct => (
                  <div key={ct.value} onClick={() => setForm({ ...form, case_type: ct.value })} style={{
                    padding: '1.25rem', borderRadius: '16px', border: `2px solid ${form.case_type === ct.value ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.case_type === ct.value ? 'var(--lavender)' : 'white',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { if (form.case_type !== ct.value) e.currentTarget.style.borderColor = 'var(--violet)'; }}
                    onMouseLeave={e => { if (form.case_type !== ct.value) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{ct.emoji}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.2rem' }}>{ct.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{ct.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => form.case_type && setStep(1)} disabled={!form.case_type} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.8rem 2rem', borderRadius: '12px', border: 'none',
                background: form.case_type ? 'var(--primary)' : 'var(--border)',
                color: form.case_type ? 'white' : 'var(--text-light)',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                cursor: form.case_type ? 'pointer' : 'not-allowed',
              }}>
                Continue <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Case details</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.95rem' }}>Tell us about the case so AI can provide better analysis.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div>
                  <label style={labelStyle}>Case title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. State vs. Sharma — IPC §420" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Parties involved</label>
                  <input value={form.parties} onChange={e => setForm({ ...form, parties: e.target.value })} placeholder="Petitioner vs. Respondent" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Court / Jurisdiction</label>
                  <input value={form.court} onChange={e => setForm({ ...form, court: e.target.value })} placeholder="Delhi High Court, District Court Varanasi…" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Brief description *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the key facts, allegations, and context…"
                    rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(0)} style={{
                  padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1.5px solid var(--border)',
                  background: 'white', color: 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500, cursor: 'pointer',
                }}>
                  Back
                </button>
                <button onClick={() => form.title && setStep(2)} disabled={!form.title} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.8rem 2rem', borderRadius: '12px', border: 'none',
                  background: form.title ? 'var(--primary)' : 'var(--border)',
                  color: form.title ? 'white' : 'var(--text-light)',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: form.title ? 'pointer' : 'not-allowed',
                }}>
                  Continue <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Documents */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Upload documents</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.95rem' }}>LexAI will ingest these into a RAG system for deep Q&A. PDFs preferred.</p>

              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '2.5rem', borderRadius: '16px', border: '2px dashed var(--violet)',
                background: 'var(--lavender)', cursor: 'pointer', marginBottom: '1.25rem',
                transition: 'all 0.2s',
              }}>
                <input type="file" multiple accept=".pdf,.txt,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                <Upload size={32} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Drop files or click to upload</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>PDF, TXT, DOCX supported</div>
              </label>

              {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  {files.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '10px', background: 'white',
                      border: '1px solid var(--border)',
                    }}>
                      <FileText size={18} color="var(--primary)" />
                      <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-dark)' }}>{f.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(1)} style={{
                  padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1.5px solid var(--border)',
                  background: 'white', color: 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500, cursor: 'pointer',
                }}>Back</button>
                <button onClick={createAndUpload} disabled={loading} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.8rem 2rem', borderRadius: '12px', border: 'none',
                  background: 'var(--primary)', color: 'white',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</> : <>Save & Continue <ArrowRight size={17} /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Analyze */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              {!done ? (
                <>
                  <div style={{ width: 72, height: 72, borderRadius: '20px', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Scale size={32} color="var(--primary)" />
                  </div>
                  <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Ready to analyze</h2>
                  <p style={{ color: 'var(--text-light)', marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem' }}>
                    LexAI will ingest your documents into RAG, run LLaMA-3 legal analysis, and scrape Indian Kanoon for similar judgements.
                  </p>

                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border)', marginBottom: '2rem', textAlign: 'left' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[
                        ['Type', form.case_type], ['Title', form.title],
                        ['Documents', `${files.length} file(s)`], ['Court', form.court || '—'],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.1rem' }}>{k}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500, textTransform: 'capitalize' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {loading && (
                    <div style={{ background: 'var(--lavender)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Loader size={18} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                      <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem' }}>{analyzeStatus}</span>
                    </div>
                  )}

                  <button onClick={runAnalysis} disabled={loading} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto',
                    padding: '0.9rem 2.5rem', borderRadius: '12px', border: 'none',
                    background: loading ? 'var(--violet)' : 'var(--primary)',
                    color: 'white', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(155,135,212,0.3)',
                  }}>
                    {loading ? 'Analyzing…' : '🧠 Run AI Analysis'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                  <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Analysis complete!</h2>
                  <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Your case has been analyzed. View insights, precedents and start chatting.</p>
                  <button onClick={() => navigate(`/case/${caseId}`)} style={{
                    padding: '0.9rem 2.5rem', borderRadius: '12px', border: 'none',
                    background: 'var(--primary)', color: 'white',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '1rem',
                    cursor: 'pointer', boxShadow: '0 4px 20px rgba(155,135,212,0.3)',
                  }}>
                    View Case →
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
