
// Discursus.jsx — Meeting recording + live transcription + node extraction
const { useState, useEffect, useRef } = React;

const TRANSCRIPT = [
  { id: 't1', speaker: 'Node L-442', time: '00:02:14', text: 'El experimento de Michelson-Morley es fundamental para entender por qué asumimos la constancia de c en todos los frames de referencia.', extracted: true },
  { id: 't2', speaker: 'Node M-117', time: '00:03:01', text: 'Exacto. Pero el diseño del interferómetro también tenía limitaciones instrumentales que muchos análisis modernos ignoran.', extracted: false },
  { id: 't3', speaker: 'Node K-089', time: '00:04:22', text: 'Si consideramos la deriva del éter como hipótesis alternativa, la nulidad del resultado se vuelve más interesante estadísticamente.', extracted: true },
  { id: 't4', speaker: 'Node L-442', time: '00:05:45', text: 'La interpretación de Lorentz — contracción de longitud — también explica el resultado, sin necesidad de abandonar el éter. Einstein eligió la parsimonia.', extracted: false },
  { id: 't5', speaker: 'Node P-203', time: '00:06:30', text: 'Pero la parsimonia no implica verdad. ¿Cómo diferenciamos entre teorías empíricamente equivalentes?', extracted: false },
  { id: 't6', speaker: 'Node M-117', time: '00:08:11', text: 'La navaja de Occam no es un criterio epistémico, es heurístico. El poder predictivo de la relatividad especial lo resuelve a favor de Einstein.', extracted: false },
];

const WAVEFORM_BARS = Array.from({ length: 80 }, (_, i) =>
  Math.abs(Math.sin(i * 0.4) * 0.7 + Math.random() * 0.3) * 0.9 + 0.1
);

const SPEAKERS = {
  'Node L-442': { color: 'var(--violet)', short: 'L' },
  'Node M-117': { color: '#4DECAA', short: 'M' },
  'Node K-089': { color: '#FFB84D', short: 'K' },
  'Node P-203': { color: '#FF8A80', short: 'P' },
};

function Avatar({ speaker }) {
  const s = SPEAKERS[speaker] || { color: 'var(--border)', short: '?' };
  return (
    <div style={{
      width: 28, height: 28, background: s.color, borderRadius: '2px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: '#07070E', flexShrink: 0,
    }}>{s.short}</div>
  );
}

function WaveformBar({ height, active }) {
  return (
    <div style={{
      width: 2, background: active ? 'var(--violet)' : 'var(--border)',
      height: `${height * 48}px`, borderRadius: '1px',
      transition: 'background 0.2s ease',
      flexShrink: 0,
    }} />
  );
}

