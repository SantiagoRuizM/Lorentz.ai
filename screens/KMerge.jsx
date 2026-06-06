
// KMerge.jsx — LaTeX document + contributor blame + Git tree
const { useState, useRef } = React;

const CONTRIBUTORS = [
  { id: 'JD', name: 'Johannes Droste', color: '#6E54FF', initials: 'JD' },
  { id: 'MR', name: 'María Ruiz',       color: '#4DECAA', initials: 'MR' },
  { id: 'KA', name: 'Kai Andersen',     color: '#FFB84D', initials: 'KA' },
  { id: 'PV', name: 'Pedro Vega',       color: '#FF8A80', initials: 'PV' },
];

const CTRIB = { JD: CONTRIBUTORS[0], MR: CONTRIBUTORS[1], KA: CONTRIBUTORS[2], PV: CONTRIBUTORS[3] };

// LaTeX document lines: { text, author, type, indent }
const DOC_LINES = [
  { text: '\\documentclass[12pt]{article}', author: 'JD', type: 'meta' },
  { text: '\\usepackage{amsmath, amssymb, physics}', author: 'JD', type: 'meta' },
  { text: '\\title{La Fuerza de Lorentz y Transformaciones de Coordenadas}', author: 'JD', type: 'meta' },
  { text: '\\author{Grupo 07 · Física Avanzada · Sem. 2025-I}', author: 'MR', type: 'meta' },
  { text: '\\date{\\today}', author: 'JD', type: 'meta' },
  { text: '', author: null, type: 'blank' },
  { text: '\\begin{document}', author: 'JD', type: 'meta' },
  { text: '\\maketitle', author: 'JD', type: 'meta' },
  { text: '', author: null, type: 'blank' },
  { text: '\\begin{abstract}', author: 'MR', type: 'env' },
  { text: 'La fuerza de Lorentz describe la interacción de cargas eléctricas en', author: 'MR', type: 'body', indent: 1 },
  { text: 'presencia de campos electromagnéticos. Este trabajo deriva las expresiones', author: 'MR', type: 'body', indent: 1 },
  { text: 'covariantes bajo transformaciones de Lorentz, demostrando la consistencia', author: 'KA', type: 'body', indent: 1 },
  { text: 'del electromagnetismo con la relatividad especial de Einstein (1905).', author: 'KA', type: 'body', indent: 1 },
  { text: '\\end{abstract}', author: 'MR', type: 'env' },
  { text: '', author: null, type: 'blank' },
  { text: '\\section{Introducción}', author: 'JD', type: 'section' },
  { text: '', author: null, type: 'blank' },
  { text: 'El fenómeno de la fuerza sobre una partícula cargada fue formulado por', author: 'JD', type: 'body' },
  { text: 'H.A. Lorentz en 1895. Para una carga $q$ con velocidad $\\mathbf{v}$:', author: 'JD', type: 'body' },
  { text: '', author: null, type: 'blank' },
  { text: '\\begin{equation}', author: 'JD', type: 'env' },
  { text: '  \\mathbf{F} = q\\left(\\mathbf{E} + \\mathbf{v} \\times \\mathbf{B}\\right)', author: 'JD', type: 'equation', indent: 1 },
  { text: '\\end{equation}', author: 'JD', type: 'env' },
  { text: '', author: null, type: 'blank' },
  { text: 'donde $\\mathbf{E}$ es el campo eléctrico y $\\mathbf{B}$ el campo magnético.', author: 'PV', type: 'body' },
  { text: 'La fuerza eléctrica $q\\mathbf{E}$ actúa independiente del movimiento,', author: 'PV', type: 'body' },
  { text: 'mientras que la fuerza magnética $q(\\mathbf{v}\\times\\mathbf{B})$ depende', author: 'KA', type: 'body' },
  { text: 'de la velocidad relativa al campo.', author: 'KA', type: 'body' },
  { text: '', author: null, type: 'blank' },
  { text: '\\section{Formulación Covariante}', author: 'JD', type: 'section' },
  { text: '', author: null, type: 'blank' },
  { text: 'En formulación covariante, la 4-fuerza de Lorentz es:', author: 'MR', type: 'body' },
  { text: '', author: null, type: 'blank' },
  { text: '\\begin{equation}', author: 'MR', type: 'env' },
  { text: '  f^\\mu = q F^{\\mu\\nu} u_\\nu', author: 'MR', type: 'equation', indent: 1 },
  { text: '\\end{equation}', author: 'MR', type: 'env' },
  { text: '', author: null, type: 'blank' },
  { text: 'donde $F^{\\mu\\nu}$ es el tensor electromagnético de Faraday,', author: 'KA', type: 'body' },
  { text: '$u_\\nu$ la 4-velocidad y los índices griegos recorren $\\{0,1,2,3\\}$.', author: 'KA', type: 'body' },
  { text: '', author: null, type: 'blank' },
  { text: '\\subsection{El Tensor Electromagnético}', author: 'JD', type: 'subsection' },
  { text: '', author: null, type: 'blank' },
  { text: 'El tensor $F^{\\mu\\nu}$ en unidades gaussianas adopta la forma:', author: 'JD', type: 'body' },
  { text: '', author: null, type: 'blank' },
  { text: '\\begin{equation}', author: 'JD', type: 'env' },
  { text: '  F^{\\mu\\nu} = \\begin{pmatrix} 0 & -E_x & -E_y & -E_z \\\\', author: 'JD', type: 'equation', indent: 1 },
  { text: '    E_x & 0 & -B_z & B_y \\\\ E_y & B_z & 0 & -B_x \\\\', author: 'JD', type: 'equation', indent: 1 },
  { text: '    E_z & -B_y & B_x & 0 \\end{pmatrix}', author: 'PV', type: 'equation', indent: 1 },
  { text: '\\end{equation}', author: 'JD', type: 'env' },
  { text: '', author: null, type: 'blank' },
  { text: '\\section{Transformación bajo Boost de Lorentz}', author: 'MR', type: 'section' },
  { text: '', author: null, type: 'blank' },
  { text: 'Para un boost en la dirección $x$ con velocidad $v$, el factor de Lorentz:', author: 'MR', type: 'body' },
  { text: '', author: null, type: 'blank' },
  { text: '\\begin{equation}', author: 'MR', type: 'env' },
  { text: '  \\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}', author: 'MR', type: 'equation', indent: 1 },
  { text: '\\end{equation}', author: 'MR', type: 'env' },
  { text: '', author: null, type: 'blank' },
  { text: 'Los campos transformados en el nuevo frame $S^\\prime$ resultan:', author: 'KA', type: 'body' },
  { text: '', author: null, type: 'blank' },
  { text: '  $E^\\prime_x = E_x$ \\quad $E^\\prime_y = \\gamma(E_y - vB_z)$', author: 'KA', type: 'body', indent: 1 },
  { text: '  $E^\\prime_z = \\gamma(E_z + vB_y)$ \\quad $B^\\prime_x = B_x$', author: 'KA', type: 'body', indent: 1 },
  { text: '', author: null, type: 'blank' },
  { text: '\\end{document}', author: 'JD', type: 'meta' },
];

