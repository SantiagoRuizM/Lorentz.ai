
// Synaptrac.jsx — Main AI chat + thought graph (updated: D/C buttons + Johannes Droste)
const { useState, useRef, useEffect, useCallback } = React;

const STUDENT_NAME = 'Johannes Droste';
const STUDENT_ID   = 'JD';

// ── Conversation ──────────────────────────────────────────────────
const INITIAL_MESSAGES = [
  {
    id: 'm1', role: 'ai', timestamp: '14:18:04', nodeId: 'root',
    text: `Bienvenido de vuelta, ${STUDENT_NAME}. El tema asignado para esta sesión es Transformaciones de Lorentz en marcos de referencia inerciales. ¿Por dónde quieres comenzar el análisis?`,
    concepts: [],
  },
  {
    id: 'm2', role: 'student', timestamp: '14:19:22',
    text: 'Quiero entender la dilatación temporal. ¿Por qué un observador en movimiento experimenta el tiempo más lento desde otro frame?',
    concepts: [],
  },
  {
    id: 'm3', role: 'ai', timestamp: '14:20:11', nodeId: 'n1',
    text: 'La dilatación temporal surge directamente del postulado de invariancia de c. Si Δx = 0 para un observador en reposo, el intervalo temporal medido por el observador en movimiento escala según:',
    formula: 'Δt′ = γ · Δt,  donde  γ = 1 / √(1 − v²/c²)',
    formulaNote: 'Para v → c, γ → ∞. El reloj en movimiento avanza más lento desde el frame externo.',
    concepts: [
      { id: 'c1', label: 'Factor γ de Lorentz', type: 'equation' },
      { id: 'c2', label: 'Invariancia de c',    type: 'concept' },
    ],
  },
  {
    id: 'm4', role: 'student', timestamp: '14:22:35',
    text: 'Pero si todo movimiento es relativo, ¿quién envejece más lento? Ambos observadores podrían afirmar que el otro envejece lento.',
    concepts: [],
  },
  {
    id: 'm5', role: 'ai', timestamp: '14:23:10', nodeId: 'n2',
    text: 'Correcta identificación. La asimetría surge porque los dos observadores no son equivalentes: uno permanece en un frame inercial, el otro experimenta aceleración al invertir su trayectoria. La aceleración rompe la simetría de la relatividad especial. El gemelo que regresa ha recorrido una trayectoria con menor longitud geodésica y ha envejecido menos.',
    concepts: [
      { id: 'c3', label: 'Paradoja de los Gemelos', type: 'concept' },
      { id: 'c4', label: 'Geodésica espacio-tiempo', type: 'concept' },
    ],
  },
];

const INITIAL_NODES = [
  { id: 'root', label: 'LORENTZ', isRoot: true, hash: '0x6e54', module: 'synaptrac' },
  { id: 'n1', label: 'Dil. temp.', type: 'branch', hash: '0x7a3f', module: 'synaptrac' },
  { id: 'n2', label: 'Paradoja', type: 'branch', hash: '0x9c4d', module: 'synaptrac' },
];

const INITIAL_EDGES = [
  { source: 'root', target: 'n1', label: 'explora' },
  { source: 'n1',   target: 'n2', label: 'deriva'  },
];

