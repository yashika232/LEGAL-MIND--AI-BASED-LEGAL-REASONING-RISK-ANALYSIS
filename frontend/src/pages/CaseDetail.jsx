import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import {
  ArrowLeft, Scale, MessageSquare, BookOpen, Gavel, FileText,
  AlertTriangle, TrendingUp, ExternalLink, Loader,
  CheckCircle, Clock, BarChart2, PenLine, ChevronDown,
  ChevronRight, Copy, Download, RefreshCw, Send, Sparkles,
  X, Info
} from 'lucide-react';
import API from '../utils/api';

const TABS = [
  { id: 'overview',   label: 'Overview',          icon: BarChart2 },
  { id: 'precedents', label: 'Precedents',         icon: BookOpen },
  { id: 'judgements', label: 'Similar Judgements', icon: Gavel },
  { id: 'chat',       label: 'AI Chat',            icon: MessageSquare },
  { id: 'draft',      label: 'Document Drafter',   icon: PenLine },
];

const riskColor = s => s >= 70 ? '#d46b6b' : s >= 40 ? '#c4922d' : '#5da888';
const riskLabel = s => s >= 70 ? 'High Risk' : s >= 40 ? 'Moderate' : 'Low Risk';

/* ─── Minimal markdown renderer ─────────────────────────────────────────── */
function RenderMarkdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^#{1,3} /.test(line)) {
      const level = line.match(/^(#{1,3})/)[1].length;
      const content = line.replace(/^#{1,3} /, '');
      const Tag = `h${level + 2}`;
      elements.push(
        <Tag key={i} style={{
          fontFamily: 'Playfair Display, serif',
          color: 'var(--text-dark)',
          margin: `${level === 1 ? '1.2rem' : '0.9rem'} 0 0.35rem`,
          fontSize: level === 1 ? '1.05rem' : '0.97rem',
          fontWeight: 600,
          borderBottom: level === 1 ? '1px solid var(--border)' : 'none',
          paddingBottom: level === 1 ? '0.3rem' : 0,
        }}>
          {inlineFormat(content)}
        </Tag>
      );
    } else if (/^[*\-] /.test(line)) {
      const bullets = [];
      while (i < lines.length && /^[*\-] /.test(lines[i])) {
        bullets.push(<li key={i} style={{ marginBottom: '0.25rem', lineHeight: 1.65, color: 'var(--text-mid)' }}>{inlineFormat(lines[i].replace(/^[*\-] /, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={{ paddingLeft: '1.4rem', margin: '0.4rem 0' }}>{bullets}</ul>);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i} style={{ marginBottom: '0.25rem', lineHeight: 1.65, color: 'var(--text-mid)' }}>{inlineFormat(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} style={{ paddingLeft: '1.4rem', margin: '0.4rem 0' }}>{items}</ol>);
      continue;
    } else if (line.trim() === '---' || line.trim() === '===') {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.75rem 0' }} />);
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '0.4rem' }} />);
    } else {
      elements.push(<p key={i} style={{ lineHeight: 1.7, color: 'var(--text-mid)', margin: '0.15rem 0', fontSize: '0.9rem' }}>{inlineFormat(line)}</p>);
    }
    i++;
  }
  return <div style={{ fontFamily: 'DM Sans, sans-serif' }}>{elements}</div>;
}

