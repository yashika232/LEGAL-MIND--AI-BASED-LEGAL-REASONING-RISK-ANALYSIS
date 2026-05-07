import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Scale, Plus, LogOut, TrendingUp, Briefcase, Clock, CheckCircle, AlertTriangle, ChevronRight, Folder } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import API from '../utils/api';

const TYPE_COLORS = {
  criminal: '#f4c5c5',
  civil: '#b8d4e8',
  family: '#f9e8e8',
  corporate: '#c5b8e8',
  property: '#b8d8cc',
};

const STATUS_COLORS = {
  active: '#b8d8cc',
  analyzing: '#f9e8d0',
  closed: '#e8e8e8',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      API.get('/cases').then(r => setCases(r.data)),
      API.get('/stats').then(r => setStats(r.data)),
    ])
      .catch(err => {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load dashboard data. Please refresh.');
      })
      .finally(() => setLoading(false));
  }, []);

  const byTypeData = stats ? Object.entries(stats.by_type).map(([name, value]) => ({ name, value })) : [];
  const PIE_COLORS = ['#c5b8e8', '#f4c5c5', '#b8d8cc', '#b8d4e8', '#f9e8d0'];

  const riskBarData = cases.slice(0, 6).map(c => ({
    name: c.title?.slice(0, 12) + '…',
    risk: Math.round(c.risk_score),
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'white', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-dark)' }}>LexAI</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { icon: TrendingUp, label: 'Dashboard', active: true },
            { icon: Briefcase, label: 'My Cases', onClick: () => {} },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.85rem', borderRadius: '10px', border: 'none',
              background: item.active ? 'var(--lavender)' : 'transparent',
              color: item.active ? 'var(--primary)' : 'var(--text-mid)',
              fontFamily: 'DM Sans, sans-serif', fontWeight: item.active ? 600 : 400,
              fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = 'var(--cream)'; }}
              onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = 'transparent'; }}
            >
              <item.icon size={17} /> {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ padding: '0.5rem 0.85rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{user?.email}</div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.65rem 0.85rem', borderRadius: '10px', border: 'none',
            background: 'transparent', color: 'var(--text-light)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', cursor: 'pointer', width: '100%',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--blush)'; e.currentTarget.style.color = '#c44'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)'; }}
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
              Good morning, {user?.name?.split(' ')[0] || 'Counsel'} 👋
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>Here's your case overview for today</p>
          </div>
          <button onClick={() => navigate('/new-case')} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.4rem', borderRadius: '12px', border: 'none',
            background: 'var(--primary)', color: 'white',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(155,135,212,0.3)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(155,135,212,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(155,135,212,0.3)'; }}
          >
            <Plus size={18} /> New Case
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fde8e8', border: '1px solid #f4c5c5', borderRadius: '12px', padding: '0.85rem 1.2rem', marginBottom: '1.5rem', color: '#c44', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Stat cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 100, borderRadius: '16px', background: 'white', border: '1px solid var(--border)' }} className="shimmer-loading" />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: Briefcase, label: 'Total Cases', value: stats?.total || 0, color: 'var(--lavender)', iconColor: 'var(--primary)' },
              { icon: Clock, label: 'Analyzing', value: stats?.analyzing || 0, color: 'var(--peach)', iconColor: 'var(--accent)' },
              { icon: CheckCircle, label: 'Active', value: stats?.active || 0, color: 'var(--mint)', iconColor: '#5da888' },
              { icon: AlertTriangle, label: 'Avg Risk', value: `${stats?.avg_risk || 0}%`, color: 'var(--blush)', iconColor: '#d46b6b' },
            ].map((card, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: '16px', padding: '1.25rem',
                border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(155,135,212,0.06)',
                animation: `fadeUp 0.5s ease ${i * 0.08}s forwards`, opacity: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.4rem', fontWeight: 500 }}>{card.label}</div>
                    <div style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--text-dark)' }}>{card.value}</div>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={18} color={card.iconColor} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Risk bar chart */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(155,135,212,0.06)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '1rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Case Risk Scores</h3>
            {riskBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={riskBarData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-light)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}
                    cursor={{ fill: 'var(--lavender)', radius: 6 }}
                  />
                  <Bar dataKey="risk" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                No cases yet
              </div>
            )}
          </div>

          {/* By type pie */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(155,135,212,0.06)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '1rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Cases by Type</h3>
            {byTypeData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ResponsiveContainer width="60%" height={160}>
                  <PieChart>
                    <Pie data={byTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {byTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {byTypeData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-mid)', textTransform: 'capitalize' }}>{d.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: 'auto' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Cases list */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(155,135,212,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Recent Cases</h3>
          </div>
          {cases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              <Folder size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 500 }}>No cases yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Create your first case to get started</p>
              <button onClick={() => navigate('/new-case')} style={{
                marginTop: '1.25rem', padding: '0.6rem 1.4rem', borderRadius: '10px', border: 'none',
                background: 'var(--primary)', color: 'white', fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500, cursor: 'pointer',
              }}>
                + New Case
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cases.map((c, i) => (
                <div key={c.id} onClick={() => navigate(`/case/${c.id}`)} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem', borderRadius: '12px',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  transition: 'all 0.2s', animation: `fadeUp 0.4s ease ${i * 0.06}s forwards`, opacity: 0,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '10px',
                    background: TYPE_COLORS[c.case_type] || 'var(--lavender)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Briefcase size={18} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.15rem' }}>{c.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>{c.case_type} · {new Date(c.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.25rem 0.7rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500,
                      background: STATUS_COLORS[c.status] || 'var(--lavender)',
                      color: c.status === 'active' ? '#2d7a58' : c.status === 'analyzing' ? '#8a6e2e' : 'var(--text-mid)',
                      textTransform: 'capitalize',
                    }}>
                      {c.status}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: c.risk_score > 70 ? '#d46b6b' : c.risk_score > 40 ? '#c4922d' : '#5da888' }}>
                      {Math.round(c.risk_score)}%
                    </div>
                    <ChevronRight size={16} color="var(--text-light)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