// ── D/C panel (Divergir / Converger) ─────────────────────────────
function DCPanel({ onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
      zIndex: 50, marginRight: -4,
      background: 'var(--card)',
      border: '1px solid var(--border-active)',
      borderRadius: '2px',
      width: 230,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 4px 4px 0 var(--violet-deep)',
      animation: 'fadeUp 0.18s cubic-bezier(0.25,0,0.35,1)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '8px 12px 6px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--violet-bright)', letterSpacing: '0.1em' }}>
          ACCIÓN DE PENSAMIENTO
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Divergir */}
        <button
          onClick={() => onSelect('divergir')}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '10px 12px', background: 'var(--slate)',
            border: '1px solid var(--border)', borderRadius: '2px',
            cursor: 'pointer', textAlign: 'left', width: '100%',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.background = 'var(--violet-10)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--slate)'; }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, color: 'var(--violet-bright)', marginTop: 1, fontWeight: 300 }}>
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="2.5" r="1.8" fill="currentColor"/><circle cx="2.5" cy="10.5" r="1.8" fill="currentColor" opacity="0.8"/><circle cx="10.5" cy="10.5" r="1.8" fill="currentColor" opacity="0.8"/><path d="M6.5 4.3V6.5M6.5 6.5L2.5 8.7M6.5 6.5L10.5 8.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontFamily: 'DM Sans' }}>Divergir</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Abre una nueva rama. Profundiza este argumento en el grafo.
            </div>
          </div>
        </button>

        {/* Converger */}
        <button
          onClick={() => onSelect('converger')}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '10px 12px', background: 'var(--slate)',
            border: '1px solid var(--border)', borderRadius: '2px',
            cursor: 'pointer', textAlign: 'left', width: '100%',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--success)'; e.currentTarget.style.background = 'rgba(78,236,170,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--slate)'; }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, color: 'var(--success)', marginTop: 1, fontWeight: 300 }}>
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><circle cx="2.5" cy="2.5" r="1.8" fill="currentColor" opacity="0.8"/><circle cx="10.5" cy="2.5" r="1.8" fill="currentColor" opacity="0.8"/><circle cx="6.5" cy="10.5" r="1.8" fill="currentColor"/><path d="M2.5 4.3L6.5 6.5M10.5 4.3L6.5 6.5M6.5 6.5V8.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontFamily: 'DM Sans' }}>Converger</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Sintetiza con la rama actual. Registra el insight y cierra.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Concept pill ──────────────────────────────────────────────────
function ConceptPill({ concept, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px',
        background: active ? 'var(--violet-20)' : 'var(--violet-06)',
        border: `1px solid ${active ? 'var(--violet)' : 'var(--violet-20)'}`,
        borderRadius: '2px',
        color: active ? 'var(--violet-bright)' : 'var(--text-muted)',
        fontSize: 11, fontWeight: 500, cursor: 'pointer',
        fontFamily: 'DM Sans',
        transition: 'all 150ms ease',
        marginRight: 4, marginTop: 4,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 9, opacity: 0.7 }}>{concept.type === 'equation' ? 'ƒ' : '◆'}</span>
      {concept.label}
    </button>
  );
}