function DiscursusScreen() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.27);
  const [extractedNodes, setExtractedNodes] = useState(['t1', 't3']);
  const [activeTranscript, setActiveTranscript] = useState('t4');
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setProgress(p => Math.min(p + 0.001, 1));
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const handleExtract = (id) => {
    setExtractedNodes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const totalTime = '00:18:34';
  const currentTime = `00:${String(Math.floor(progress * 18)).padStart(2,'0')}:${String(Math.floor((progress * 18 * 60) % 60)).padStart(2,'0')}`;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>

      {/* ── Left: Video + Waveform ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--border)', overflow: 'hidden',
      }}>
        {/* Video placeholder */}
        <div style={{
          flex: 1, background: 'var(--slate)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Grid background */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
            backgroundSize: '34px 34px', opacity: 0.4,
          }} />

          {/* Participant grid */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr', gap: 2, padding: 2,
          }}>
            {Object.entries(SPEAKERS).map(([name, s]) => (
              <div key={name} style={{
                background: 'var(--card)', display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, position: 'relative',
                border: activeTranscript && TRANSCRIPT.find(t => t.id === activeTranscript)?.speaker === name
                  ? '1px solid var(--violet)' : '1px solid var(--border)',
                transition: 'border-color 300ms ease',
              }}>
                <div style={{
                  width: 48, height: 48, background: s.color,
                  borderRadius: '2px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#07070E',
                }}>{s.short}</div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>{name}</span>
                {activeTranscript && TRANSCRIPT.find(t => t.id === activeTranscript)?.speaker === name && (
                  <div style={{
                    position: 'absolute', bottom: 8, left: 8,
                    display: 'flex', gap: 2,
                  }}>
                    {[0.4, 0.7, 0.5, 0.9, 0.3].map((h, i) => (
                      <div key={i} style={{
                        width: 2, height: `${h * 12 + 4}px`,
                        background: s.color, borderRadius: '1px',
                        animation: playing ? `pulse ${0.3 + i * 0.1}s ease-in-out infinite alternate` : 'none',
                      }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recording badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(7,7,14,0.8)', border: '1px solid var(--border)',
            padding: '4px 10px', borderRadius: '2px', backdropFilter: 'blur(4px)',
          }}>
            <span style={{ width: 6, height: 6, background: 'var(--error)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>
              {playing ? 'REPRODUCIENDO' : 'PAUSADO'} · {currentTime} / {totalTime}
            </span>
          </div>

          {/* Nodes extracted badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(110,84,255,0.15)', border: '1px solid var(--violet-20)',
            padding: '4px 10px', borderRadius: '2px',
          }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--violet-bright)' }}>
              {extractedNodes.length} nodos extraídos
            </span>
          </div>
        </div>

        {/* Waveform + controls */}
        <div style={{
          background: 'var(--deep)', borderTop: '1px solid var(--border)',
          padding: 'var(--s3)', flexShrink: 0,
        }}>
          {/* Waveform */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 1,
            height: 56, marginBottom: 10, cursor: 'pointer', position: 'relative',
          }}>
            {WAVEFORM_BARS.map((h, i) => (
              <WaveformBar key={i} height={h} active={i / WAVEFORM_BARS.length < progress} />
            ))}
            {/* Playhead */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${progress * 100}%`,
              width: 2, background: 'var(--violet)',
              boxShadow: '0 0 6px rgba(110,84,255,0.6)',
            }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
            <button onClick={() => setProgress(p => Math.max(0, p - 0.05))} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
            }}>⏮</button>
            <button onClick={() => setPlaying(p => !p)} style={{
              width: 36, height: 36,
              background: 'var(--violet)', border: 'none', borderRadius: '2px',
              color: 'white', cursor: 'pointer', fontSize: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 0 var(--violet-deep)',
            }}>
              {playing ? '⏸' : '▶'}
            </button>
            <button onClick={() => setProgress(p => Math.min(1, p + 0.05))} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
            }}>⏭</button>
            <div style={{ flex: 1 }}>
              <input type="range" min="0" max="100" value={Math.round(progress * 100)}
                onChange={e => setProgress(e.target.value / 100)}
                style={{ width: '100%', accentColor: 'var(--violet)' }}
              />
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
              {currentTime} / {totalTime}
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: Transcript ── */}
      <div style={{
        width: 380, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        background: 'var(--deep)', overflow: 'hidden',
      }}>
        <div style={{
          height: 42, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 var(--s3)', flexShrink: 0,
        }}>
          <span className="label">TRANSCRIPCIÓN EN VIVO</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--success)' }}>
            ● ACTIVO
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s2) 0' }}>
          {TRANSCRIPT.map((entry, i) => (
            <div
              key={entry.id}
              onClick={() => setActiveTranscript(entry.id)}
              style={{
                padding: 'var(--s2) var(--s3)',
                background: activeTranscript === entry.id ? 'var(--violet-06)' : 'transparent',
                borderLeft: `2px solid ${activeTranscript === entry.id ? 'var(--violet)' : 'transparent'}`,
                cursor: 'pointer', transition: 'all 150ms ease',
                animation: `slideIn 0.2s ${i * 0.05}s ease both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Avatar speaker={entry.speaker} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.speaker}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{entry.time}</div>
                </div>
                {/* Extract button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleExtract(entry.id); }}
                  title="Extraer como nodo"
                  style={{
                    padding: '3px 7px', fontSize: 9, fontWeight: 600,
                    background: extractedNodes.includes(entry.id) ? 'var(--violet-20)' : 'transparent',
                    border: `1px solid ${extractedNodes.includes(entry.id) ? 'var(--violet)' : 'var(--border)'}`,
                    borderRadius: '2px',
                    color: extractedNodes.includes(entry.id) ? 'var(--violet-bright)' : 'var(--text-dim)',
                    cursor: 'pointer', transition: 'all 150ms ease',
                    fontFamily: 'JetBrains Mono', letterSpacing: '0.06em',
                  }}
                >
                  {extractedNodes.includes(entry.id) ? 'NODO ✓' : '+ NODO'}
                </button>
              </div>
              <p style={{
                fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0,
                paddingLeft: 36,
              }}>
                {entry.text}
              </p>
            </div>
          ))}
        </div>

        {/* Export */}
        <div style={{
          padding: 'var(--s3)', borderTop: '1px solid var(--border)',
          flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--success)',
            padding: '5px 8px', background: 'rgba(78,236,170,0.05)',
            border: '1px solid rgba(78,236,170,0.15)',
          }}>
            {extractedNodes.length} intervenciones → grafo · Hash pendiente
          </div>
          <button style={{
            width: '100%', padding: '8px', background: 'var(--violet)',
            border: 'none', borderRadius: '2px', color: 'white',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            boxShadow: '2px 2px 0 var(--violet-deep)',
          }}>
            Enviar nodos a Synaptrac →
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DiscursusScreen });