function inlineFormat(text) {
  if (!text) return text;
  const parts = [];
  const regex = /\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*/g;
  let last = 0, m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={m.index} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{m[1]}</strong>);
    else if (m[2]) parts.push(<code key={m.index} style={{ background: 'var(--lavender)', padding: '0.1em 0.35em', borderRadius: 4, fontSize: '0.85em', fontFamily: 'monospace', color: 'var(--primary-dark)' }}>{m[2]}</code>);
    else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/cases/${id}`).then(r => setCaseData(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <CenterLoader />;
  if (!caseData) return <CenterMsg>Case not found.</CenterMsg>;

  const riskFactors = caseData.risk_factors || [];
  const radarData = riskFactors.map(f => ({ subject: f.factor, value: f.score, fullMark: 100 }));
  const precedents = caseData.precedents || [];
  const judgements = caseData.similar_judgements || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <header style={{
        background: 'white', borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-mid)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <Scale size={18} color="var(--primary)" />
        <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: 'var(--text-dark)', fontSize: '1.05rem' }}>{caseData.title}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StatusBadge status={caseData.status} />
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Risk hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--lavender), var(--blush))',
          borderRadius: '24px', padding: '2rem', marginBottom: '2rem',
          border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <RiskGauge score={caseData.risk_score} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{caseData.case_type} case</div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '0.6rem' }}>{caseData.title}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{caseData.summary || caseData.description}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { icon: FileText, label: `${(caseData.documents || []).length} docs` },
                { icon: BookOpen, label: `${precedents.length} precedents` },
                { icon: Gavel, label: `${judgements.length} judgements` },
              ].map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.7rem', borderRadius: '99px', background: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', color: 'var(--text-mid)', fontWeight: 500 }}>
                  <item.icon size={12} /> {item.label}
                </span>
              ))}
            </div>
          </div>
          {riskFactors.length > 0 && (
            <div style={{ minWidth: 200 }}>
              {riskFactors.slice(0, 5).map((f, i) => (
                <div key={i} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-mid)', fontWeight: 500 }}>{f.factor}</span>
                    <span style={{ fontSize: '0.75rem', color: riskColor(f.score), fontWeight: 600 }}>{f.score}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: '99px', background: 'rgba(255,255,255,0.5)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '99px', background: riskColor(f.score), width: `${f.score}%`, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'white', borderRadius: '14px', padding: '0.35rem', border: '1px solid var(--border)', width: 'fit-content', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.1rem', borderRadius: '10px', border: 'none',
              background: activeTab === tab.id ? 'var(--lavender)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-mid)',
              fontFamily: 'DM Sans, sans-serif', fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', animation: 'fadeUp 0.4s ease forwards' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1rem' }}>Risk Factor Radar</h3>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-mid)' }} />
                    <Radar name="Risk" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyViz>Run analysis to see risk factors</EmptyViz>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1rem' }}>Case Summary</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '1rem' }}>{caseData.summary || 'Run analysis to generate AI summary.'}</p>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</div>
                {(caseData.documents || []).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No documents uploaded.</p>
                ) : (
                  (caseData.documents || []).map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--cream)' }}>
                      <FileText size={14} color="var(--primary)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{doc}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'precedents' && (
          <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
            {precedents.length === 0 ? (
              <EmptyState icon={BookOpen} title="No precedents found" desc="Run analysis to discover relevant case law and precedents." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {precedents.map((p, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'flex-start', animation: `fadeUp 0.4s ease ${i * 0.07}s forwards`, opacity: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={18} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                        <h4 style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{p.case}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: '1rem', flexShrink: 0 }}>{p.year}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', marginBottom: '0.5rem' }}>{p.relevance}</p>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500, background: p.outcome === 'Favorable' ? 'var(--mint)' : p.outcome === 'Mixed' ? 'var(--peach)' : 'var(--blush)', color: p.outcome === 'Favorable' ? '#2d7a58' : p.outcome === 'Mixed' ? '#8a6e2e' : '#c44' }}>{p.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'judgements' && (
          <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
            <div style={{ background: 'var(--lavender)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Gavel size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>Sourced from Indian Kanoon — India's premier legal database</span>
            </div>
            {judgements.length === 0 ? (
              <EmptyState icon={Gavel} title="No judgements found" desc="Run analysis to discover similar Indian court judgements." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {judgements.map((j, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid var(--border)', animation: `fadeUp 0.4s ease ${i * 0.07}s forwards`, opacity: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem', flex: 1 }}>{j.title}</h4>
                      {j.link && (
                        <a href={j.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '8px', background: 'var(--lavender)', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 500, textDecoration: 'none', flexShrink: 0, marginLeft: '1rem' }}>
                          View <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    {j.court && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>{j.court}</div>}
                    {j.snippet && <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>{j.snippet}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && <ChatTab caseId={id} ragReady={caseData.rag_ready} />}

        {activeTab === 'draft' && <DraftTab caseId={id} caseData={caseData} />}
      </div>
    </div>
  );
}

/* ─── Chat Tab ───────────────────────────────────────────────────────────── */
function ChatTab({ caseId, ragReady }) {
  const WELCOME = {
    role: 'assistant',
    content: ragReady
      ? "**Welcome to AI Legal Chat**\n\nI've analysed the case documents. I'll provide **structured, document-referenced answers** covering:\n\n- Relevant legal provisions & sections\n- Key facts from your documents\n- Risk assessment & strategic advice\n- Recommended next steps\n\nAsk me anything about this case."
      : "Documents haven't been analysed yet. Please run analysis first to enable document Q&A.",
    ephemeral: true,
  };

  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]       = useState('');
  const [streaming, setStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [clearing, setClearing]  = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const bottomRef = useRef(null);

  // Load persisted history on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/cases/${caseId}/chat/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map(m => ({ role: m.role, content: m.content, id: m.id })));
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [caseId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const clearHistory = async () => {
    setClearing(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/cases/${caseId}/chat/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([WELCOME]);
    } catch (e) { /* ignore */ }
    setClearing(false);
    setShowClearConfirm(false);
  };

  const send = async (q) => {
    const query = q || input.trim();
    if (!query || streaming) return;
    setInput('');
    setMessages(prev => {
      const filtered = prev.filter(m => !m.ephemeral);
      return [...filtered, { role: 'user', content: query }];
    });
    setStreaming(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/cases/${caseId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
        setMessages(prev => {
          const u = [...prev];
          u[u.length - 1] = { role: 'assistant', content: text };
          return u;
        });
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${e.message}` }]);
    } finally {
      setStreaming(false);
    }
  };

  const SUGGESTED = [
    'What are the key legal risks in this case?',
    'Which IPC / CrPC sections apply?',
    'Summarise the evidence and its strength',
    'What is the strongest legal argument?',
    'What documents are missing that we need?',
    'What is the likely outcome based on precedents?',
  ];

  const copyMsg = (content) => navigator.clipboard.writeText(content);
  const onlyWelcome = messages.length === 1 && messages[0].ephemeral;
  const hasHistory  = messages.length > 0 && !onlyWelcome;

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '72vh', animation: 'fadeUp 0.4s ease forwards', position: 'relative' }}>
      {/* Chat header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={16} color="var(--primary)" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>LexAI Document Assistant</div>
          <div style={{ fontSize: '0.75rem', color: ragReady ? '#5da888' : 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: ragReady ? '#5da888' : '#ccc', display: 'inline-block' }} />
            {ragReady
              ? historyLoaded
                ? hasHistory ? 'History loaded' : 'Document index ready'
                : 'Loading history…'
              : 'Awaiting analysis'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '0.3rem 0.75rem', borderRadius: '99px', background: 'var(--lavender)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>
            Gemini 2.5 Flash
          </div>
          {hasHistory && !showClearConfirm && (
            <button onClick={() => setShowClearConfirm(true)} title="Clear chat history" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-light)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
              <RefreshCw size={12} /> Clear
            </button>
          )}
          {showClearConfirm && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>Clear all history?</span>
              <button onClick={clearHistory} disabled={clearing} style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', border: 'none', background: '#d46b6b', color: 'white', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                {clearing ? '…' : 'Yes'}
              </button>
              <button onClick={() => setShowClearConfirm(false)} style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-mid)', fontSize: '0.75rem', cursor: 'pointer' }}>
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {!historyLoaded && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader size={20} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        {historyLoaded && messages.map((m, i) => (
          <div key={m.id || i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.6rem', animation: 'fadeUp 0.3s ease forwards' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Scale size={13} color="var(--primary)" />
              </div>
            )}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                padding: '0.85rem 1.1rem',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? 'var(--primary)' : 'var(--cream)',
                color: m.role === 'user' ? 'white' : 'var(--text-dark)',
                border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                fontSize: '0.9rem', lineHeight: 1.65,
              }}>
                {m.role === 'assistant' && m.content
                  ? <RenderMarkdown text={m.content} />
                  : m.role === 'assistant' && streaming && i === messages.length - 1
                  ? <ThinkingDots />
                  : <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
                }
              </div>
              {m.role === 'assistant' && m.content && (
                <button onClick={() => copyMsg(m.content)} style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0.4rem', borderRadius: 6 }}>
                  <Copy size={11} /> Copy
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested queries — show only when no real history */}
      {historyLoaded && onlyWelcome && ragReady && (
        <div style={{ padding: '0 1.5rem 0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SUGGESTED.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{
              padding: '0.4rem 0.85rem', borderRadius: '99px', border: '1.5px solid var(--border)',
              background: 'white', color: 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={ragReady ? 'Ask a legal question about this case…' : 'Run analysis first to enable chat'}
          disabled={!ragReady || streaming}
          rows={1}
          style={{
            flex: 1, padding: '0.75rem 1rem', borderRadius: '12px',
            border: '1.5px solid var(--border)', background: ragReady ? 'white' : 'var(--cream)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: 'var(--text-dark)',
            outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 120, overflow: 'auto',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button onClick={() => send()} disabled={!input.trim() || streaming || !ragReady} style={{
          width: 44, height: 44, borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: input.trim() && ragReady ? 'var(--primary)' : 'var(--border)',
          color: input.trim() && ragReady ? 'white' : 'var(--text-light)',
          cursor: input.trim() && ragReady ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0,
        }}>
          {streaming ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Document Drafter Tab ───────────────────────────────────────────────── */
function DraftTab({ caseId, caseData }) {
  const [docTypes, setDocTypes] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [fields, setFields] = useState({});
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    API.get('/draft/document-types')
      .then(r => {
        setDocTypes(r.data);
        const firstCat = Object.keys(r.data)[0];
        setExpandedCat(firstCat);
      })
      .catch(() => setDocTypes({}))
      .finally(() => setLoadingTypes(false));
  }, []);

  const selectDocType = (type) => {
    setSelectedType(type);
    setDraft('');
    // Pre-fill fields from case data
    const pre = {};
    if (caseData.court) pre['court_name'] = caseData.court;
    if (caseData.parties) pre['parties'] = caseData.parties;
    if (caseData.title) pre['case_title'] = caseData.title;
    setFields(pre);
  };

  const generate = async () => {
    if (!selectedType) return;
    setGenerating(true);
    setDraft('');
    try {
      const res = await API.post('/draft/generate', {
        doc_type: selectedType.key,
        fields,
        case_id: caseData.rag_ready ? caseId : null,
      });
      setDraft(res.data.draft || '');
    } catch (e) {
      setDraft('Error generating document. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyDraft = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDraft = () => {
    const blob = new Blob([draft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType?.key || 'draft'}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CATEGORY_COLORS = {
    'General': '#9b87d4',
    'Civil': '#5da888',
    'Criminal': '#d46b6b',
    'Family': '#c4922d',
    'Property': '#6b9dd4',
    'Constitutional / Writ': '#8e6db8',
    'Consumer': '#d4a06b',
    'Labour': '#6ba88e',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', animation: 'fadeUp 0.4s ease forwards', minHeight: '70vh' }}>
      {/* Left: Document type selector */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--lavender)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PenLine size={16} color="var(--primary)" /> Document Types
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>Select a document to draft</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {loadingTypes ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}><Loader size={20} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : (
            Object.entries(docTypes || {}).map(([cat, types]) => (
              <div key={cat} style={{ marginBottom: '0.25rem' }}>
                <button onClick={() => setExpandedCat(expandedCat === cat ? null : cat)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem', borderRadius: '10px', border: 'none',
                  background: expandedCat === cat ? 'var(--lavender)' : 'transparent',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.82rem', color: CATEGORY_COLORS[cat] || 'var(--primary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[cat] || 'var(--primary)', flexShrink: 0 }} />
                    {cat}
                  </span>
                  <ChevronDown size={13} color="var(--text-light)" style={{ transform: expandedCat === cat ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </button>
                {expandedCat === cat && (
                  <div style={{ paddingLeft: '0.5rem' }}>
                    {types.map(t => (
                      <button key={t.key} onClick={() => selectDocType(t)} style={{
                        width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem',
                        borderRadius: '8px', border: 'none', marginBottom: '0.1rem',
                        background: selectedType?.key === t.key ? 'var(--lavender)' : 'transparent',
                        color: selectedType?.key === t.key ? 'var(--primary)' : 'var(--text-mid)',
                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem',
                        cursor: 'pointer', fontWeight: selectedType?.key === t.key ? 600 : 400,
                        transition: 'all 0.15s', lineHeight: 1.4,
                        borderLeft: selectedType?.key === t.key ? '3px solid var(--primary)' : '3px solid transparent',
                      }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Form + output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!selectedType ? (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <PenLine size={28} color="var(--primary)" />
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-dark)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>AI Document Drafter</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', maxWidth: 380, lineHeight: 1.6 }}>
              Select a document type from the left panel. Fill in the details and generate a professionally formatted Indian court document draft.
            </p>
            <div style={{ marginTop: '1.5rem', padding: '0.75rem 1.25rem', background: 'var(--peach)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', maxWidth: 420, textAlign: 'left' }}>
              <Info size={15} color="#c4922d" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.8rem', color: '#8a6e2e', lineHeight: 1.5 }}>
                All generated documents are <strong>DRAFT TEMPLATES ONLY</strong>. They must be reviewed and verified by a licensed advocate before use in any legal proceeding.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Document info banner */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.1rem 1.4rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{selectedType.label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{selectedType.description}</div>
              </div>
              <button onClick={() => { setSelectedType(null); setDraft(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '0.25rem' }}>
                <X size={16} />
              </button>
            </div>

            {/* Fields form */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.4rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem', marginBottom: '1rem' }}>Document Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {selectedType.fields.map(field => (
                  <div key={field}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: '0.3rem', textTransform: 'capitalize' }}>
                      {field.replace(/_/g, ' ')}
                    </label>
                    <input
                      value={fields[field] || ''}
                      onChange={e => setFields(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                      style={{
                        width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px',
                        border: '1.5px solid var(--border)', fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.85rem', color: 'var(--text-dark)', outline: 'none',
                        background: 'var(--cream)', boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button onClick={generate} disabled={generating} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.7rem 1.4rem', borderRadius: '12px', border: 'none',
                  background: generating ? 'var(--border)' : 'var(--primary)',
                  color: generating ? 'var(--text-light)' : 'white',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                  cursor: generating ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}>
                  {generating
                    ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                    : <><Sparkles size={15} /> Generate Draft</>
                  }
                </button>
                {caseData.rag_ready && (
                  <span style={{ fontSize: '0.78rem', color: '#5da888', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle size={13} /> Will use case documents as context
                  </span>
                )}
              </div>
            </div>

            {/* Output */}
            {(generating || draft) && (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', flex: 1 }}>
                <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--cream)' }}>
                  <FileText size={15} color="var(--primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-dark)', flex: 1 }}>Generated Draft</span>
                  {draft && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={copyDraft} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-mid)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 }}>
                        <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button onClick={downloadDraft} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.85rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 }}>
                        <Download size={12} /> Download
                      </button>
                    </div>
                  )}
                </div>

                {generating ? (
                  <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', opacity: 0.6, animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}</div>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Drafting your legal document…</p>
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
                    <div style={{ background: '#fffbf0', border: '1px solid #f0e0b0', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <AlertTriangle size={14} color="#c4922d" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: '0.78rem', color: '#8a6e2e', lineHeight: 1.5 }}>
                        <strong>Draft Template Only.</strong> This document must be reviewed, verified for accuracy, and properly executed by a licensed advocate before use in any legal proceeding.
                      </p>
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-dark)' }}>{draft}</pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────────────────── */
function RiskGauge({ score }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 120 }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="10" />
          <circle cx="55" cy="55" r="46" fill="none"
            stroke={riskColor(score)} strokeWidth="10"
            strokeDasharray={`${(score / 100) * 289} 289`}
            strokeLinecap="round" transform="rotate(-90 55 55)"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: riskColor(score) }}>{Math.round(score)}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 500 }}>/ 100</div>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: riskColor(score), marginTop: '0.25rem' }}>{riskLabel(score)}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = status === 'active'
    ? { bg: 'var(--mint)', color: '#2d7a58', border: 'var(--sage)', icon: CheckCircle }
    : status === 'analyzing'
    ? { bg: 'var(--peach)', color: '#8a6e2e', border: '#e8d0a0', icon: Clock }
    : { bg: 'var(--cream)', color: 'var(--text-mid)', border: 'var(--border)', icon: Clock };
  return (
    <span style={{ padding: '0.25rem 0.8rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 500, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <cfg.icon size={11} /> {status}
    </span>
  );
}

function EmptyViz({ children }) {
  return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>{children}</div>;
}

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', border: '1px solid var(--border)' }}>
      <Icon size={40} color="var(--violet)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
      <h4 style={{ color: 'var(--text-dark)', marginBottom: '0.4rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{title}</h4>
      <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>{desc}</p>
    </div>
  );
}

function CenterLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <Loader size={28} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

function CenterMsg({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <p style={{ color: 'var(--text-light)' }}>{children}</p>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', padding: '0.25rem 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', opacity: 0.6, animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}