// ── Session end card ──────────────────────────────────────────────
function SessionCard({ nodesCreated, commits }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--violet-20)', borderRadius: '2px',
      padding: 'var(--s3)', animation: 'fadeUp 0.3s ease both',
    }}>
      <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--violet-bright)', letterSpacing: '0.12em', marginBottom: 8 }}>
        RESUMEN DE SESIÓN · AXIOM L2 REGISTRADO
      </div>
      <div style={{ display: 'flex', gap: 'var(--s4)', marginBottom: 10 }}>
        {[{ v: nodesCreated, l: 'nodos' }, { v: commits, l: 'conexiones' }, { v: '0x4f2a', l: 'bloque #1,247,835' }].map(({ v, l }) => (
          <div key={l}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--violet-bright)', fontFamily: 'JetBrains Mono' }}>{v}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--success)', padding: '5px 8px', background: 'rgba(78,236,170,0.05)', border: '1px solid rgba(78,236,170,0.15)' }}>
        Hash registrado. Bloque #1,247,835 sellado.
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────
function Message({ msg, onDCAction, activeDCId }) {
  const isAI = msg.role === 'ai';
  const dcOpen = activeDCId === msg.id;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isAI ? 'flex-start' : 'flex-end',
      animation: 'fadeUp 0.28s cubic-bezier(0.25,0,0.35,1) both',
      position: 'relative',
    }}>
      {/* Meta row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
        flexDirection: isAI ? 'row' : 'row-reverse',
      }}>
        {isAI ? (
          <div style={{
            width: 20, height: 20, background: 'var(--violet)', borderRadius: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 8px rgba(110,84,255,0.5)',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L9 3v4L5 9 1 7V3L5 1z" fill="white" opacity="0.9"/>
            </svg>
          </div>
        ) : (
          <div style={{
            width: 20, height: 20, background: 'linear-gradient(135deg,var(--violet-deep),var(--violet))',
            borderRadius: '2px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white',
          }}>JD</div>
        )}
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)' }}>
          {isAI ? 'Lorentz.ai' : STUDENT_NAME} · {msg.timestamp}
          {msg.nodeId && <span style={{ marginLeft: 6, color: 'var(--violet-deep)' }}>· {msg.nodeId}</span>}
        </span>
      </div>

      {/* Bubble row with D/C button */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        flexDirection: isAI ? 'row' : 'row-reverse',
        maxWidth: '90%',
        width: '100%',
        position: 'relative',
      }}>
        {/* Message bubble */}
        <div style={{
          flex: 1,
          background: isAI ? 'var(--card)' : 'var(--slate)',
          border: `1px solid ${isAI ? 'var(--border)' : 'var(--violet-20)'}`,
          borderRadius: '2px',
          padding: 'var(--s3)',
          position: 'relative',
        }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text)', margin: 0 }}>{msg.text}</p>

          {/* Formula */}
          {msg.formula && (
            <div style={{
              marginTop: 'var(--s2)', background: 'var(--slate)',
              border: '1px solid var(--border)', borderLeft: '2px solid var(--violet)',
              borderRadius: '2px', padding: '10px 13px',
            }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 500, color: 'var(--violet-bright)', letterSpacing: '0.03em' }}>
                {msg.formula}
              </div>
              {msg.formulaNote && (
                <div style={{ marginTop: 5, fontSize: 11, color: 'var(--text-muted)' }}>{msg.formulaNote}</div>
              )}
            </div>
          )}

          {/* Concept pills */}
          {msg.concepts && msg.concepts.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', letterSpacing: '0.12em', marginBottom: 4 }}>
                CONCEPTOS DETECTADOS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {msg.concepts.map(c => (
                  <ConceptPill
                    key={c.id}
                    concept={c}
                    active={false}
                    onClick={() => onDCAction(msg.id, 'concept', c)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* D/C toggle button — always visible on AI messages */}
        {isAI && (
          <div style={{ position: 'relative', flexShrink: 0, alignSelf: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Divergir */}
              <button
                onClick={() => onDCAction(msg.id, 'divergir')}
                title="Divergir — abrir nueva rama"
                style={{
                  width: 28, height: 28,
                  background: dcOpen === 'divergir' ? 'var(--violet)' : 'var(--slate)',
                  border: `1px solid ${dcOpen === 'divergir' ? 'var(--violet)' : 'var(--border)'}`,
                  borderRadius: '2px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: dcOpen === 'divergir' ? 'white' : 'var(--text-dim)',
                  transition: 'all 150ms ease',
                  boxShadow: dcOpen === 'divergir' ? '2px 2px 0 var(--violet-deep)' : 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--violet-bright)'; }}
                onMouseLeave={e => {
                  if (dcOpen !== 'divergir') {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-dim)';
                  }
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="2.5" r="1.8" fill="currentColor"/>
                  <circle cx="2.5" cy="10.5" r="1.8" fill="currentColor" opacity="0.8"/>
                  <circle cx="10.5" cy="10.5" r="1.8" fill="currentColor" opacity="0.8"/>
                  <path d="M6.5 4.3V6.5M6.5 6.5L2.5 8.7M6.5 6.5L10.5 8.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Converger */}
              <button
                onClick={() => onDCAction(msg.id, 'converger')}
                title="Converger — sintetizar y cerrar rama"
                style={{
                  width: 28, height: 28,
                  background: dcOpen === 'converger' ? 'rgba(78,236,170,0.2)' : 'var(--slate)',
                  border: `1px solid ${dcOpen === 'converger' ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: '2px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: dcOpen === 'converger' ? 'var(--success)' : 'var(--text-dim)',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--success)'; e.currentTarget.style.color = 'var(--success)'; }}
                onMouseLeave={e => {
                  if (dcOpen !== 'converger') {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-dim)';
                  }
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="2.5" cy="2.5" r="1.8" fill="currentColor" opacity="0.8"/>
                  <circle cx="10.5" cy="2.5" r="1.8" fill="currentColor" opacity="0.8"/>
                  <circle cx="6.5" cy="10.5" r="1.8" fill="currentColor"/>
                  <path d="M2.5 4.3L6.5 6.5M10.5 4.3L6.5 6.5M6.5 6.5V8.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────
function SynaptracScreen() {
  const [messages, setMessages]       = useState(INITIAL_MESSAGES);
  const [nodes, setNodes]             = useState(INITIAL_NODES);
  const [edges, setEdges]             = useState(INITIAL_EDGES);
  const [input, setInput]             = useState('');
  const [activeDCId, setActiveDCId]   = useState(null);   // msgId
  const [activeDCType, setActiveDCType] = useState(null); // 'divergir'|'converger'
  const [sessionCard, setSessionCard] = useState(null);
  const [graphW, setGraphW]           = useState(320);
  const [graphH, setGraphH]           = useState(500);
  const msgEndRef    = useRef(null);
  const graphPanelRef = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) { setGraphW(e.contentRect.width); setGraphH(e.contentRect.height); }
    });
    if (graphPanelRef.current) obs.observe(graphPanelRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    fetch('/api/chat/messages?student_id=JD')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(err => console.log('API fallback to INITIAL_MESSAGES'));

    fetch('/api/chat/graph?student_id=JD')
      .then(res => res.json())
      .then(data => {
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      })
      .catch(err => console.log('API fallback to INITIAL_NODES'));
  }, []);

  const handleDCAction = useCallback((msgId, action, concept) => {
    // Toggle panel
    if (activeDCId === msgId && activeDCType === action && !concept) {
      setActiveDCId(null); setActiveDCType(null); return;
    }
    setActiveDCId(msgId); setActiveDCType(action);

    if (action === 'concept') return; // just open panel for concept pills

    const timestamp = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    fetch('/api/chat/dc-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: 'JD', action, nodeId: nodes[nodes.length - 1]?.id || 'root', timestamp })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // reload messages and graph from API to be clean
        fetch('/api/chat/messages?student_id=JD')
          .then(res => res.json())
          .then(msgs => { if (Array.isArray(msgs)) setMessages(msgs); });
        
        fetch('/api/chat/graph?student_id=JD')
          .then(res => res.json())
          .then(g => {
            if (g.nodes && g.edges) {
              setNodes(g.nodes);
              setEdges(g.edges);
            }
          });
          
        setSessionCard({ nodesCreated: nodes.length + 1, commits: edges.length + 1 });
        setTimeout(() => { setActiveDCId(null); setActiveDCType(null); }, 300);
      }
    })
    .catch(err => {
      console.log('DC action API failed, using local mock', err);
      // Execute local mock
      const newNodeId  = `node_${Date.now()}`;
      const newNode = {
        id: newNodeId,
        label: action === 'divergir' ? 'Nueva rama' : 'Convergido',
        type: action === 'divergir' ? 'branch' : 'leaf',
        hash: `0x${Math.floor(Math.random()*0xFFFF).toString(16).padStart(4,'0')}`,
        module: 'synaptrac', isNew: true,
      };
      const lastNode = nodes[nodes.length - 1];
      setNodes(prev => [...prev, newNode]);
      setEdges(prev => [...prev, { source: lastNode.id, target: newNodeId, label: action }]);

      const confirmMsg = {
        id: `sys_${Date.now()}`, role: 'ai',
        timestamp: timestamp,
        nodeId: newNodeId,
        text: action === 'divergir'
          ? `Rama divergente creada. El nodo ${newNodeId.slice(-6)} fue añadido a tu grafo. Desarrolla el argumento — cada nivel de profundidad incrementa tu score académico.`
          : `Insight convergido con la rama actual. La síntesis argumentativa fue registrada. Hash pendiente de confirmación en Axiom L2.`,
        concepts: [],
      };
      setMessages(prev => [...prev, confirmMsg]);
      setSessionCard({ nodesCreated: nodes.length + 1, commits: edges.length + 1 });
      setTimeout(() => { setActiveDCId(null); setActiveDCType(null); }, 300);
    });
  }, [activeDCId, activeDCType, messages, nodes, edges]);

  const handleSend = () => {
    if (!input.trim()) return;
    const timestamp = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Optimistic UI updates
    const tempId = `m_${Date.now()}`;
    const studentMsg = {
      id: tempId, role: 'student',
      timestamp: timestamp,
      text: input, concepts: [],
    };
    setMessages(prev => [...prev, studentMsg]);
    setInput('');

    fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: 'JD', text: input, timestamp })
    })
    .then(res => res.json())
    .then(data => {
      if (data.ai_message) {
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempId);
          return [...filtered, data.student_message, data.ai_message];
        });
        if (data.graph_node) {
          setNodes(prev => [...prev, data.graph_node]);
        }
        if (data.graph_edge) {
          setEdges(prev => [...prev, data.graph_edge]);
        }
      }
    })
    .catch(err => {
      console.log('API Send error, using mock fallback', err);
      setTimeout(() => {
        const nodeId = `n${nodes.length + 1}`;
        const reply = {
          id: `ai_${Date.now()}`, role: 'ai',
          timestamp: timestamp,
          nodeId,
          text: 'Argumento registrado (offline). La profundidad de esta rama se incrementa con cada intervención fundamentada. ¿Quieres explorar las implicaciones cuánticas de la no-localidad o mantener el foco en relatividad especial?',
          concepts: [{ id: `c_${Date.now()}`, label: 'No-localidad cuántica (mock)', type: 'concept' }],
        };
        setMessages(prev => [...prev, reply]);
        const newNode = {
          id: nodeId, label: input.slice(0, 8) + '…', type: 'branch',
          hash: `0x${Math.floor(Math.random()*0xFFFF).toString(16)}`, module: 'synaptrac',
        };
        setNodes(prev => [...prev, newNode]);
        setEdges(prev => [...prev, { source: prev[prev.length-1]?.target || 'root', target: nodeId, label: 'responde' }]);
      }, 900);
    });
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>

      {/* ── Chat column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)', minWidth: 0 }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s4)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>

          {/* Header */}
          <div style={{ marginBottom: 'var(--s1)' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.2, marginBottom: 5 }}>
              Debate activo:<br/>
              <span style={{ color: 'var(--violet-bright)' }}>Transformaciones de Lorentz</span>
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
              Sesión 14:18:04 · Axiom L2 monitoreando · {STUDENT_NAME}
            </p>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            {['Explorar contracción espacial', 'Ver tensor electromagnético', 'Auditar mi grafo'].map(a => (
              <button key={a} style={{
                padding: '6px 11px', background: 'var(--slate)',
                border: '1px solid var(--border)', borderRadius: '2px',
                fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              onClick={() => setInput(a)}>
                {a}
              </button>
            ))}
          </div>

          {/* Tooltip hint */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', background: 'var(--violet-06)',
            border: '1px solid var(--violet-20)', borderRadius: '2px',
          }}>
            <span style={{ fontSize: 14, color: 'var(--violet-bright)' }}>⟨ ⟩</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Usa los botones <strong style={{ color: 'var(--violet-bright)' }}>⟨ Divergir</strong> y <strong style={{ color: 'var(--success)' }}>⟩ Converger</strong> junto a cada respuesta para ramificar tu grafo de pensamiento
            </span>
          </div>

          {messages.map(msg => (
            <Message
              key={msg.id}
              msg={msg}
              onDCAction={handleDCAction}
              activeDCId={activeDCType === 'divergir' ? activeDCId : activeDCId === msg.id && activeDCType === 'converger' ? activeDCId : null}
            />
          ))}

          {sessionCard && <SessionCard nodesCreated={sessionCard.nodesCreated} commits={sessionCard.commits} />}
          <div ref={msgEndRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--deep)', padding: 'var(--s3) var(--s4)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <span className="label" style={{ display: 'block', marginBottom: 5 }}>ARGUMENTO</span>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Desarrolla tu argumento… (Enter para enviar)"
                rows={2}
                style={{
                  width: '100%', resize: 'none',
                  background: 'var(--slate)', border: '1px solid var(--border)',
                  borderRadius: '2px', padding: '10px 13px',
                  color: 'var(--text)', fontSize: 13, fontFamily: 'DM Sans', outline: 'none', lineHeight: 1.5,
                  transition: 'border-color 150ms ease',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--violet)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <button onClick={handleSend} style={{
              padding: '10px 21px', height: 60,
              background: 'var(--violet)', border: '2px solid rgba(0,0,0,0.3)',
              borderRadius: '2px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '3px 3px 0 var(--violet-deep)', transition: 'all 120ms cubic-bezier(0.25,0,0.35,1)',
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 var(--violet-deep)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 var(--violet-deep)'; }}>
              Enviar
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 3l5 4-5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)' }}>Shift+Enter = nueva línea · cada mensaje genera nodos en tu grafo</span>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--violet-deep)' }}>PROF. ACTUAL: 8.4</span>
          </div>
        </div>
      </div>

      {/* ── Graph panel ── */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--deep)', overflow: 'hidden' }}>
        <div style={{ height: 42, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--s3)', flexShrink: 0 }}>
          <span className="label">GRAFO DE PENSAMIENTO</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--violet-bright)' }}>{nodes.length} nodos</span>
            <span style={{ width: 6, height: 6, background: 'var(--violet)', animation: 'pulse 2s ease-in-out infinite' }} />
          </div>
        </div>

        <div ref={graphPanelRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GraphCanvas nodes={nodes} edges={edges} width={graphW} height={graphH} />
          <div style={{
            position: 'absolute', bottom: 'var(--s3)', left: 'var(--s3)',
            background: 'rgba(7,7,14,0.85)', border: '1px solid var(--border)',
            borderRadius: '2px', padding: '8px 10px', backdropFilter: 'blur(4px)',
          }}>
            {[
              { color: 'var(--violet)', label: 'Raíz' },
              { color: 'var(--violet-bright)', label: 'Rama' },
              { color: 'var(--violet-deep)', label: 'Hoja' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ width: 7, height: 7, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score */}
        <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--s3)', flexShrink: 0, background: 'var(--deep)' }}>
          <span className="label" style={{ display: 'block', marginBottom: 8 }}>SCORE DE SESIÓN</span>
          <div style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 8 }}>
            {[{ v: '8.4', l: 'Profundidad' }, { v: nodes.length, l: 'Nodos' }, { v: edges.length, l: 'Conexiones' }].map(({ v, l }) => (
              <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--violet-bright)', fontFamily: 'JetBrains Mono' }}>{v}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: 'var(--border)', overflow: 'hidden', marginBottom: 5 }}>
            <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg,var(--violet-deep),var(--violet))', transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)' }}>68% del umbral · próximo nivel en 4 argumentos</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SynaptracScreen });
