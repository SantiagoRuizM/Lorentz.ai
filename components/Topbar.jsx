
// Topbar.jsx — with live notification dropdown
const { useState, useEffect, useRef } = React;

const SCREEN_LABELS = {
  synaptrac:   { title: 'Synaptrac',             sub: 'IA Acompañante · Debate Activo' },
  graph:       { title: 'Grafo de Pensamiento',  sub: 'Vista global · 24 nodos' },
  kmerge:      { title: 'K-Merge',               sub: 'Git para documentos · 3 commits pendientes' },
  discursus:   { title: 'Discursus',             sub: 'Reunión grabada · Transcripción activa' },
  professor:   { title: 'Panel Profesor',        sub: 'Auditoría · 6 estudiantes activos' },
  revisor:     { title: 'Revisión Académica',    sub: 'Axiom L2 · Perfil público verificable' },
  axiom:       { title: 'Axiom L2',             sub: 'Block explorer · Verificación pública' },
  profile:     { title: 'Perfil / Score',        sub: 'Johannes Droste · Semestre actual' },
};

const NOTIFICATIONS = [
  { id: 1, type: 'node',    text: 'Tu nodo "Factor γ de Lorentz" alcanzó profundidad 4', ts: 'hace 5 min',  read: false, color: 'var(--violet)' },
  { id: 2, type: 'commit',  text: 'María Ruiz comentó en Lorentz_Force.tex en K-Merge', ts: 'hace 20 min', read: false, color: 'var(--success)' },
  { id: 3, type: 'hash',    text: 'Bloque #1,247,835 sellado en Axiom L2', ts: 'hace 30 min', read: true,  color: 'var(--violet-bright)' },
  { id: 4, type: 'grade',   text: 'Nuevo score registrado: 91/100 (+3.2 esta semana)', ts: 'hace 2h',    read: true,  color: 'var(--warn)' },
  { id: 5, type: 'meeting', text: 'Discursus sesión 7 disponible para revisión y extracción', ts: 'hace 3h', read: true, color: 'var(--warn)' },
  { id: 6, type: 'node',    text: 'Paradoja de los Gemelos convergida con rama principal', ts: 'hace 4h',  read: true,  color: 'var(--violet)' },
];

const NOTIF_ICONS = {
  node:    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="2" y="2" width="6" height="6" fill="currentColor"/></svg>,
  commit:  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="3" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  hash:    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4h6M2 6h6M4 2v6M6 2v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  grade:   <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 8l3-6 3 6M3.5 6h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  meeting: <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="2" y="3" width="6" height="5" rx="0" stroke="currentColor" strokeWidth="1.2"/><path d="M4 3V2M6 3V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

function BlockCounter() {
  const [block, setBlock] = useState(1247835);
  const [hash, setHash]   = useState('4f2a...a2b1');
  useEffect(() => {
    const id = setInterval(() => {
      setBlock(b => b + 1);
      const h1 = Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0');
      const h2 = Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0');
      setHash(`${h1}...${h2}`);
    }, 14000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(78,236,170,0.05)', border: '1px solid rgba(78,236,170,0.2)', borderRadius: '2px', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--success)', whiteSpace: 'nowrap', cursor: 'default' }}>
      <span style={{ width: 5, height: 5, background: 'var(--success)', flexShrink: 0, animation: 'pulse 2s ease-in-out infinite' }} />
      #{block.toLocaleString()} · 0x{hash}
    </div>
  );
}

function NotificationDropdown({ notifications, onMarkRead, onClose }) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 6,
      width: 320, background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '2px', boxShadow: '0 12px 40px rgba(0,0,0,0.6), 4px 4px 0 var(--violet-deep)',
      zIndex: 200, overflow: 'hidden', animation: 'fadeUp 0.18s cubic-bezier(0.25,0,0.35,1)',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Notificaciones</span>
          {unread > 0 && (
            <span style={{ background: 'var(--violet)', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 5px', fontFamily: 'JetBrains Mono' }}>{unread}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onMarkRead} style={{ fontSize: 10, color: 'var(--violet-bright)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
            Marcar todo leído
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifications.map((n, i) => (
          <div key={n.id} style={{
            padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)',
            background: !n.read ? 'var(--violet-06)' : 'transparent',
            display: 'flex', gap: 10, alignItems: 'flex-start',
            transition: 'background 150ms', cursor: 'default',
            animation: `slideIn 0.15s ${i * 0.04}s ease both`,
          }}>
            <div style={{ width: 24, height: 24, background: !n.read ? n.color : 'var(--border)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: !n.read ? '#07070E' : 'var(--text-dim)', flexShrink: 0, marginTop: 1 }}>
              {NOTIF_ICONS[n.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, color: n.read ? 'var(--text-muted)' : 'var(--text)', lineHeight: 1.4, margin: 0, marginBottom: 4 }}>{n.text}</p>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{n.ts}</span>
            </div>
            {!n.read && <span style={{ width: 5, height: 5, background: n.color, flexShrink: 0, marginTop: 5 }} />}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--deep)', display: 'flex', justifyContent: 'center' }}>
        <button style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>
          VER TODO EN AXIOM L2 →
        </button>
      </div>
    </div>
  );
}

function Topbar({ screen }) {
  const info = SCREEN_LABELS[screen] || SCREEN_LABELS.synaptrac;
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifs, setNotifs]         = useState(NOTIFICATIONS);
  const notifRef = useRef(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <div style={{ height: 55, background: 'var(--deep)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 var(--s4)', gap: 'var(--s3)', justifyContent: 'space-between', flexShrink: 0 }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, overflow: 'hidden' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{info.title}</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.sub}</span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', flexShrink: 0 }}>
        {/* Depth chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--slate)', border: '1px solid var(--border)', borderRadius: '2px', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="var(--violet-bright)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Profundidad: 8.4
        </div>

        {/* Search */}
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M8 8l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span>⌘K</span>
        </button>

        {/* Block counter */}
        <BlockCounter />

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{ background: notifOpen ? 'var(--violet-10)' : 'transparent', border: `1px solid ${notifOpen ? 'var(--violet-20)' : 'transparent'}`, borderRadius: '2px', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'all 150ms ease' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: notifOpen ? 'var(--violet-bright)' : 'var(--text-muted)' }}>
              <path d="M8 1a5 5 0 0 1 5 5v3l1.5 2.5H1.5L3 9V6a5 5 0 0 1 5-5zM6 13.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: 'var(--violet)', border: '1.5px solid var(--deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 700, color: 'white', fontFamily: 'JetBrains Mono' }}>
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationDropdown
              notifications={notifs}
              onMarkRead={markAllRead}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Topbar });