// Git commit tree
const COMMITS = [
  { hash: '4f2a', author: 'JD', msg: 'Añadir tensor electromagnético F^μν', ts: 'hace 12 min', branch: 'main', lines: '+14 -2' },
  { hash: '9c3d', author: 'KA', msg: 'Completar campos transformados S\'', ts: 'hace 35 min', branch: 'main', lines: '+8 -0' },
  { hash: '7a1b', author: 'MR', msg: 'Formulación covariante 4-fuerza', ts: 'hace 1h', branch: 'main', lines: '+12 -1' },
  { hash: '5b9a', author: 'PV', msg: 'Fix: componente E_z en la matriz', ts: 'hace 2h', branch: 'fix/tensor', lines: '+2 -2' },
  { hash: '3e8f', author: 'JD', msg: 'Estructura inicial y abstract', ts: 'hace 3h', branch: 'main', lines: '+48 -0' },
  { hash: '1d4e', author: 'MR', msg: 'Init: \\documentclass y paquetes', ts: 'hace 4h', branch: 'main', lines: '+6 -0' },
];

function Avatar({ id, size = 20, showName }) {
  const c = CTRIB[id];
  if (!c) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: size, height: size, background: c.color, borderRadius: '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, fontWeight: 700, color: '#07070E', flexShrink: 0,
      }}>{c.initials}</div>
      {showName && <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.name}</span>}
    </div>
  );
}

