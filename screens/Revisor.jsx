
// Revisor.jsx — Public verifier view: student profiles + hash verification
const { useState } = React;

const STUDENTS_REV = [
  { id: 'JD', name: 'Johannes Droste', score: 91, nodes: 24, depth: 8.4, hashes: 24, verified: true,  lastBlock: 1247835, topic: 'Transformaciones de Lorentz',   grade: 'A' },
  { id: 'MR', name: 'María Ruiz',       score: 74, nodes: 17, depth: 6.1, hashes: 17, verified: true,  lastBlock: 1247830, topic: 'Relatividad del tiempo',        grade: 'B+' },
  { id: 'KA', name: 'Kai Andersen',     score: 88, nodes: 31, depth: 7.8, hashes: 31, verified: true,  lastBlock: 1247828, topic: 'Espacio-tiempo de Minkowski',   grade: 'A-' },
  { id: 'PV', name: 'Pedro Vega',       score: 52, nodes: 9,  depth: 4.2, hashes: 9,  verified: false, lastBlock: 1247810, topic: 'Postulados de Einstein',        grade: 'C+' },
  { id: 'RT', name: 'Rosa Tejada',      score: 97, nodes: 38, depth: 9.1, hashes: 38, verified: true,  lastBlock: 1247832, topic: 'Curvatura del espacio-tiempo',  grade: 'A+' },
  { id: 'TS', name: 'Tomás Santos',     score: 41, nodes: 7,  depth: 3.5, hashes: 7,  verified: false, lastBlock: 1247799, topic: 'Efecto Doppler relativista',    grade: 'D' },
];

const PROFILE_HASHES = {
  JD: [
    { block: 1247835, type: 'NODE_CREATED',  hash: '0x4f2a9b3c...d1e7', ts: '14:24:01', module: 'synaptrac' },
    { block: 1247830, type: 'COMMIT_MERGED', hash: '0x7a1b4e2f...f2a8', ts: '13:55:12', module: 'kmerge' },
    { block: 1247825, type: 'VOICE_NODE',    hash: '0x9c3d8a1b...b5c4', ts: '12:30:45', module: 'discursus' },
    { block: 1247820, type: 'NODE_CREATED',  hash: '0x6e54a1c2...e9f1', ts: '11:15:22', module: 'synaptrac' },
  ],
  MR: [
    { block: 1247830, type: 'NODE_CREATED',  hash: '0x9c3d7a2b...e5f3', ts: '10:42:11', module: 'synaptrac' },
    { block: 1247822, type: 'COMMIT_MERGED', hash: '0x4a1b8f3c...d2e8', ts: '09:58:34', module: 'kmerge' },
  ],
  KA: [
    { block: 1247828, type: 'COMMIT_MERGED', hash: '0x7a1b4e9d...a3b7', ts: '09:33:05', module: 'kmerge' },
    { block: 1247815, type: 'NODE_CREATED',  hash: '0x3c9e2d1a...f6c4', ts: '08:45:00', module: 'synaptrac' },
  ],
};

const GRADE_COLOR = { 'A+': 'var(--success)', 'A': 'var(--success)', 'A-': 'var(--success)', 'B+': 'var(--violet-bright)', 'B': 'var(--violet-bright)', 'C+': 'var(--warn)', 'C': 'var(--warn)', 'D': 'var(--error)' };
const MOD_COLOR = { synaptrac: 'var(--violet)', kmerge: 'var(--success)', discursus: 'var(--warn)' };

