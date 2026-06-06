
// Axiom.jsx — Dynamic blockchain explorer: student notes as transactions, fast blocks
const { useState, useEffect, useRef } = React;

const MOD_COLOR = { synaptrac: 'var(--violet)', kmerge: 'var(--success)', discursus: 'var(--warn)' };

const NOTE_TEMPLATES = [
  { type: 'NOTA_CREADA',    module: 'synaptrac', payloadFn: (s) => `{"student":"${s}","note":"Derivó correctamente el factor γ desde los postulados","depth":4.2,"hash_prev":"0x${rh()}"}` },
  { type: 'ARGUMENTO',      module: 'synaptrac', payloadFn: (s) => `{"student":"${s}","claim":"Invariancia de c implica simultaneidad relativa","score_delta":+0.8}` },
  { type: 'COMMIT_DOC',     module: 'kmerge',    payloadFn: (s) => `{"student":"${s}","file":"Lorentz_Force.tex","lines":"+12/-2","msg":"Añadir tensor F^μν"}` },
  { type: 'INTERVENCION',   module: 'discursus', payloadFn: (s) => `{"student":"${s}","session":"d-07","fragment":"Michelson-Morley","duration_s":34}` },
  { type: 'CONVERGENCIA',   module: 'synaptrac', payloadFn: (s) => `{"student":"${s}","node":"n7","action":"converge","insight":"Geodésica y dil. temporal unificadas"}` },
  { type: 'DIVERGENCIA',    module: 'synaptrac', payloadFn: (s) => `{"student":"${s}","node":"n8","action":"diverge","branch":"Curvatura espacio-tiempo"}` },
  { type: 'NOTA_PROFESOR',  module: 'synaptrac', payloadFn: (s) => `{"teacher":"Prof. A","target":"${s}","note":"Análisis profundo de simultaneidad","sealed":true}` },
  { type: 'REVISION_L2',    module: 'kmerge',    payloadFn: (s) => `{"revisor":"Rev. B","target":"${s}","grade":"A","dictamen":"Proceso verificado","block_ref":"#1247820"}` },
];

const STUDENTS_AX = ['JD','MR','KA','PV','RT','TS'];

