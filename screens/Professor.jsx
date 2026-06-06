
// Professor.jsx — Kanban + student detail with AI chat history + thought graph
const { useState, useRef, useEffect } = React;

const STUDENTS = [
  { id: 'JD', name: 'Johannes Droste', module: 'synaptrac', depth: 8.4, nodes: 24, score: 91, status: 'active', lastHash: '0x4f2a', topic: 'Transformaciones de Lorentz' },
  { id: 'MR', name: 'María Ruiz',       module: 'discursus', depth: 6.1, nodes: 17, score: 74, status: 'active', lastHash: '0x9c3d', topic: 'Relatividad del tiempo' },
  { id: 'KA', name: 'Kai Andersen',     module: 'kmerge',    depth: 7.8, nodes: 31, score: 88, status: 'review', lastHash: '0x7a1b', topic: 'Espacio-tiempo de Minkowski' },
  { id: 'PV', name: 'Pedro Vega',       module: 'synaptrac', depth: 4.2, nodes: 9,  score: 52, status: 'idle',   lastHash: '0x2e7c', topic: 'Postulados de Einstein' },
  { id: 'RT', name: 'Rosa Tejada',      module: 'discursus', depth: 9.1, nodes: 38, score: 97, status: 'active', lastHash: '0x5b9a', topic: 'Curvatura del espacio-tiempo' },
  { id: 'TS', name: 'Tomás Santos',     module: 'kmerge',    depth: 3.5, nodes: 7,  score: 41, status: 'idle',   lastHash: '0x1d4e', topic: 'Efecto Doppler relativista' },
];

const COLUMNS = [
  { id: 'active', label: 'Investigación activa', color: 'var(--violet)' },
  { id: 'review', label: 'En revisión',          color: 'var(--warn)' },
  { id: 'idle',   label: 'Sin actividad',        color: 'var(--text-dim)' },
];

// Simulated chat histories per student
const CHAT_HISTORIES = {
  JD: [
    { role: 'ai', text: 'Bienvenido de vuelta, Johannes. El tema asignado es Transformaciones de Lorentz. ¿Qué aspecto quieres explorar?', ts: '14:18', node: 'root' },
    { role: 'student', text: 'Quiero entender la dilatación temporal desde el punto de vista de un observador en movimiento.', ts: '14:19' },
    { role: 'ai', text: 'La dilatación temporal surge del postulado de invariancia de c. Para Δx=0: Δt′ = γ·Δt donde γ = 1/√(1−v²/c²). Para v→c, γ→∞ — el reloj del observador en movimiento avanza más lento.', ts: '14:20', node: 'n1', formula: 'Δt′ = γ · Δt,  γ = 1/√(1 − v²/c²)' },
    { role: 'student', text: 'Pero si el movimiento es relativo, ¿quién envejece más lento? La paradoja parece simétrica.', ts: '14:22' },
    { role: 'ai', text: 'Correcta identificación. La asimetría surge por la aceleración: el gemelo que regresa experimenta un cambio de frame inercial. La aceleración rompe la simetría. La trayectoria de menor longitud geodésica en el espacio-tiempo corresponde al observador que no acelera.', ts: '14:23', node: 'n2' },
    { role: 'student', text: 'Entonces el invariante de intervalo ds² = c²dt² − dx² es la clave para comparar los relojes.', ts: '14:25' },
    { role: 'ai', text: 'Exacto. El intervalo propio dτ = ds/c es lo que cada reloj mide a lo largo de su propia trayectoria. El gemelo viajero acumula menos τ porque recorre una trayectoria de menor longitud geodésica — aunque mayor longitud espacial. Este es el corazón de la geometría de Minkowski.', ts: '14:26', node: 'n3' },
  ],
  MR: [
    { role: 'ai', text: 'Bienvenida, María. Hoy exploramos relatividad del tiempo. ¿Desde dónde quieres iniciar?', ts: '10:05', node: 'root' },
    { role: 'student', text: 'Quiero entender por qué c es constante aunque la fuente se mueva.', ts: '10:06' },
    { role: 'ai', text: 'El experimento Michelson-Morley (1887) demostró que c no depende del movimiento de la fuente ni del observador. Esto motivó a Einstein a adoptarlo como postulado, descartando el éter luminífero.', ts: '10:07', node: 'n1' },
    { role: 'student', text: '¿Cómo se reconcilia eso con la adición de velocidades de Galileo?', ts: '10:09' },
    { role: 'ai', text: 'La adición galileana v₁+v₂ falla a velocidades relativistas. La versión correcta es: u = (v₁+v₂)/(1+v₁v₂/c²). Para v₁=v₂=c/2: u = c no c. La estructura del grupo de Lorentz reemplaza al grupo de Galileo.', ts: '10:10', node: 'n2', formula: 'u = (v₁+v₂) / (1 + v₁v₂/c²)' },
  ],
  KA: [
    { role: 'ai', text: 'Kai, el tema de hoy es la geometría de Minkowski. ¿Has revisado el diagrama espacio-temporal?', ts: '09:30', node: 'root' },
    { role: 'student', text: 'Sí, pero no entiendo por qué los conos de luz son los límites causales.', ts: '09:31' },
    { role: 'ai', text: 'Los conos de luz definen qué eventos pueden tener influencia causal sobre otros. Ninguna señal puede superar c, por lo que el cono futuro de un evento contiene exactamente los eventos que ese evento puede influenciar. Fuera del cono: separación espacial — sin posible causalidad.', ts: '09:33', node: 'n1' },
    { role: 'student', text: 'Entonces dos eventos simultáneos en un frame pueden no serlo en otro.', ts: '09:35' },
    { role: 'ai', text: 'Correcto: la simultaneidad es relativa. Si dos eventos tienen separación espacial (ds²>0), existe un frame donde son simultáneos y otro donde no. Solo los eventos con ds²<0 (separación temporal) mantienen su orden causal en todos los frames.', ts: '09:36', node: 'n2' },
  ],
};