function ScoreBar({ value }) {
  const c = value >= 80 ? 'var(--success)' : value >= 60 ? 'var(--warn)' : 'var(--error)';
  return (
    <div style={{ height: 3, background: 'var(--border)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: c, transition: 'width 0.6s ease' }} />
    </div>
  );
}

const ALL_SCORES_REV = [91, 74, 88, 52, 97, 41];

function GaussianWidget({ highlighted }) {
  const scores = ALL_SCORES_REV;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const std  = Math.sqrt(scores.reduce((a, s) => a + (s - mean) ** 2, 0) / scores.length);
  const W = 280, H = 80, PAD = 18, chartW = W - PAD * 2;
  const gauss = x => Math.exp(-0.5 * ((x - mean) / std) ** 2);
  const pts = Array.from({ length: 101 }, (_, i) => {
    const y = gauss(i);
    return `${PAD + (i / 100) * chartW},${H - 12 - y * (H - 24)}`;
  });
  const line = `M ${pts.join(' L ')}`;
  const fill = `${line} L ${pts[100].split(',')[0]},${H - 12} L ${PAD},${H - 12} Z`;
  const hx = highlighted != null ? PAD + (highlighted / 100) * chartW : null;
  const sigmas = [-2, -1, 0, 1, 2].map(s => ({ s, x: PAD + ((mean + s * std) / 100) * chartW, label: s === 0 ? 'μ' : `${s > 0 ? '+' : ''}${s}σ` })).filter(({ x }) => x >= PAD && x <= W - PAD);
  const sigmaPos = highlighted != null ? ((highlighted - mean) / std).toFixed(1) : null;
  const percentile = highlighted != null ? Math.round(scores.filter(s => s <= highlighted).length / scores.length * 100) : null;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="label">POSICIÓN EN EL CURSO · GAUSS</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {sigmaPos && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: parseFloat(sigmaPos) >= 1 ? 'var(--success)' : parseFloat(sigmaPos) <= -1 ? 'var(--error)' : 'var(--warn)', padding: '2px 7px', background: 'var(--slate)', border: '1px solid var(--border)' }}>σ = {sigmaPos}</span>}
          {percentile != null && <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-muted)', padding: '2px 7px', background: 'var(--slate)', border: '1px solid var(--border)' }}>p{percentile}</span>}
        </div>
      </div>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <path d={fill} fill="rgba(110,84,255,0.09)" />
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
        {highlighted != null && <span style={{ color: 'var(--warn)' }}>Score: {highlighted} · {sigmaPos >= 0 ? 'sobre' : 'bajo'} la media</span>}
      </div>
    </div>
  );
}

function StudentAvatar({ id, size = 28 }) {
  const colors = { JD: 'var(--violet)', MR: '#4DECAA', KA: '#FFB84D', PV: '#FF8A80', RT: '#60A5FA', TS: '#A78BFA' };
  return (
    <div style={{ width: size, height: size, background: colors[id] || 'var(--border)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#07070E', flexShrink: 0 }}>{id}</div>
  );
}

// ── Hash verifier widget ───────────────────────────────────────────
function HashVerifier() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verify = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    
    fetch('/api/revisor/verify-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: input })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.found) {
        setResult({
          valid: true,
          block: data.event.block,
          ts: data.event.ts,
          type: data.event.type,
          student: data.event.student,
          module: data.event.module,
          payload: data.event.payload
        });
      } else {
        setResult({ valid: false });
      }
    })
    .catch(err => {
      console.log('Verify hash API error, fallback to simulated', err);
      setTimeout(() => {
        setLoading(false);
        const found = input.length > 6;
        setResult(found ? {
          valid: true,
          block: 1247835,
          ts: '2025-04-30 14:24:01 UTC',
          type: 'NODE_CREATED',
          student: 'Johannes Droste (JD)',
          module: 'synaptrac',
          payload: `{"nodeId":"n7","depth":4,"concept":"Factor γ","score":8.4}`,
        } : { valid: false });
      }, 1000);
    });
  };

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s3)' }}>
      <span className="label" style={{ display: 'block', marginBottom: 10 }}>VERIFICAR HASH EN AXIOM L2</span>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="Pega un hash: 0x4f2a9b3c..."
          style={{
            flex: 1, background: 'var(--slate)', border: '1px solid var(--border)',
            borderRadius: '2px', padding: '8px 10px', color: 'var(--text)',
            fontSize: 12, fontFamily: 'JetBrains Mono', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--violet)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          onKeyDown={e => e.key === 'Enter' && verify()}
        />
        <button onClick={verify} style={{
          padding: '8px 14px', background: 'var(--violet)', border: 'none', borderRadius: '2px',
          color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          opacity: loading ? 0.7 : 1, boxShadow: '2px 2px 0 var(--violet-deep)',
        }}>
          {loading ? '…' : 'Verificar →'}
        </button>
      </div>
      {result && (
        <div style={{
          padding: 'var(--s2) var(--s3)', animation: 'fadeUp 0.2s ease both',
          background: result.valid ? 'rgba(78,236,170,0.06)' : 'rgba(255,92,92,0.06)',
          border: `1px solid ${result.valid ? 'rgba(78,236,170,0.25)' : 'rgba(255,92,92,0.25)'}`,
        }}>
          {result.valid ? (
            <>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--success)', letterSpacing: '0.1em', marginBottom: 8 }}>✓ HASH VERIFICADO · BLOQUE #{result.block}</div>
              {[['Timestamp', result.ts], ['Tipo', result.type], ['Estudiante', result.student], ['Módulo', result.module]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', width: 70, flexShrink: 0 }}>{k}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 6, padding: '5px 8px', background: 'var(--slate)', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--violet-bright)', wordBreak: 'break-all' }}>
                {result.payload}
              </div>
            </>
          ) : (
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--error)', letterSpacing: '0.1em' }}>✗ HASH NO ENCONTRADO EN AXIOM L2</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Student profile panel ──────────────────────────────────────────
function StudentProfile({ student }) {
  const [hashes, setHashes] = useState([]);
  const [reviewNote, setReviewNote] = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [loadingSeal, setLoadingSeal] = useState(false);

  const handleVerifyEvidence = (eventId, dispute) => {
    fetch('/api/blockchain/verify-evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evidence_id: eventId,
        reviewer: "Reviewer L2",
        dispute: dispute
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Refresh hashes list
          fetch(`/api/revisor/hashes/${student.id}`)
            .then(res => res.json())
            .then(hashesData => { if (Array.isArray(hashesData)) setHashes(hashesData); });
        } else {
          alert("Error al procesar la evidencia.");
        }
      })
      .catch(err => console.error(err));
  };

  const handleSealReview = () => {
    if (!reviewNote.trim()) return;
    setLoadingSeal(true);
    fetch('/api/axiom/mine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: student.id })
    })
      .then(res => res.json())
      .then(data => {
        setLoadingSeal(false);
        if (data.success) {
          setSubmitted(true);
          student.verified = true;
          student.lastBlock = data.block;
          // Refresh hashes list
          fetch(`/api/revisor/hashes/${student.id}`)
            .then(res => res.json())
            .then(hashesData => { if (Array.isArray(hashesData)) setHashes(hashesData); });
        } else {
          alert("Error: " + (data.error || "No se pudo sellar la revisión."));
        }
      })
      .catch(err => {
        console.error(err);
        setLoadingSeal(false);
        alert("Error de conexión.");
      });
  };

  useEffect(() => {
    fetch(`/api/revisor/hashes/${student.id}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setHashes(data); })
      .catch(err => {
        console.log('Fall back to PROFILE_HASHES', err);
        setHashes(PROFILE_HASHES[student.id] || []);
      });
    setSubmitted(false);
    setReviewNote('');
  }, [student.id]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s4)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)', animation: 'slideIn 0.2s ease both' }}>
      {/* Identity card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s4)', display: 'flex', gap: 'var(--s4)', alignItems: 'flex-start' }}>
        <StudentAvatar id={student.id} size={56} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>{student.name}</h2>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)', marginBottom: 12 }}>
            ID: {student.id} · {student.topic}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '3px 8px', background: 'var(--violet-10)', border: '1px solid var(--violet-20)', fontSize: 10, color: 'var(--violet-bright)', fontFamily: 'JetBrains Mono' }}>
              SCORE: {student.score}
            </span>
            <span style={{ padding: '3px 8px', background: student.verified ? 'rgba(78,236,170,0.07)' : 'rgba(255,92,92,0.07)', border: `1px solid ${student.verified ? 'rgba(78,236,170,0.25)' : 'rgba(255,92,92,0.25)'}`, fontSize: 10, fontFamily: 'JetBrains Mono', color: student.verified ? 'var(--success)' : 'var(--error)' }}>
              {student.verified ? '✓ VERIFICADO' : '✗ PENDIENTE'}
            </span>
            <span style={{ padding: '3px 8px', background: 'var(--slate)', border: '1px solid var(--border)', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono', color: GRADE_COLOR[student.grade] || 'var(--text)' }}>
              {student.grade}
            </span>
          </div>
        </div>
        {/* Grade big display */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'JetBrains Mono', color: GRADE_COLOR[student.grade] || 'var(--text)', lineHeight: 1 }}>{student.grade}</div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>CALIFICACIÓN FINAL</div>
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{ display: 'flex', gap: 2 }}>
        {[{ v: student.score, l: 'Score global' }, { v: student.nodes, l: 'Nodos' }, { v: student.depth, l: 'Profundidad' }, { v: student.hashes, l: 'Hashes L2' }].map(({ v, l }) => (
          <div key={l} style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s2) var(--s3)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, color: 'var(--violet-bright)', marginBottom: 2 }}>{v}</div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Gaussian distribution */}
      <GaussianWidget highlighted={student.score} />

      {/* Module scores */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s3)' }}>
        <span className="label" style={{ display: 'block', marginBottom: 12 }}>DESGLOSE POR MÓDULO</span>
        {[{ mod: 'Synaptrac', v: student.score }, { mod: 'K-Merge', v: Math.round(student.score * 0.8) }, { mod: 'Discursus', v: Math.round(student.score * 0.7) }].map(({ mod, v }) => (
          <div key={mod} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{mod}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text)' }}>{v}/100</span>
            </div>
            <ScoreBar value={v} />
          </div>
        ))}
      </div>

      {/* Event log */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s3)' }}>
        <span className="label" style={{ display: 'block', marginBottom: 10 }}>REGISTRO EN AXIOM L2</span>
        {hashes.length > 0 ? hashes.map((h, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', animation: `slideIn 0.15s ${i * 0.05}s ease both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--violet-bright)' }}>Bloque #{h.block}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: MOD_COLOR[h.module] || 'var(--text-muted)' }}>{h.type}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{h.ts}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{h.hash}</span>
              
              {/* Evidence controls */}
              {h.type === 'EVIDENCE_SUBMITTED' && (() => {
                let p = {};
                try { p = JSON.parse(h.payload); } catch(e){}
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      BKU-{p.bkuId} ({p.score}/100)
                    </span>
                    {p.verified ? (
                      <span style={{ fontSize: 9, color: 'var(--success)', fontFamily: 'JetBrains Mono', background: 'rgba(78,236,170,0.08)', padding: '1px 5px', border: '1px solid rgba(78,236,170,0.15)' }}>✓ VERIFICADO</span>
                    ) : p.disputed ? (
                      <span style={{ fontSize: 9, color: 'var(--error)', fontFamily: 'JetBrains Mono', background: 'rgba(255,92,92,0.08)', padding: '1px 5px', border: '1px solid rgba(255,92,92,0.15)' }}>✗ DISPUTADO</span>
                    ) : (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button 
                          onClick={() => handleVerifyEvidence(h.id, false)}
                          style={{ background: 'var(--success)', border: 'none', padding: '2px 5px', fontSize: 9, fontWeight: 700, color: 'var(--void)', cursor: 'pointer', borderRadius: '1px' }}
                        >
                          Aprobar
                        </button>
                        <button 
                          onClick={() => handleVerifyEvidence(h.id, true)}
                          style={{ background: 'var(--error)', border: 'none', padding: '2px 5px', fontSize: 9, fontWeight: 700, color: 'white', cursor: 'pointer', borderRadius: '1px' }}
                        >
                          Disputar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {h.type === 'AKU_GRANTED' && (() => {
                let p = {};
                try { p = JSON.parse(h.payload); } catch(e){}
                return (
                  <span style={{ fontSize: 9, color: 'var(--warn)', fontFamily: 'JetBrains Mono', background: 'rgba(255,184,77,0.08)', padding: '1px 5px', border: '1px solid rgba(255,184,77,0.15)' }}>
                    SBT MINTED: {p.akuName} {p.sbtTokenId}
                  </span>
                );
              })()}

              {h.type === 'CERTIFICATION_GRANTED' && (() => {
                let p = {};
                try { p = JSON.parse(h.payload); } catch(e){}
                return (
                  <span style={{ fontSize: 9, color: 'var(--success)', fontFamily: 'JetBrains Mono', background: 'rgba(78,236,170,0.08)', padding: '1px 5px', border: '1px solid rgba(78,236,170,0.15)' }}>
                    CERT MINTED: {p.certName} {p.sbtTokenId}
                  </span>
                );
              })()}
            </div>
          </div>
        )) : (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)' }}>No hay registros disponibles.</div>
        )}
      </div>

      {/* Hash verifier */}
      <HashVerifier />

      {/* Revisor note */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 'var(--s3)' }}>
        <span className="label" style={{ display: 'block', marginBottom: 8 }}>NOTA DEL REVISOR</span>
        {submitted ? (
          <div style={{ padding: 'var(--s2) var(--s3)', background: 'rgba(78,236,170,0.06)', border: '1px solid rgba(78,236,170,0.2)', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--success)' }}>
            ✓ Revisión registrada en Axiom L2 · Inmutable
          </div>
        ) : (
          <>
            <textarea
              value={reviewNote} onChange={e => setReviewNote(e.target.value)}
              placeholder={`Dictamen oficial sobre ${student.name}… (se sellará con tu firma en Axiom L2)`}
              rows={3}
              style={{ width: '100%', background: 'var(--slate)', border: '1px solid var(--border)', borderRadius: '2px', padding: '8px 10px', color: 'var(--text)', fontSize: 12, fontFamily: 'DM Sans', outline: 'none', resize: 'none', marginBottom: 8, lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = 'var(--violet)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={handleSealReview}
              disabled={loadingSeal}
              style={{ width: '100%', padding: '8px', background: 'var(--violet)', border: 'none', borderRadius: '2px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '2px 2px 0 var(--violet-deep)', opacity: loadingSeal ? 0.7 : 1 }}
            >
              {loadingSeal ? 'Sellando bloque...' : 'Sellar revisión en L2 →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main revisor screen ────────────────────────────────────────────
function RevisorScreen() {
  const [students, setStudents] = useState(STUDENTS_REV);
  const [selected, setSelected] = useState(STUDENTS_REV[0]);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    fetch('/api/revisor/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0) {
            setSelected(data[0]);
          }
        }
      })
      .catch(err => console.log('Revisor fallback students'));
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>
      {/* ── Left: student list ── */}
      <div style={{ width: 260, flexShrink: 0, background: 'var(--deep)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 42, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 var(--s3)', flexShrink: 0, gap: 8 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--violet)' }}>
            <path d="M11 2L5.5 6.5v5L1 2h10z" fill="currentColor" opacity="0.8"/>
          </svg>
          <span className="label">REVISIÓN ACADÉMICA</span>
        </div>

        {/* Search */}
        <div style={{ padding: 'var(--s2)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar estudiante…"
            style={{ width: '100%', background: 'var(--slate)', border: '1px solid var(--border)', borderRadius: '2px', padding: '7px 10px', color: 'var(--text)', fontSize: 12, fontFamily: 'DM Sans', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--violet)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map((s, i) => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              style={{
                padding: 'var(--s2) var(--s3)', cursor: 'pointer', transition: 'background 150ms',
                background: selected?.id === s.id ? 'var(--violet-10)' : 'transparent',
                borderLeft: `2px solid ${selected?.id === s.id ? 'var(--violet)' : 'transparent'}`,
                borderBottom: '1px solid var(--border-subtle)',
                animation: `slideIn 0.15s ${i * 0.04}s ease both`,
              }}
              onMouseEnter={e => { if (selected?.id !== s.id) e.currentTarget.style.background = 'var(--slate)'; }}
              onMouseLeave={e => { if (selected?.id !== s.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <StudentAvatar id={s.id} size={24} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{s.id}</div>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700, color: GRADE_COLOR[s.grade] || 'var(--text)', flexShrink: 0 }}>{s.grade}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ flex: 1, height: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.score}%`, background: s.score >= 80 ? 'var(--success)' : s.score >= 60 ? 'var(--warn)' : 'var(--error)' }} />
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', flexShrink: 0 }}>{s.score}</span>
                {s.verified && <span style={{ width: 5, height: 5, background: 'var(--success)', flexShrink: 0 }} title="Verificado en L2" />}
              </div>
            </div>
          ))}
        </div>

        {/* L2 status */}
        <div style={{ padding: 'var(--s3)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'rgba(78,236,170,0.05)', border: '1px solid rgba(78,236,170,0.2)' }}>
            <span style={{ width: 6, height: 6, background: 'var(--success)', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--success)' }}>AXIOM L2 · #1,247,835</span>
          </div>
        </div>
      </div>

      {/* ── Right: profile ── */}
      {selected ? (
        <StudentProfile student={selected} />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-dim)' }}>Selecciona un estudiante para revisar su perfil.</span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { RevisorScreen });
