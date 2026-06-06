
// screens/Graph.jsx — Full graph view screen
const { useState, useRef, useEffect } = React;

const FULL_NODES = [
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
  { id: 'n10', label: 'Curvatura', type: 'leaf', hash: '0x7f2c', module: 'synaptrac' },
  { id: 'n11', label: 'Mic-Morley', type: 'branch', hash: '0xa2d8', module: 'discursus' },
  { id: 'n12', label: 'Drift éter', type: 'leaf', hash: '0xc4e1', module: 'discursus' },
  { id: 'n13', label: 'Rel. Especial', type: 'branch', hash: '0xf3b9', module: 'kmerge' },
  { id: 'n14', label: 'Postulados', type: 'leaf', hash: '0xd7a2', module: 'synaptrac' },
];

const FULL_EDGES = [
  { source: 'root', target: 'n1', label: 'explora' },
  { source: 'root', target: 'n4', label: 'deriva' },
  { source: 'root', target: 'n9', label: 'conecta' },
  { source: 'root', target: 'n13', label: 'sintetiza' },
  { source: 'n1', target: 'n2', label: '' },
  { source: 'n1', target: 'n6', label: '' },
  { source: 'n2', target: 'n3', label: '' },
  { source: 'n4', target: 'n5', label: '' },
  { source: 'n4', target: 'n7', label: '' },
  { source: 'n4', target: 'n8', label: '' },
  { source: 'n9', target: 'n10', label: '' },
  { source: 'n11', target: 'n12', label: '' },
  { source: 'root', target: 'n11', label: '' },
  { source: 'n13', target: 'n14', label: '' },
];

const MOD_COLOR = { synaptrac: 'var(--violet)', kmerge: 'var(--success)', discursus: 'var(--warn)' };

function GraphScreen() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filter, setFilter] = useState('all');
  const [graphW, setGraphW] = useState(800);
  const [graphH, setGraphH] = useState(600);
  const graphRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setGraphW(e.contentRect.width);
        setGraphH(e.contentRect.height);
      }
    });
    if (graphRef.current) obs.observe(graphRef.current);
    return () => obs.disconnect();
  }, []);

  const visibleNodes = filter === 'all' ? FULL_NODES : FULL_NODES.filter(n => n.isRoot || n.module === filter);
  const visibleEdges = FULL_EDGES.filter(e =>
    visibleNodes.find(n => n.id === e.source) && visibleNodes.find(n => n.id === e.target)
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>

      {/* Controls sidebar */}
      <div style={{
        width: 200, flexShrink: 0, background: 'var(--deep)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ height: 42, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 var(--s3)', flexShrink: 0 }}>
          <span className="label">FILTROS</span>
        </div>
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
              {f !== 'all' && <span style={{ width: 6, height: 6, background: MOD_COLOR[f], flexShrink: 0 }} />}
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ padding: 'var(--s3)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <span className="label" style={{ display: 'block', marginBottom: 8 }}>ESTADÍSTICAS</span>
          {[
            { l: 'Nodos visibles', v: visibleNodes.length },
            { l: 'Conexiones', v: visibleEdges.length },
            { l: 'Profundidad máx.', v: '4' },
          ].map(({ l, v }) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph canvas */}
      <div ref={graphRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GraphCanvas nodes={visibleNodes} edges={visibleEdges} width={graphW} height={graphH} />

        {/* Legend overlay */}
        <div style={{
          position: 'absolute', bottom: 'var(--s4)', left: 'var(--s4)',
          background: 'rgba(7,7,14,0.88)', border: '1px solid var(--border)',
          padding: 'var(--s2) var(--s3)', backdropFilter: 'blur(4px)',
        }}>
          <div className="label" style={{ marginBottom: 8 }}>LEYENDA</div>
          {[
            { color: 'var(--violet)', label: 'Nodo raíz' },
            { color: 'var(--violet-bright)', label: 'Rama activa' },
            { color: 'var(--violet-deep)', label: 'Hoja / convergido' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6 }}>
            {Object.entries(MOD_COLOR).map(([mod, color]) => (
              <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 5, height: 5, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>{mod}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cursor hint */}
        <div style={{
          position: 'absolute', top: 'var(--s3)', right: 'var(--s3)',
          fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)',
          background: 'rgba(7,7,14,0.7)', padding: '4px 8px', backdropFilter: 'blur(4px)',
        }}>
          FÍSICA SIMULADA ACTIVA · {visibleNodes.length} nodos
        </div>
      </div>

      {/* Node detail panel */}
      <div style={{
        width: 240, flexShrink: 0, borderLeft: '1px solid var(--border)',
        background: 'var(--deep)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ height: 42, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 var(--s3)', flexShrink: 0 }}>
          <span className="label">DETALLE DE NODO</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
          {FULL_NODES.map((node, i) => (
            <div
              key={node.id}
              style={{
                padding: 'var(--s2)', background: 'var(--card)',
                border: '1px solid var(--border)', borderRadius: '2px',
                cursor: 'pointer', transition: 'all 150ms ease',
                borderLeft: `2px solid ${node.isRoot ? 'var(--violet)' : node.type === 'branch' ? 'var(--violet-bright)' : 'var(--violet-deep)'}`,
                animation: `slideIn 0.15s ${Math.min(i * 0.04, 0.4)}s ease both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{node.label}</span>
                <span style={{ width: 5, height: 5, background: MOD_COLOR[node.module] || 'var(--border)', flexShrink: 0, marginTop: 3 }} />
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{node.hash}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GraphScreen });