const NODE_TREES = {
  JD: [
    { id: 'root', label: 'LORENTZ', isRoot: true, hash: '0x6e54', module: 'synaptrac' },
    { id: 'n1', label: 'Dil. temp.', type: 'branch', hash: '0x7a3f', module: 'synaptrac' },
    { id: 'n2', label: 'Paradoja', type: 'branch', hash: '0x9c4d', module: 'synaptrac' },
    { id: 'n3', label: 'Geodésica', type: 'leaf', hash: '0x2e7c', module: 'synaptrac' },
  ],
  MR: [
    { id: 'root', label: 'MICHELSON', isRoot: true, hash: '0x9c3d', module: 'synaptrac' },
    { id: 'n1', label: 'Inv. c', type: 'branch', hash: '0x4a1b', module: 'synaptrac' },
    { id: 'n2', label: 'Galileo', type: 'leaf', hash: '0x8d3f', module: 'synaptrac' },
  ],
  KA: [
    { id: 'root', label: 'MINKOWSKI', isRoot: true, hash: '0x7a1b', module: 'synaptrac' },
    { id: 'n1', label: 'Conos luz', type: 'branch', hash: '0x3c9e', module: 'synaptrac' },
    { id: 'n2', label: 'Simultán.', type: 'leaf', hash: '0x6b2a', module: 'synaptrac' },
  ],
};

const NODE_EDGES = {
  JD: [{ source: 'root', target: 'n1' }, { source: 'n1', target: 'n2' }, { source: 'n2', target: 'n3' }],
  MR: [{ source: 'root', target: 'n1' }, { source: 'n1', target: 'n2' }],
  KA: [{ source: 'root', target: 'n1' }, { source: 'n1', target: 'n2' }],
};

const MOD_COLOR = { synaptrac: 'var(--violet)', kmerge: 'var(--success)', discursus: 'var(--warn)' };

function ScoreBar({ value }) {
  const c = value >= 80 ? 'var(--violet)' : value >= 60 ? 'var(--warn)' : 'var(--error)';
  return (
    <div style={{ height: 3, background: 'var(--border)', overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${value}%`, background: c, transition: 'width 0.6s ease' }} />
    </div>
  );
}

const ALL_SCORES_PROF = [91, 74, 88, 52, 97, 41];

function GaussianWidget({ highlighted }) {
  const scores = ALL_SCORES_PROF;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const std  = Math.sqrt(scores.reduce((a, s) => a + (s - mean) ** 2, 0) / scores.length);
  const W = 260, H = 80, PAD = 18, chartW = W - PAD * 2;
  const gauss = x => Math.exp(-0.5 * ((x - mean) / std) ** 2);
  const pts = Array.from({ length: 101 }, (_, i) => {
    const x = i; const y = gauss(x);
    return `${PAD + (x / 100) * chartW},${H - 12 - y * (H - 24)}`;
  });
  const line = `M ${pts.join(' L ')}`;
  const fill = `${line} L ${pts[100].split(',')[0]},${H - 12} L ${PAD},${H - 12} Z`;
  const hx = highlighted != null ? PAD + (highlighted / 100) * chartW : null;
  const sigmas = [-2, -1, 0, 1, 2].map(s => ({ s, x: PAD + ((mean + s * std) / 100) * chartW, label: s === 0 ? 'μ' : `${s > 0 ? '+' : ''}${s}σ` })).filter(({ x }) => x >= PAD && x <= W - PAD);
  const sigmaPos = highlighted != null ? ((highlighted - mean) / std).toFixed(1) : null;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s3)', marginBottom: 'var(--s3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="label">DISTRIBUCIÓN DEL CURSO · σ</span>
        {sigmaPos && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: Math.abs(parseFloat(sigmaPos)) >= 1.5 ? 'var(--success)' : 'var(--violet-bright)', padding: '2px 7px', background: 'var(--slate)', border: '1px solid var(--border)' }}>σ = {sigmaPos}</span>}
      </div>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <path d={fill} fill="rgba(110,84,255,0.10)" />
        <path d={line} fill="none" stroke="var(--violet)" strokeWidth="1.5" />
        {sigmas.map(({ s, x, label }) => (
          <g key={s}>
            <line x1={x} y1={8} x2={x} y2={H - 12} stroke="var(--border)" strokeWidth="0.8" strokeDasharray={s !== 0 ? '3 2' : '0'} />
            <text x={x} y={H - 2} fill="var(--text-dim)" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">{label}</text>
          </g>
        ))}
        {scores.map((s, i) => <circle key={i} cx={PAD + (s / 100) * chartW} cy={H - 10} r="2.5" fill={s === highlighted ? 'var(--warn)' : 'var(--violet)'} opacity={s === highlighted ? 1 : 0.35} />)}
        {hx != null && <><line x1={hx} y1={6} x2={hx} y2={H - 10} stroke="var(--warn)" strokeWidth="1.5" /><circle cx={hx} cy={H - 10} r="3.5" fill="var(--warn)" /></>}
      </svg>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', marginTop: 4, display: 'flex', gap: 12 }}>
        <span>μ = {mean.toFixed(1)}</span><span>σ = {std.toFixed(1)}</span>
        {highlighted != null && <span style={{ color: 'var(--warn)' }}>Este estudiante: {highlighted}</span>}
      </div>
    </div>
  );
}

function StudentAvatar({ id, size = 28 }) {
  const colors = { JD: 'var(--violet)', MR: '#4DECAA', KA: '#FFB84D', PV: '#FF8A80', RT: '#60A5FA', TS: '#A78BFA' };
  return (
    <div style={{
      width: size, height: size, background: colors[id] || 'var(--violet)',
      borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#07070E', flexShrink: 0,
    }}>{id}</div>
  );
}

// ── Kanban card ────────────────────────────────────────────────────
function StudentCard({ student, onClick }) {
  return (
    <div onClick={() => onClick(student)} style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '2px',
      padding: 'var(--s3)', cursor: 'pointer', transition: 'all 150ms ease',
      animation: 'fadeUp 0.25s ease both',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--violet-deep)'; e.currentTarget.style.borderColor = 'var(--violet-20)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <StudentAvatar id={student.id} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{student.id} · {student.module}</div>
        </div>
        <div style={{ width: 18, height: 18, background: MOD_COLOR[student.module], borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#07070E', flexShrink: 0 }}>
          {student.module[0].toUpperCase()}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>{student.topic}</div>
      <div style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 6 }}>
        {[{ v: student.depth, l: 'depth' }, { v: student.nodes, l: 'nodos' }, { v: student.score, l: 'score' }].map(({ v, l }) => (
          <div key={l} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: l === 'score' && student.score >= 80 ? 'var(--violet-bright)' : 'var(--text)' }}>{v}</div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{l}</div>
          </div>
        ))}
      </div>
      <ScoreBar value={student.score} />
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', marginTop: 5 }}>hash: {student.lastHash}</div>
    </div>
  );
}

// ── Student detail view ────────────────────────────────────────────
function StudentDetail({ student, onBack }) {
  const [tab, setTab]       = useState('chat');
  const [graphW, setGraphW] = useState(300);
  const [graphH, setGraphH] = useState(400);
  const [history, setHistory] = useState([]);
  const [gNodes, setGNodes] = useState([]);
  const [gEdges, setGEdges] = useState([]);
  const graphRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) { setGraphW(e.contentRect.width); setGraphH(e.contentRect.height); }
    });
    if (graphRef.current) obs.observe(graphRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    fetch(`/api/professor/chat/${student.id}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setHistory(data); })
      .catch(err => {
        console.log('Fall back to CHAT_HISTORIES');
        setHistory(CHAT_HISTORIES[student.id] || CHAT_HISTORIES.JD);
      });

    fetch(`/api/professor/graph/${student.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.nodes && data.edges) {
          setGNodes(data.nodes);
          setGEdges(data.edges);
        }
      })
      .catch(err => {
        console.log('Fall back to NODE_TREES');
        setGNodes(NODE_TREES[student.id] || NODE_TREES.JD);
        setGEdges(NODE_EDGES[student.id] || NODE_EDGES.JD);
      });
  }, [student.id]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideIn 0.2s ease both' }}>
      {/* Header */}
      <div style={{
        height: 55, borderBottom: '1px solid var(--border)', background: 'var(--deep)',
        display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: '0 var(--s4)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: 'var(--slate)', border: '1px solid var(--border)', borderRadius: '2px',
          color: 'var(--text-muted)', cursor: 'pointer', padding: '5px 10px',
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, transition: 'all 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Volver
        </button>
        <StudentAvatar id={student.id} size={32} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{student.name}</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>
            {student.id} · {student.topic} · Score: {student.score}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Tab bar */}
        {['chat', 'notas'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '6px 14px', background: tab === t ? 'var(--violet-10)' : 'transparent',
            border: `1px solid ${tab === t ? 'var(--violet-20)' : 'transparent'}`,
            borderRadius: '2px', color: tab === t ? 'var(--violet-bright)' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms ease',
            textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono',
          }}>{t}</button>
        ))}
        <div style={{
          padding: '5px 10px', background: 'rgba(78,236,170,0.06)',
          border: '1px solid rgba(78,236,170,0.2)', fontFamily: 'JetBrains Mono',
          fontSize: 9, color: 'var(--success)',
        }}>HASH: {student.lastHash}</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {tab === 'chat' ? (
          <>
            {/* Chat history (read-only) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s4)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)', borderRight: '1px solid var(--border)' }}>
              {/* Header */}
              <div style={{ padding: '8px 12px', background: 'var(--violet-06)', border: '1px solid var(--violet-20)', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1h8v6H1zM3 7v2l2-2" stroke="var(--violet-bright)" strokeWidth="1" strokeLinecap="round"/></svg>
                Vista de auditor — solo lectura · {history.length} intercambios
              </div>

              {history.map((msg, i) => {
                const isAI = msg.role === 'ai';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end', animation: `fadeUp 0.2s ${i * 0.04}s ease both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexDirection: isAI ? 'row' : 'row-reverse' }}>
                      {isAI ? (
                        <div style={{ width: 18, height: 18, background: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 1L9 3v4L5 9 1 7V3L5 1z" fill="white" opacity="0.9"/></svg>
                        </div>
                      ) : <StudentAvatar id={student.id} size={18} />}
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>
                        {isAI ? 'Lorentz.ai' : student.name} · {msg.ts}
                        {msg.node && <span style={{ marginLeft: 5, color: 'var(--violet-deep)' }}>· {msg.node}</span>}
                      </span>
                    </div>
                    <div style={{
                      maxWidth: '85%', background: isAI ? 'var(--card)' : 'var(--slate)',
                      border: `1px solid ${isAI ? 'var(--border)' : 'var(--violet-20)'}`,
                      borderRadius: '2px', padding: 'var(--s2) var(--s3)',
                    }}>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>{msg.text}</p>
                      {msg.formula && (
                        <div style={{ marginTop: 8, padding: '7px 10px', background: 'var(--slate)', borderLeft: '2px solid var(--violet)', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--violet-bright)' }}>
                          {msg.formula}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Graph panel */}
            <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--deep)', overflow: 'hidden' }}>
              <div style={{ height: 38, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--s3)', flexShrink: 0 }}>
                <span className="label">GRAFO DE PENSAMIENTO</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--violet-bright)' }}>{gNodes.length} nodos</span>
              </div>
              <div ref={graphRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <GraphCanvas nodes={gNodes} edges={gEdges} width={graphW} height={graphH} />
              </div>
              <div style={{ padding: 'var(--s3)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 8 }}>
                  {[{ v: student.depth, l: 'Profundidad' }, { v: student.nodes, l: 'Nodos' }, { v: student.score, l: 'Score' }].map(({ v, l }) => (
                    <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 700, color: 'var(--violet-bright)' }}>{v}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <ScoreBar value={student.score} />
              </div>
            </div>
          </>
        ) : (
          /* Notes tab */
          <div style={{ flex: 1, padding: 'var(--s4)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            <GaussianWidget highlighted={student.score} />
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s3)' }}>
              <span className="label" style={{ display: 'block', marginBottom: 10 }}>NOTA DEL PROFESOR</span>
              <textarea placeholder={`Escribe una anotación sobre ${student.name}… (se hasheará en Axiom L2)`} rows={5} style={{
                width: '100%', background: 'var(--slate)', border: '1px solid var(--border)',
                borderRadius: '2px', padding: '10px', color: 'var(--text)', fontSize: 13, fontFamily: 'DM Sans',
                outline: 'none', resize: 'vertical', lineHeight: 1.6,
              }} onFocus={e => e.target.style.borderColor = 'var(--violet)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={{ flex: 1, padding: '8px', background: 'var(--violet)', border: 'none', borderRadius: '2px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '2px 2px 0 var(--violet-deep)' }}>
                  Registrar en L2 →
                </button>
                <button style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
                  Guardar borrador
                </button>
              </div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s3)' }}>
              <span className="label" style={{ display: 'block', marginBottom: 10 }}>CALIFICACIÓN MANUAL</span>
              {[{ l: 'Synaptrac (profundidad)', v: Math.round(student.depth * 10) }, { l: 'K-Merge (contribuciones)', v: 72 }, { l: 'Discursus (participación)', v: 65 }].map(({ l, v }) => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text)' }}>{v}/100</span>
                  </div>
                  <ScoreBar value={v} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main professor screen ──────────────────────────────────────────
function ProfessorScreen() {
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState(STUDENTS);

  useEffect(() => {
    fetch('/api/professor/students')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setStudents(data); })
      .catch(err => console.log('Professor fallback students'));
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>
      {selected ? (
        <StudentDetail student={selected} onBack={() => setSelected(null)} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 2, padding: 'var(--s3)', background: 'var(--deep)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {[{ v: students.length, l: 'Estudiantes', c: 'var(--violet)' }, { v: students.reduce((a,s)=>a+s.nodes,0), l: 'Nodos totales', c: 'var(--violet-bright)' }, { v: students.length > 0 ? (students.reduce((a,s)=>a+s.depth,0)/students.length).toFixed(1) : 0, l: 'Profundidad media', c: 'var(--text)' }, { v: students.length > 0 ? Math.round(students.reduce((a,s)=>a+s.score,0)/students.length) : 0, l: 'Score promedio', c: 'var(--warn)' }].map(({ v, l, c }) => (
              <div key={l} style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s2) var(--s3)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: c, fontFamily: 'JetBrains Mono', marginBottom: 2 }}>{v}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Hint */}
          <div style={{ padding: '8px var(--s4)', borderBottom: '1px solid var(--border)', background: 'var(--void)', flexShrink: 0, fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)' }}>
            Haz clic en un estudiante para auditar su árbol de conversaciones con la IA y su grafo de pensamiento →
          </div>

          {/* Kanban */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {COLUMNS.map(col => {
              const colStudents = students.filter(s => s.status === col.id);
              return (
                <div key={col.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: 40, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 var(--s3)', flexShrink: 0, background: 'var(--deep)' }}>
                    <span style={{ width: 8, height: 8, background: col.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{col.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, background: 'var(--slate)', border: '1px solid var(--border)', padding: '1px 6px', color: 'var(--text-muted)' }}>{colStudents.length}</span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s2)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                    {colStudents.map(s => <StudentCard key={s.id} student={s} onClick={setSelected} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ProfessorScreen });