function renderLatexText(text) {
  // Replace common LaTeX commands with styled spans
  return text
    .replace(/\\mathbf\{([^}]+)\}/g, '<strong>$1</strong>')
    .replace(/\$([^$]+)\$/g, '<em style="font-family:JetBrains Mono;font-size:11px;color:#9B8AFF;font-style:normal">$1</em>')
    .replace(/\\times/g, '×')
    .replace(/\\left\(/g, '(').replace(/\\right\)/g, ')')
    .replace(/\\begin\{([^}]+)\}/g, '<span style="opacity:0.45">\\begin{$1}</span>')
    .replace(/\\end\{([^}]+)\}/g, '<span style="opacity:0.45">\\end{$1}</span>')
    .replace(/\\section\{([^}]+)\}/g, '<span style="color:#E8E8F8;font-weight:700;font-size:14px">$1</span>')
    .replace(/\\subsection\{([^}]+)\}/g, '<span style="color:#C0C0E0;font-weight:600;font-size:13px">$1</span>')
    .replace(/\\documentclass[^{]*\{[^}]+\}/g, m => `<span style="opacity:0.35">${m}</span>`)
    .replace(/\\usepackage[^{]*\{[^}]+\}/g, m => `<span style="opacity:0.35">${m}</span>`)
    .replace(/\\(title|author|date|maketitle|today)\{?([^}]*)\}?/g, (_, cmd, arg) =>
      `<span style="opacity:0.4">\\${cmd}</span>${arg ? `<span style="color:#9B8AFF">{${arg}}</span>` : ''}`)
    .replace(/\\\\/g, '↵')
    .replace(/\\quad/g, '  ');
}

function DocLine({ line, lineNum, hovered, onHover }) {
  const c = line.author ? CTRIB[line.author] : null;
  const indent = line.indent ? line.indent * 16 : 0;

  const typeStyle = {
    meta: { opacity: 0.38, fontStyle: 'normal' },
    env: { opacity: 0.45 },
    section: { color: '#E8E8F8', fontWeight: 700, fontSize: 14 },
    subsection: { color: '#C0C0E0', fontWeight: 600, fontSize: 13 },
    equation: { color: '#9B8AFF', fontFamily: 'JetBrains Mono', fontSize: 12 },
    body: {},
    blank: {},
  }[line.type] || {};

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start',
        minHeight: 22,
        background: hovered && c ? `${c.color}08` : 'transparent',
        transition: 'background 100ms',
        borderLeft: hovered && c ? `2px solid ${c.color}` : '2px solid transparent',
      }}
      onMouseEnter={() => onHover(lineNum)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Line number */}
      <span style={{
        width: 36, flexShrink: 0, fontFamily: 'JetBrains Mono', fontSize: 10,
        color: 'var(--text-dim)', textAlign: 'right', paddingRight: 12,
        paddingTop: 3, userSelect: 'none',
      }}>{lineNum}</span>

      {/* Content */}
      <span
        style={{
          flex: 1, fontFamily: 'JetBrains Mono', fontSize: 12, lineHeight: '22px',
          color: 'var(--text-muted)', paddingLeft: indent, wordBreak: 'break-all',
          ...typeStyle,
        }}
        dangerouslySetInnerHTML={{ __html: renderLatexText(line.text || ' ') }}
      />
    </div>
  );
}

function BlameColumn({ lines, hoveredLine, onHover }) {
  let prevAuthor = null;
  return (
    <div style={{ width: 56, flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      {lines.map((line, i) => {
        const lineNum = i + 1;
        const c = line.author ? CTRIB[line.author] : null;
        const showAvatar = line.author !== prevAuthor && c;
        prevAuthor = line.author;
        return (
          <div
            key={i}
            style={{
              height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: hoveredLine === lineNum && c ? `${c.color}12` : 'transparent',
              cursor: 'default',
            }}
            onMouseEnter={() => onHover(lineNum)}
            onMouseLeave={() => onHover(null)}
            title={c ? c.name : ''}
          >
            {showAvatar && c && (
              <div style={{
                width: 16, height: 16, background: c.color, borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 7, fontWeight: 700, color: '#07070E',
              }}>{c.initials}</div>
            )}
            {!showAvatar && c && (
              <div style={{ width: 2, height: '100%', background: c.color, opacity: 0.4, margin: '0 7px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GitTree({ commits }) {
  const BRANCH_COLORS = { main: 'var(--violet)', 'fix/tensor': 'var(--warn)' };
  const branches = [...new Set(commits.map(c => c.branch))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {commits.map((commit, i) => {
        const isFirst = i === 0;
        const branchColor = BRANCH_COLORS[commit.branch] || 'var(--text-dim)';
        const c = CTRIB[commit.author];
        return (
          <div
            key={commit.hash}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px var(--s3)',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background 150ms', cursor: 'pointer',
              animation: `slideIn 0.15s ${i * 0.05}s ease both`,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--slate)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Branch line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
              {i > 0 && <div style={{ width: 2, height: 8, background: branchColor, opacity: 0.4, marginBottom: 2 }} />}
              <div style={{ width: 10, height: 10, background: branchColor, borderRadius: '0', flexShrink: 0, boxShadow: `0 0 6px ${branchColor}80` }} />
              {i < commits.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: branchColor, opacity: 0.3, marginTop: 2 }} />}
            </div>

            {/* Commit info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <code style={{
                  fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--violet-bright)',
                  background: 'var(--violet-10)', padding: '1px 5px',
                }}>{commit.hash}</code>
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: 9,
                  color: commit.branch === 'main' ? 'var(--violet-bright)' : 'var(--warn)',
                  background: commit.branch === 'main' ? 'var(--violet-10)' : 'rgba(255,184,77,0.1)',
                  padding: '1px 5px',
                }}>{commit.branch}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {commit.msg}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar id={commit.author} size={14} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{commit.ts}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--success)', marginLeft: 'auto' }}>{commit.lines}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContributorBar() {
  const totals = {};
  DOC_LINES.forEach(l => {
    if (l.author) totals[l.author] = (totals[l.author] || 0) + 1;
  });
  const total = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: 'var(--s3)', borderBottom: '1px solid var(--border)' }}>
      <span className="label" style={{ display: 'block', marginBottom: 8 }}>CONTRIBUCIONES</span>
      {/* Stacked bar */}
      <div style={{ height: 6, display: 'flex', marginBottom: 10, overflow: 'hidden' }}>
        {Object.entries(totals).map(([id, count]) => {
          const c = CTRIB[id];
          return (
            <div key={id} title={`${c?.name}: ${Math.round(count/total*100)}%`}
              style={{ height: '100%', width: `${count/total*100}%`, background: c?.color || 'var(--border)', transition: 'width 0.4s ease' }}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(totals).map(([id, count]) => {
          const c = CTRIB[id];
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar id={id} size={18} showName />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {Math.round(count/total*100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KMergeScreen() {
  const [hoveredLine, setHoveredLine] = useState(null);
  const [rightTab, setRightTab] = useState('git');

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>

      {/* ── Document area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          height: 42, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 var(--s3)', background: 'var(--deep)', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-dim)' }}>
            <path d="M2 1h6l3 3v7H2V1z" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Lorentz_Force_Covariante.tex</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)' }}>· {DOC_LINES.length} líneas · 4 autores</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, padding: '3px 8px', background: 'rgba(78,236,170,0.07)', border: '1px solid rgba(78,236,170,0.2)', color: 'var(--success)' }}>
            6 commits
          </span>
          <button style={{
            padding: '5px 12px', background: 'var(--violet)', border: 'none', borderRadius: '2px',
            color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            boxShadow: '2px 2px 0 var(--violet-deep)',
          }}>Nuevo commit</button>
        </div>

        {/* Document + blame columns */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LaTeX document */}
          <div style={{
            flex: 1, overflowY: 'auto', background: 'var(--deep)',
            padding: '16px 0',
          }}>
            {DOC_LINES.map((line, i) => (
              <DocLine
                key={i}
                line={line}
                lineNum={i + 1}
                hovered={hoveredLine === i + 1}
                onHover={setHoveredLine}
              />
            ))}
          </div>

          {/* Blame column */}
          <BlameColumn
            lines={DOC_LINES}
            hoveredLine={hoveredLine}
            onHover={setHoveredLine}
          />
        </div>
      </div>

      {/* ── Right panel: Git tree + contributors ── */}
      <div style={{
        width: 300, flexShrink: 0,
        borderLeft: '1px solid var(--border)',
        background: 'var(--deep)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Tabs */}
        <div style={{
          height: 42, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'stretch', flexShrink: 0,
        }}>
          {[['git', 'Commits'], ['contributors', 'Autores']].map(([id, label]) => (
            <button key={id} onClick={() => setRightTab(id)} style={{
              flex: 1, background: 'none',
              borderBottom: `2px solid ${rightTab === id ? 'var(--violet)' : 'transparent'}`,
              border: 'none', borderBottom: `2px solid ${rightTab === id ? 'var(--violet)' : 'transparent'}`,
              color: rightTab === id ? 'var(--violet-bright)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans', letterSpacing: '0.04em',
              transition: 'all 150ms ease',
            }}>{label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rightTab === 'git' ? (
            <GitTree commits={COMMITS} />
          ) : (
            <div>
              <ContributorBar />
              {/* Hover tip */}
              <div style={{ padding: 'var(--s3)' }}>
                <span className="label" style={{ display: 'block', marginBottom: 8 }}>ÚLTIMA ACTIVIDAD</span>
                {COMMITS.slice(0, 4).map((c, i) => {
                  const ctrib = CTRIB[c.author];
                  return (
                    <div key={c.hash} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12,
                      animation: `slideIn 0.15s ${i * 0.05}s ease both`,
                    }}>
                      <Avatar id={c.author} size={22} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.msg}</div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{ctrib?.name} · {c.ts}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Commit input */}
        <div style={{ padding: 'var(--s3)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <span className="label" style={{ display: 'block', marginBottom: 6 }}>COMMIT</span>
          <input placeholder="Mensaje del commit…" style={{
            width: '100%', background: 'var(--slate)', border: '1px solid var(--border)',
            borderRadius: '2px', padding: '7px 10px', color: 'var(--text)',
            fontSize: 12, fontFamily: 'DM Sans', outline: 'none', marginBottom: 6,
            transition: 'border-color 150ms',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--violet)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button style={{
            width: '100%', padding: '8px', background: 'var(--violet)',
            border: 'none', borderRadius: '2px', color: 'white',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            boxShadow: '2px 2px 0 var(--violet-deep)',
          }}>Confirmar → Axiom L2</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { KMergeScreen });
