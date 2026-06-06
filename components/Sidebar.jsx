
const { useState, useRef, useEffect } = React;

const NAV_ESTUDIANTE = [
  { id: 'synaptrac', label: 'Synaptrac', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3" fill="currentColor" opacity="0.9"/><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'graph',     label: 'Grafo',     icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="7" width="4" height="4" fill="currentColor"/><rect x="1" y="1" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="13" y="1" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="1" y="13" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="13" y="13" width="4" height="4" fill="currentColor" opacity="0.6"/><path d="M5 3h8M3 5v8M15 5v8M5 15h8" stroke="currentColor" strokeWidth="1" opacity="0.35"/></svg> },
  { id: 'kmerge',    label: 'K-Merge',   icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="4" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="4" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6.5v5M4 6.5C4 10 14 10 14 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'discursus', label: 'Discursus', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="1" width="4" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'axiom',     label: 'Axiom L2',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L16 5v8L9 17 2 13V5L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 1v16M2 5l7 4 7-4M2 13l7-4 7 4" stroke="currentColor" strokeWidth="1" opacity="0.4"/></svg> },
  { id: 'achievements', label: 'Logros / Certs', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l2.2 4.5 4.8.7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9-3.5-3.4 4.8-.7L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];
const NAV_PROFESOR = [
  { id: 'professor', label: 'Estudiantes', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M5 17c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="3" cy="13" r="1.8" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/><circle cx="15" cy="13" r="1.8" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/></svg> },
  { id: 'graph',     label: 'Meta-Grafo', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="7" width="4" height="4" fill="currentColor"/><rect x="1" y="1" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="13" y="1" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="1" y="13" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="13" y="13" width="4" height="4" fill="currentColor" opacity="0.6"/><path d="M5 3h8M3 5v8M15 5v8M5 15h8" stroke="currentColor" strokeWidth="1" opacity="0.35"/></svg> },
  { id: 'discursus', label: 'Discursus',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="1" width="4" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'axiom',     label: 'Axiom L2',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L16 5v8L9 17 2 13V5L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 1v16M2 5l7 4 7-4M2 13l7-4 7 4" stroke="currentColor" strokeWidth="1" opacity="0.4"/></svg> },
  { id: 'achievements', label: 'Logros / Certs', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l2.2 4.5 4.8.7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9-3.5-3.4 4.8-.7L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];
const NAV_REVISOR = [
  { id: 'revisor', label: 'Revisión',   icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L17 5v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'axiom',   label: 'Axiom L2',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L16 5v8L9 17 2 13V5L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 1v16M2 5l7 4 7-4M2 13l7-4 7 4" stroke="currentColor" strokeWidth="1" opacity="0.4"/></svg> },
  { id: 'profile', label: 'Mi perfil',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 17c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'achievements', label: 'Logros / Certs', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l2.2 4.5 4.8.7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9-3.5-3.4 4.8-.7L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];
const NAV_INVESTIGADOR = [
  { id: 'synaptrac', label: 'Synaptrac', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3" fill="currentColor" opacity="0.9"/><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'graph',     label: 'Grafo Ciencia', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="7" width="4" height="4" fill="currentColor"/><rect x="1" y="1" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="13" y="1" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="1" y="13" width="4" height="4" fill="currentColor" opacity="0.6"/><rect x="13" y="13" width="4" height="4" fill="currentColor" opacity="0.6"/><path d="M5 3h8M3 5v8M15 5v8M5 15h8" stroke="currentColor" strokeWidth="1" opacity="0.35"/></svg> },
  { id: 'kmerge',    label: 'K-Merge Docs', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="4" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="4" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6.5v5M4 6.5C4 10 14 10 14 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'discursus', label: 'Discursus', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="1" width="4" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'axiom',     label: 'Axiom L2',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L16 5v8L9 17 2 13V5L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 1v16M2 5l7 4 7-4M2 13l7-4 7 4" stroke="currentColor" strokeWidth="1" opacity="0.4"/></svg> },
  { id: 'achievements', label: 'Logros / Certs', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l2.2 4.5 4.8.7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9-3.5-3.4 4.8-.7L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];
const NAV_LABORATORIO = [
  { id: 'kmerge',    label: 'K-Merge Lab', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="4" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="4" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6.5v5M4 6.5C4 10 14 10 14 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'discursus', label: 'Sesiones Lab', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="1" width="4" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'axiom',     label: 'Axiom L2',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L16 5v8L9 17 2 13V5L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 1v16M2 5l7 4 7-4M2 13l7-4 7 4" stroke="currentColor" strokeWidth="1" opacity="0.4"/></svg> },
  { id: 'achievements', label: 'Logros / Certs', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l2.2 4.5 4.8.7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9-3.5-3.4 4.8-.7L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];
const NAV_SPONSOR = [
  { id: 'axiom',     label: 'Explorer L2', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L16 5v8L9 17 2 13V5L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 1v16M2 5l7 4 7-4M2 13l7-4 7 4" stroke="currentColor" strokeWidth="1" opacity="0.4"/></svg> },
  { id: 'discursus', label: 'Auditorías',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="1" width="4" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: 'revisor',   label: 'Resultados',  icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1L17 5v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'achievements', label: 'Logros / Certs', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l2.2 4.5 4.8.7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9-3.5-3.4 4.8-.7L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];

const ROLE_NAV    = {
  estudiante: NAV_ESTUDIANTE,
  profesor: NAV_PROFESOR,
  revisor: NAV_REVISOR,
  investigador: NAV_INVESTIGADOR,
  laboratorio: NAV_LABORATORIO,
  sponsor: NAV_SPONSOR,
};
const ROLE_LABELS = {
  estudiante: 'Estudiante',
  profesor: 'Profesor',
  revisor: 'Revisor',
  investigador: 'Investigador',
  laboratorio: 'Laboratorio',
  sponsor: 'Sponsor',
};
const ROLE_COLORS = {
  estudiante: 'var(--violet)',
  profesor: '#3D6BF5',
  revisor: '#2E4F9B',
  investigador: '#00D8F6',
  laboratorio: '#00E676',
  sponsor: '#FFB300',
};

function NavItem({ item, active, expanded, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: expanded ? '9px 12px' : '9px',
        justifyContent: expanded ? 'flex-start' : 'center',
        borderRadius: '2px', cursor: 'pointer',
        background: active ? 'var(--violet-10)' : hov ? 'var(--violet-06)' : 'transparent',
        border: active ? '1px solid var(--violet-20)' : '1px solid transparent',
        color: active ? 'var(--violet-bright)' : hov ? 'var(--text)' : 'var(--text-muted)',
        transition: 'all 150ms ease', flexShrink: 0,
      }}>
      <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
      {expanded && <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</span>}
    </div>
  );
}

// ── Profile dropdown menu ─────────────────────────────────────────
function ProfileMenu({ expanded, onClose, onLogout, onProfile }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const ITEMS = [
    { label: 'Ver perfil', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 13c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>, action: onProfile },
    { label: 'Comentarios', icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v8H8l-2 2-2-2H2V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>, action: onClose },
    { label: 'Ayuda',       icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10.5" r="0.6" fill="currentColor"/></svg>, action: onClose },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 4,
      background: 'var(--card)', border: '1px solid var(--border)',
      boxShadow: '0 -8px 28px rgba(0,0,0,0.5), 2px 0 0 var(--violet-deep)',
      zIndex: 100, overflow: 'hidden', animation: 'fadeUp 0.15s ease both',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--slate)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Johannes Droste</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>Node L-442 · Semestre 3</div>
      </div>

      {ITEMS.map(({ label, icon, action }) => (
        <div key={label} onClick={() => { action(); onClose(); }} style={{
          padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: 'var(--text-muted)', transition: 'all 150ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          <span style={{ color: 'var(--text-dim)', display: 'flex' }}>{icon}</span>
          {label}
        </div>
      ))}

      <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />

      {/* Logout */}
      <div onClick={onLogout} style={{
        padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 12, color: 'var(--error)', transition: 'all 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,92,92,0.07)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Cerrar sesión
      </div>
    </div>
  );
}

function Sidebar({ screen, setScreen, role, onLogout }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = ROLE_NAV[role] || NAV_ESTUDIANTE;
  const roleColor = ROLE_COLORS[role] || 'var(--violet)';
  const roleLabel = ROLE_LABELS[role] || 'Estudiante';

  return (
    <div
      style={{ width: expanded ? 220 : 60, minWidth: expanded ? 220 : 60, height: '100%', background: 'var(--deep)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 220ms cubic-bezier(0.25,0,0.35,1)', overflow: 'hidden', zIndex: 10, flexShrink: 0 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(false); }}
    >
      {/* Logo */}
      <div style={{ height: 55, display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: '1px solid var(--border)', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 24, height: 24, background: roleColor, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 12px ${roleColor}66`, transition: 'background 300ms' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 3.5v5L6 11 1 8.5v-5L6 1z" fill="white" opacity="0.9"/></svg>
        </div>
        {expanded && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--text)', whiteSpace: 'nowrap' }}>Lorentz.ai</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: roleColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{roleLabel}</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '13px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', overflowX: 'hidden' }}>
        {nav.map(item => (
          <NavItem key={item.id} item={item} active={screen === item.id} expanded={expanded} onClick={() => setScreen(item.id)} />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '13px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        {/* Axiom badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: expanded ? '6px 12px' : '6px', justifyContent: expanded ? 'flex-start' : 'center', background: 'rgba(78,236,170,0.06)', border: '1px solid rgba(78,236,170,0.15)', flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, background: 'var(--success)', flexShrink: 0, animation: 'pulse 2s ease-in-out infinite' }} />
          {expanded && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--success)', whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>AXIOM L2 · #1,247,832</span>}
        </div>

        {/* Profile — click to open menu */}
        <div style={{ position: 'relative' }}>
          {menuOpen && (
            <ProfileMenu
              expanded={expanded}
              onClose={() => setMenuOpen(false)}
              onLogout={onLogout}
              onProfile={() => { setScreen('profile'); setMenuOpen(false); }}
            />
          )}
          <div
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: expanded ? '9px 12px' : '9px',
              justifyContent: expanded ? 'flex-start' : 'center',
              borderRadius: '2px', cursor: 'pointer',
              background: menuOpen ? 'var(--violet-10)' : screen === 'profile' ? 'var(--violet-06)' : 'transparent',
              border: menuOpen ? '1px solid var(--violet-20)' : '1px solid transparent',
              transition: 'all 150ms ease', flexShrink: 0,
            }}
            onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.background = 'var(--violet-06)'; }}
            onMouseLeave={e => { if (!menuOpen && screen !== 'profile') e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '2px', background: `linear-gradient(135deg, ${roleColor}88, ${roleColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>JD</div>
            {expanded && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--text)' }}>Johannes Droste</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono' }}>{roleLabel} · L-442</div>
              </div>
            )}
            {expanded && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-dim)', flexShrink: 0, transform: menuOpen ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>
                <path d="M2 4l3-3 3 3M2 7l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar });
