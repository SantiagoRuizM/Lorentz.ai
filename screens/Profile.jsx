
// Profile.jsx — Student profile & cumulative score
const { useState, useRef, useEffect } = React;

const GRAPH_NODES = [
{ id: 'root', label: 'LORENTZ', isRoot: true, hash: '0x6e54', module: 'synaptrac' },
{ id: 'n1', label: 'Dil. temp.', type: 'branch', hash: '0x7a3f', module: 'synaptrac' },
{ id: 'n2', label: 'Paradoja', type: 'branch', hash: '0x9c4d', module: 'synaptrac' },
{ id: 'n3', label: 'Geodésica', type: 'leaf', hash: '0x2e7c', module: 'synaptrac' },
{ id: 'n4', label: 'Factor γ', type: 'branch', hash: '0x4f2a', module: 'synaptrac' },
{ id: 'n5', label: 'Maxwell', type: 'leaf', hash: '0x8b3d', module: 'discursus' },
{ id: 'n6', label: 'Inv. c', type: 'leaf', hash: '0x6a2b', module: 'synaptrac' },
{ id: 'n7', label: 'Éter', type: 'leaf', hash: '0x3c9e', module: 'discursus' },
{ id: 'n8', label: 'Commit-1', type: 'leaf', hash: '0x1d4e', module: 'kmerge' },
{ id: 'n9', label: 'Minkowski', type: 'branch', hash: '0x5b9a', module: 'synaptrac' },
{ id: 'n10', label: 'Curvatura', type: 'leaf', hash: '0x7f2c', module: 'synaptrac' }];


const GRAPH_EDGES = [
{ source: 'root', target: 'n1' }, { source: 'root', target: 'n4' }, { source: 'root', target: 'n9' },
{ source: 'n1', target: 'n2' }, { source: 'n1', target: 'n6' },
{ source: 'n2', target: 'n3' }, { source: 'n4', target: 'n5' }, { source: 'n4', target: 'n7' },
{ source: 'n4', target: 'n8' }, { source: 'n9', target: 'n10' }];


const ACTIVITY = [
{ day: 'Lun', synaptrac: 4, kmerge: 1, discursus: 0 },
{ day: 'Mar', synaptrac: 7, kmerge: 3, discursus: 2 },
{ day: 'Mié', synaptrac: 2, kmerge: 0, discursus: 4 },
{ day: 'Jue', synaptrac: 9, kmerge: 5, discursus: 1 },
{ day: 'Vie', synaptrac: 6, kmerge: 2, discursus: 3 },
{ day: 'Sáb', synaptrac: 3, kmerge: 1, discursus: 0 },
{ day: 'Hoy', synaptrac: 5, kmerge: 2, discursus: 2 }];


const RECENT_EVENTS = [
{ type: 'NODE_CREATED', text: 'Nodo "Factor γ de Lorentz" creado', ts: 'hace 12 min', module: 'synaptrac' },
{ type: 'COMMIT_MERGED', text: 'Commit en Relatividad_Especial.md', ts: 'hace 28 min', module: 'kmerge' },
{ type: 'VOICE_NODE', text: 'Intervención extraída en Discursus sesión 7', ts: 'hace 1h', module: 'discursus' },
{ type: 'NODE_CREATED', text: 'Nodo "Invariancia de c" creado', ts: 'hace 2h', module: 'synaptrac' }];


const MOD_COLOR = { synaptrac: 'var(--violet)', kmerge: 'var(--success)', discursus: 'var(--warn)' };

function MiniBar({ value, max, color }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ height: 40, display: 'flex', alignItems: 'flex-end', width: '100%', justifyContent: 'center', gap: 2 }}>
        {Object.entries(value).filter(([k]) => k !== 'day').map(([mod, v]) =>
        <div key={mod} style={{
          width: 5, height: `${v / max * 100}%`, minHeight: 2,
          background: MOD_COLOR[mod] || 'var(--border)',
          borderRadius: '1px 1px 0 0', transition: 'height 0.4s ease'
        }} />
        )}
      </div>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-dim)' }}>{value.day}</span>
    </div>);

}

function RadarChart({ scores }) {
  const size = 120,cx = size / 2,cy = size / 2,r = 45;
  const axes = scores.map((s, i) => {
    const angle = i / scores.length * Math.PI * 2 - Math.PI / 2;
    return { ...s, angle, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
  const points = axes.map((a) => {
    const pct = a.value / 100;
    return `${cx + Math.cos(a.angle) * r * pct},${cy + Math.sin(a.angle) * r * pct}`;
  }).join(' ');
  const gridPoints = (pct) => axes.map((a) =>
  `${cx + Math.cos(a.angle) * r * pct},${cy + Math.sin(a.angle) * r * pct}`
  ).join(' ');

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map((p) =>
      <polygon key={p} points={gridPoints(p)} fill="none" stroke="var(--border)" strokeWidth="0.5" />
      )}
      {axes.map((a) =>
      <line key={a.label} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke="var(--border)" strokeWidth="0.5" />
      )}
      <polygon points={points} fill="rgba(110,84,255,0.2)" stroke="var(--violet)" strokeWidth="1.5" />
      {axes.map((a) => {
        const pct = a.value / 100;
        const px = cx + Math.cos(a.angle) * r * pct;
        const py = cy + Math.sin(a.angle) * r * pct;
        return <rect key={a.label} x={px - 2} y={py - 2} width={4} height={4} fill="var(--violet)" />;
      })}
      {axes.map((a) =>
      <text key={a.label + 'lbl'} x={a.x + Math.cos(a.angle) * 14} y={a.y + Math.sin(a.angle) * 14}
      textAnchor="middle" dominantBaseline="middle"
      fill="var(--text-dim)" fontSize="7" fontFamily="JetBrains Mono">
          {a.label}
        </text>
      )}
    </svg>);

}

function ProfileScreen() {
  const [graphW, setGraphW] = useState(300);
  const [graphH, setGraphH] = useState(280);
  const graphRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        setGraphW(e.contentRect.width);
        setGraphH(e.contentRect.height);
      }
    });
    if (graphRef.current) obs.observe(graphRef.current);
    return () => obs.disconnect();
  }, []);

  const radarData = [
  { label: 'Depth', value: 84 },
  { label: 'Synap', value: 91 },
  { label: 'K-Mrg', value: 72 },
  { label: 'Disc.', value: 65 },
  { label: 'Chain', value: 88 }];


  const maxActivity = Math.max(...ACTIVITY.flatMap((d) => [d.synaptrac, d.kmerge, d.discursus]));

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>

      {/* Left column */}
      <div style={{
        width: 280, flexShrink: 0, borderRight: '1px solid var(--border)',
        background: 'var(--deep)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Identity card */}
        <div style={{ padding: 'var(--s4)', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '2px',
            background: 'linear-gradient(135deg, var(--violet-deep), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 'var(--s3)',
            boxShadow: '4px 4px 0 var(--violet-deep)'
          }}>L</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Johannes Droste

          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)', marginBottom: 'var(--s2)' }}>
            Estudiante · Semestre 3
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ padding: '3px 7px', background: 'var(--violet-10)', border: '1px solid var(--violet-20)', fontSize: 10, color: 'var(--violet-bright)', fontFamily: 'JetBrains Mono' }}>Relatividad Especial

            </span>
            <span style={{ padding: '3px 7px', background: 'var(--slate)', border: '1px solid var(--border)', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
              ACTIVO
            </span>
          </div>
        </div>

        {/* Score breakdown */}
        <div style={{ padding: 'var(--s3)', borderBottom: '1px solid var(--border)' }}>
          <span className="label" style={{ display: 'block', marginBottom: 'var(--s2)' }}>SCORE GLOBAL</span>
          <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--violet-bright)', lineHeight: 1, marginBottom: 8 }}>
            91
          </div>
          <div style={{ height: 4, background: 'var(--border)', marginBottom: 8 }}>
            <div style={{ height: '100%', width: '91%', background: 'linear-gradient(90deg, var(--violet-deep), var(--violet))' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top 8% del curso · +3.2 esta semana</div>
        </div>

        {/* Radar */}
        <div style={{ padding: 'var(--s3)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="label" style={{ display: 'block', marginBottom: 'var(--s2)', alignSelf: 'flex-start' }}>PERFIL COGNITIVO</span>
          <RadarChart scores={radarData} />
        </div>

        {/* Stats */}
        <div style={{ padding: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
          { l: 'Nodos creados', v: GRAPH_NODES.length },
          { l: 'Conexiones', v: GRAPH_EDGES.length },
          { l: 'Profundidad máx.', v: '8.4' },
          { l: 'Hashes en L2', v: 24 },
          { l: 'Commits K-Merge', v: 7 }].
          map(({ l, v }) =>
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{v}</span>
            </div>
          )}
        </div>
      </div>

      {/* Center — full graph */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 42, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--s3)', flexShrink: 0 }}>
          <span className="label">GRAFO DE CONOCIMIENTO ACUMULADO</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {Object.entries(MOD_COLOR).map(([mod, color]) =>
            <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, background: color }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{mod}</span>
              </div>
            )}
          </div>
        </div>
        <div ref={graphRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GraphCanvas nodes={GRAPH_NODES} edges={GRAPH_EDGES} width={graphW} height={graphH} />
        </div>

        {/* Activity chart */}
        <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--s3)', flexShrink: 0, background: 'var(--deep)' }}>
          <span className="label" style={{ display: 'block', marginBottom: 'var(--s2)' }}>ACTIVIDAD POR DÍA</span>
          <div style={{ display: 'flex', gap: 4, height: 60, alignItems: 'flex-end' }}>
            {ACTIVITY.map((d, i) =>
            <MiniBar key={d.day} value={d} max={maxActivity} />
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {Object.entries(MOD_COLOR).map(([mod, color]) =>
            <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 3, background: color }} />
                <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{mod}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right — recent events */}
      <div style={{ width: 260, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'var(--deep)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 42, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 var(--s3)', flexShrink: 0 }}>
          <span className="label">ACTIVIDAD RECIENTE</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {RECENT_EVENTS.map((ev, i) =>
          <div key={i} style={{
            padding: 'var(--s2) var(--s3)',
            borderBottom: '1px solid var(--border-subtle)',
            animation: `slideIn 0.2s ${i * 0.06}s ease both`
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ width: 6, height: 6, background: MOD_COLOR[ev.module], flexShrink: 0 }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{ev.ts}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{ev.text}</p>
            </div>
          )}
        </div>
        <div style={{ padding: 'var(--s3)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--success)', padding: '5px 8px', background: 'rgba(78,236,170,0.05)', border: '1px solid rgba(78,236,170,0.15)', marginBottom: 8 }}>
            24 eventos hasheados · Axiom L2
          </div>
          <button style={{
            width: '100%', padding: '8px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: '2px',
            color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
            fontFamily: 'JetBrains Mono', letterSpacing: '0.06em'
          }}>VER PERFIL PÚBLICO →</button>
        </div>
      </div>
    </div>);

}

Object.assign(window, { ProfileScreen });