function rh() { return Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0'); }
function genHash() { return `0x${rh()}${rh().slice(0,4)}...${rh().slice(0,4)}`; }

function makeEvent(blockNum) {
  const tpl = NOTE_TEMPLATES[Math.floor(Math.random() * NOTE_TEMPLATES.length)];
  const student = STUDENTS_AX[Math.floor(Math.random() * STUDENTS_AX.length)];
  return {
    id: Date.now() + Math.random(),
    block: blockNum,
    ts: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type: tpl.type,
    module: tpl.module,
    student,
    hash: genHash(),
    payload: tpl.payloadFn(student),
    isNew: true,
  };
}

const INITIAL_EVENTS = Array.from({ length: 10 }, (_, i) => ({
  ...makeEvent(1247835 - i),
  ts: `14:${String(24 - i).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
  isNew: false,
}));

const TYPE_COLORS = {
  NOTA_CREADA:   'var(--violet)',
  ARGUMENTO:     'var(--violet-bright)',
  COMMIT_DOC:    'var(--success)',
  INTERVENCION:  'var(--warn)',
  CONVERGENCIA:  'var(--success)',
  DIVERGENCIA:   'var(--violet)',
  NOTA_PROFESOR: '#60A5FA',
  REVISION_L2:   '#A78BFA',
  EVIDENCE_SUBMITTED: '#FFB84D',
  EVIDENCE_VERIFIED:  '#4DECAA',
  EVIDENCE_DISPUTED:  '#FF5C5C',
  AKU_GRANTED:        '#9B8AFF',
  CERTIFICATION_GRANTED: '#00D8F6',
};

// ── Mini mempool ──────────────────────────────────────────────────
function Mempool({ pending }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: 'var(--s2) var(--s3)', background: 'var(--slate)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 5, height: 5, background: 'var(--warn)', animation: 'pulse 1s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--warn)', letterSpacing: '0.1em' }}>MEMPOOL · {pending.length} PENDIENTES</span>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {pending.slice(0, 8).map((p, i) => (
          <span key={i} style={{
            fontFamily: 'JetBrains Mono', fontSize: 8,
            color: 'var(--text-dim)', background: 'var(--card)',
            border: '1px solid var(--border)',
            padding: '2px 6px', whiteSpace: 'nowrap',
          }}>
            {p.type.split('_')[0]} · {p.student}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Block card ────────────────────────────────────────────────────
function BlockCard({ blockNum, events, isLatest }) {
  const [open, setOpen] = useState(isLatest);
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      background: isLatest ? 'rgba(110,84,255,0.04)' : 'transparent',
      transition: 'background 1s ease',
    }}>
      {/* Block header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--s3)',
          padding: '10px var(--s3)', cursor: 'pointer', transition: 'background 150ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--deep)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Block icon */}
        <div style={{
          width: 32, height: 32, background: isLatest ? 'var(--violet)' : 'var(--card)',
          border: `1px solid ${isLatest ? 'var(--violet)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: isLatest ? '0 0 10px rgba(110,84,255,0.4)' : 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4v6L7 13 1 10V4L7 1z" stroke={isLatest ? 'white' : 'var(--text-dim)'} strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700, color: isLatest ? 'var(--violet-bright)' : 'var(--text)' }}>
              Bloque #{blockNum.toLocaleString()}
            </span>
            {isLatest && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'white', background: 'var(--violet)', padding: '1px 6px', letterSpacing: '0.1em', animation: 'fadeUp 0.3s ease' }}>
                ÚLTIMO
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>
            {events.length} transacciones · {events[0]?.ts || '–'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {[...new Set(events.map(e => e.module))].map(m => (
            <span key={m} style={{ width: 5, height: 5, background: MOD_COLOR[m] }} />
          ))}
        </div>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-dim)', transform: open ? 'rotate(180deg)' : '', transition: 'transform 200ms', flexShrink: 0 }}>
          <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Transactions */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {events.map((ev, i) => (
            <div key={ev.id} style={{
              display: 'grid', gridTemplateColumns: '90px 130px 70px 70px 1fr',
              gap: 8, padding: '8px var(--s3) 8px calc(var(--s3) + 32px + var(--s3))',
              borderBottom: '1px solid var(--border-subtle)', alignItems: 'center',
              animation: ev.isNew ? 'fadeUp 0.25s ease both' : `slideIn 0.1s ${i*0.03}s ease both`,
              background: ev.isNew ? 'rgba(110,84,255,0.03)' : 'transparent',
            }}>
              <code style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--violet-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.hash}</code>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: TYPE_COLORS[ev.type] || 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.type}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 4, height: 4, background: MOD_COLOR[ev.module] }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-dim)' }}>{ev.module}</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text)' }}>{ev.student}</span>
              <code style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.payload}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AxiomScreen() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [blockCount, setBlockCount] = useState(1247835);
  const [pending, setPending] = useState(() =>
    Array.from({ length: 5 }, (_, i) => makeEvent(1247836 + i))
  );
  const [filter, setFilter] = useState('all');
  const blockCountRef = useRef(blockCount);
  blockCountRef.current = blockCount;

  useEffect(() => {
    fetch('/api/axiom/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
          if (data.length > 0) {
            setBlockCount(data[0].block);
          }
        }
      })
      .catch(err => console.log('Axiom fallback events'));
  }, []);

  // Fast block interval: 4 seconds
  useEffect(() => {
    const id = setInterval(() => {
      fetch('/api/axiom/mine', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: 'JD' })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            fetch('/api/axiom/events')
              .then(res => res.json())
              .then(evs => {
                if (Array.isArray(evs)) {
                  setEvents(evs);
                  setBlockCount(evs[0]?.block || 1247835);
                }
              });
          }
        })
        .catch(err => {
          console.log('Mining API offline, simulating locally');
          const newBlock = blockCountRef.current + 1;
          setBlockCount(newBlock);
          const batchSize = 2 + Math.floor(Math.random() * 3);
          const newEvents = Array.from({ length: batchSize }, () => ({ ...makeEvent(newBlock), isNew: true }));
          setEvents(prev => [...newEvents, ...prev.slice(0, 50)]);
          setPending(() => Array.from({ length: 3 + Math.floor(Math.random() * 5) }, () => makeEvent(newBlock + 1)));
        });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.module === filter);

  // Group by block
  const blocks = {};
  filtered.forEach(ev => {
    if (!blocks[ev.block]) blocks[ev.block] = [];
    blocks[ev.block].push(ev);
  });
  const sortedBlocks = Object.keys(blocks).sort((a, b) => b - a).slice(0, 15);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>
      {/* Left filters */}
      <div style={{ width: 200, flexShrink: 0, background: 'var(--deep)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 42, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 var(--s3)', flexShrink: 0 }}>
          <span className="label">FILTRAR</span>
        </div>

        {/* Chain status */}
        <div style={{ padding: 'var(--s3)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ background: 'rgba(78,236,170,0.05)', border: '1px solid rgba(78,236,170,0.2)', padding: 'var(--s2)', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, background: 'var(--success)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--success)' }}>AXIOM L2 · ACTIVO</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>#{blockCount.toLocaleString()}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-dim)', marginTop: 2 }}>~4s / bloque · Rollup ETH</div>
          </div>
          {[{ l: 'Txs 24h', v: (events.length * 12).toLocaleString() }, { l: 'Estudiantes', v: '6' }, { l: 'Gas medio', v: '0.00008 ETH' }].map(({ l, v }) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10 }}>
              <span style={{ color: 'var(--text-dim)' }}>{l}</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Module filter */}
        <div style={{ padding: 'var(--s2)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {['all', 'synaptrac', 'kmerge', 'discursus'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 10px', textAlign: 'left',
              background: filter === f ? 'var(--violet-10)' : 'transparent',
              border: `1px solid ${filter === f ? 'var(--violet-20)' : 'transparent'}`,
              borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              color: filter === f ? 'var(--violet-bright)' : 'var(--text-muted)',
              fontSize: 12, transition: 'all 150ms ease', fontFamily: 'DM Sans',
            }}>
              {f !== 'all' && <span style={{ width: 6, height: 6, background: MOD_COLOR[f] }} />}
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tx type legend */}
        <div style={{ padding: 'var(--s3)', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
          <span className="label" style={{ display: 'block', marginBottom: 8 }}>TIPOS DE TX</span>
          {Object.entries(TYPE_COLORS).slice(0, 5).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 5, height: 5, background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-dim)' }}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main explorer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ height: 36, background: 'var(--slate)', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '90px 130px 70px 70px 1fr', gap: 8, alignItems: 'center', padding: '0 var(--s3) 0 calc(var(--s3) + 32px + var(--s3))', flexShrink: 0, fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
          <span>HASH</span><span>TIPO</span><span>MÓDULO</span><span>STUDENT</span><span>PAYLOAD</span>
        </div>

        {/* Mempool */}
        <Mempool pending={pending} />

        {/* Block list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sortedBlocks.map((bNum, i) => (
            <BlockCard
              key={bNum}
              blockNum={parseInt(bNum)}
              events={blocks[bNum]}
              isLatest={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AxiomScreen });
