
// Cursos.jsx — Gestión de cursos y fuentes bibliográficas del profesor
const { useState } = React;

const COURSES = [
  {
    id: 'c1',
    title: 'Relatividad Especial',
    code: 'FIS-401',
    description: 'Fundamentos de la relatividad especial: postulados de Einstein, transformaciones de Lorentz, espacio-tiempo de Minkowski y consecuencias cinemáticas.',
    status: 'active',
    students: 24,
    papers: 4,
    modules: ['Synaptrac', 'K-Merge', 'Discursus'],
    updatedAt: '2026-06-05',
    hash: '0x4f2a9c',
  },
  {
    id: 'c2',
    title: 'Mecánica Cuántica Introductoria',
    code: 'FIS-402',
    description: 'Introducción al formalismo cuántico: ecuación de Schrödinger, principio de incertidumbre, operadores y representaciones.',
    status: 'active',
    students: 18,
    papers: 3,
    modules: ['Synaptrac', 'Discursus'],
    updatedAt: '2026-06-04',
    hash: '0x9c3d7b',
  },
  {
    id: 'c3',
    title: 'Electrodinámica Clásica',
    code: 'FIS-301',
    description: 'Ecuaciones de Maxwell, teoría del campo electromagnético, ondas EM y formulación covariante del electromagnetismo.',
    status: 'active',
    students: 31,
    papers: 4,
    modules: ['Synaptrac', 'K-Merge'],
    updatedAt: '2026-06-03',
    hash: '0x7a1b5e',
  },
  {
    id: 'c4',
    title: 'Física Estadística',
    code: 'FIS-403',
    description: 'Mecánica estadística clásica y cuántica: distribuciones de Boltzmann, Fermi-Dirac y Bose-Einstein, entropía y termodinámica.',
    status: 'draft',
    students: 0,
    papers: 3,
    modules: ['Synaptrac'],
    updatedAt: '2026-06-01',
    hash: '0x2e7c4a',
  },
];

const PAPERS_BY_COURSE = {
  c1: [
    {
      id: 'p1', type: 'paper',
      title: 'Zur Elektrodynamik bewegter Körper',
      titleEs: 'Sobre la electrodinámica de los cuerpos en movimiento',
      authors: 'Einstein, A.',
      year: 1905,
      journal: 'Annalen der Physik, 17, 891–921',
      abstract: 'Artículo fundacional de la relatividad especial. Einstein demuestra la equivalencia de todos los marcos inerciales y la constancia de la velocidad de la luz, derivando las transformaciones de Lorentz desde primeros principios.',
      doi: '10.1002/andp.19053221004',
      tags: ['postulados', 'transformaciones', 'cinemática'],
      hash: '0xa3f2c1',
    },
    {
      id: 'p2', type: 'paper',
      title: 'Raum und Zeit',
      titleEs: 'Espacio y Tiempo',
      authors: 'Minkowski, H.',
      year: 1908,
      journal: 'Physikalische Zeitschrift, 10, 104–111',
      abstract: 'Minkowski reformula la relatividad especial como geometría del espacio-tiempo cuadridimensional, introduciendo el intervalo invariante ds² = c²dt² − dx² − dy² − dz² y los diagramas espacio-temporales.',
      doi: '10.1007/978-3-663-07634-3_1',
      tags: ['espacio-tiempo', 'Minkowski', 'geometría'],
      hash: '0xb5e3d7',
    },
    {
      id: 'p3', type: 'paper',
      title: 'Electromagnetic phenomena in a system moving with any velocity smaller than that of light',
      titleEs: 'Fenómenos electromagnéticos en un sistema en movimiento',
      authors: 'Lorentz, H. A.',
      year: 1904,
      journal: 'Proceedings of the Royal Netherlands Academy, 6, 809–831',
      abstract: 'Lorentz deduce matemáticamente las transformaciones que llevan su nombre para reconciliar el electromagnetismo de Maxwell con el principio de relatividad, incluyendo la contracción de longitudes.',
      doi: '10.1007/978-94-015-3445-1_5',
      tags: ['contracción', 'transformaciones', 'Lorentz'],
      hash: '0xc7a4b2',
    },
    {
      id: 'p4', type: 'paper',
      title: 'Sur la dynamique de l\'électron',
      titleEs: 'Sobre la dinámica del electrón',
      authors: 'Poincaré, H.',
      year: 1905,
      journal: 'Comptes rendus de l\'Académie des Sciences, 140, 1504–1508',
      abstract: 'Poincaré introduce el grupo de transformaciones de Lorentz, la covarianza de las ecuaciones de Maxwell y anticipa varios conceptos clave de la relatividad, incluyendo la invariancia del intervalo.',
      doi: '10.1007/BF02947677',
      tags: ['grupo de Lorentz', 'covarianza', 'dinámica'],
      hash: '0xd8b5c3',
    },
  ],
  c2: [
    {
      id: 'p5', type: 'paper',
      title: 'Quantisierung als Eigenwertproblem',
      titleEs: 'Cuantización como problema de valores propios',
      authors: 'Schrödinger, E.',
      year: 1926,
      journal: 'Annalen der Physik, 79, 361–376',
      abstract: 'Schrödinger formula la ecuación de onda que lleva su nombre, equivalente a la mecánica matricial de Heisenberg. Establece la base ondulatoria de la mecánica cuántica y resuelve el átomo de hidrógeno.',
      doi: '10.1002/andp.19263840404',
      tags: ['ecuación de onda', 'valores propios', 'átomo H'],
      hash: '0xe9c6d4',
    },
    {
      id: 'p6', type: 'paper',
      title: 'Über quantentheoretische Umdeutung kinematischer und mechanischer Beziehungen',
      titleEs: 'Reinterpretación cuántica de relaciones cinemáticas y mecánicas',
      authors: 'Heisenberg, W.',
      year: 1925,
      journal: 'Zeitschrift für Physik, 33, 879–893',
      abstract: 'Artículo fundacional de la mecánica matricial. Heisenberg abandona las órbitas electrónicas clásicas y reformula la mecánica cuántica en términos de cantidades observables y su algebra matricial.',
      doi: '10.1007/BF01328377',
      tags: ['mecánica matricial', 'observables', 'incertidumbre'],
      hash: '0xf0d7e5',
    },
    {
      id: 'p7', type: 'paper',
      title: 'The Quantum Theory of the Electron',
      titleEs: 'La teoría cuántica del electrón',
      authors: 'Dirac, P. A. M.',
      year: 1928,
      journal: 'Proceedings of the Royal Society A, 117, 610–624',
      abstract: 'Dirac presenta la ecuación relativista del electrón, prediciendo el espín y la existencia del positrón (antimateria). Unifica mecánica cuántica y relatividad especial para partículas de espín 1/2.',
      doi: '10.1098/rspa.1928.0023',
      tags: ['ecuación de Dirac', 'espín', 'antimateria'],
      hash: '0x01e8f6',
    },
  ],
  c3: [
    {
      id: 'p8', type: 'paper',
      title: 'A Dynamical Theory of the Electromagnetic Field',
      titleEs: 'Una teoría dinámica del campo electromagnético',
      authors: 'Maxwell, J. C.',
      year: 1865,
      journal: 'Philosophical Transactions of the Royal Society, 155, 459–512',
      abstract: 'Maxwell unifica electricidad, magnetismo y óptica en un conjunto de ecuaciones de campo. Predice la existencia de ondas electromagnéticas que se propagan a la velocidad de la luz.',
      doi: '10.1098/rstl.1865.0008',
      tags: ['ecuaciones de Maxwell', 'ondas EM', 'unificación'],
      hash: '0x12f9a7',
    },
    {
      id: 'p9', type: 'libro',
      title: 'Classical Electrodynamics',
      titleEs: 'Electrodinámica Clásica',
      authors: 'Jackson, J. D.',
      year: 1962,
      journal: 'John Wiley & Sons — 3ª ed. 1998',
      abstract: 'Texto canónico de electrodinámica a nivel de posgrado. Cubre el formalismo completo de Maxwell, potenciales de Liénard-Wiechert, radiación, dispersión y la formulación covariante relativista.',
      doi: 'ISBN: 978-0-471-30932-1',
      tags: ['texto canónico', 'radiación', 'covarianza'],
      hash: '0x23a0b8',
    },
    {
      id: 'p10', type: 'paper',
      title: 'Über Strahlen elektrischer Kraft',
      titleEs: 'Sobre rayos de fuerza eléctrica',
      authors: 'Hertz, H.',
      year: 1887,
      journal: 'Annalen der Physik, 36, 769–783',
      abstract: 'Hertz detecta experimentalmente las ondas electromagnéticas predichas por Maxwell, mide su velocidad (igual a c) y demuestra que exhiben reflexión, refracción e interferencia.',
      doi: '10.1002/andp.18892720409',
      tags: ['ondas EM', 'experimento', 'verificación'],
      hash: '0x34b1c9',
    },
    {
      id: 'p11', type: 'paper',
      title: 'Experimental Researches in Electricity',
      titleEs: 'Investigaciones experimentales en electricidad',
      authors: 'Faraday, M.',
      year: 1832,
      journal: 'Philosophical Transactions of the Royal Society, 122, 125–162',
      abstract: 'Faraday descubre la inducción electromagnética y propone el concepto de líneas de campo como realidad física, sentando las bases del campo electromagnético que Maxwell formalizará.',
      doi: '10.1098/rstl.1832.0006',
      tags: ['inducción', 'campo magnético', 'experimento'],
      hash: '0x45c2da',
    },
  ],
  c4: [
    {
      id: 'p12', type: 'paper',
      title: 'Weitere Studien über das Wärmegleichgewicht unter Gasmolekülen',
      titleEs: 'Estudios adicionales sobre el equilibrio térmico entre moléculas de gas',
      authors: 'Boltzmann, L.',
      year: 1872,
      journal: 'Wiener Berichte, 66, 275–370',
      abstract: 'Boltzmann deriva la ecuación cinética que lleva su nombre y demuestra el teorema H, estableciendo la segunda ley de la termodinámica sobre bases estadísticas y la irreversibilidad microscópica.',
      doi: '10.1007/BF01331655',
      tags: ['entropía', 'distribución', 'teorema H'],
      hash: '0x56d3eb',
    },
    {
      id: 'p13', type: 'libro',
      title: 'Elementary Principles in Statistical Mechanics',
      titleEs: 'Principios elementales en mecánica estadística',
      authors: 'Gibbs, J. W.',
      year: 1902,
      journal: 'Charles Scribner\'s Sons, New Haven',
      abstract: 'Gibbs formula el formalismo canónico completo de la mecánica estadística: ensambles, función de partición, potencial termodinámico y conexión entre el nivel microscópico y las variables macroscópicas.',
      doi: 'ISBN: 978-0-300-00316-1',
      tags: ['ensamble canónico', 'función de partición', 'termodinámica'],
      hash: '0x67e4fc',
    },
    {
      id: 'p14', type: 'paper',
      title: 'Über das Gesetz der Energieverteilung im Normalspektrum',
      titleEs: 'Sobre la ley de distribución de energía en el espectro normal',
      authors: 'Planck, M.',
      year: 1901,
      journal: 'Annalen der Physik, 4, 553–563',
      abstract: 'Planck resuelve la catástrofe ultravioleta introduciendo la cuantización de la energía radiada E = hν. Este artículo da inicio a la física cuántica y contiene la primera aparición de la constante de Planck h.',
      doi: '10.1002/andp.19013090310',
      tags: ['cuantización', 'radiación de cuerpo negro', 'Planck'],
      hash: '0x78f50d',
    },
  ],
};

const TYPE_STYLES = {
  paper: { label: 'Paper',  bg: 'rgba(110,84,255,0.12)', color: 'var(--violet-bright)', border: 'rgba(110,84,255,0.3)' },
  libro: { label: 'Libro',  bg: 'rgba(78,236,170,0.10)', color: 'var(--success)',       border: 'rgba(78,236,170,0.3)' },
  video: { label: 'Video',  bg: 'rgba(255,184,77,0.10)', color: 'var(--warn)',           border: 'rgba(255,184,77,0.3)' },
};

const STATUS_STYLES = {
  active: { label: 'Activo',   color: 'var(--success)', bg: 'rgba(78,236,170,0.08)' },
  draft:  { label: 'Borrador', color: 'var(--warn)',    bg: 'rgba(255,184,77,0.08)' },
};

const MOD_COLORS = {
  Synaptrac: 'var(--violet)',
  'K-Merge': 'var(--success)',
  Discursus: 'var(--warn)',
};

// ── Paper row expandable ──────────────────────────────────────────────
function PaperItem({ paper, idx }) {
  const [expanded, setExpanded] = useState(false);
  const style = TYPE_STYLES[paper.type] || TYPE_STYLES.paper;

  return (
    <div style={{
      border: '1px solid var(--border)', background: 'var(--slate)',
      marginBottom: 6, animation: `fadeUp 0.2s ${idx * 0.06}s ease both`,
      transition: 'border-color 150ms',
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '12px var(--s3)', cursor: 'pointer', display: 'flex',
          alignItems: 'flex-start', gap: 12,
        }}
        onMouseEnter={e => e.currentTarget.parentElement.style.borderColor = 'var(--violet-20)'}
        onMouseLeave={e => e.currentTarget.parentElement.style.borderColor = 'var(--border)'}
      >
        {/* Index */}
        <div style={{
          width: 24, height: 24, background: 'var(--card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', flexShrink: 0,
        }}>{String(idx + 1).padStart(2, '0')}</div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              padding: '2px 7px', fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono',
              background: style.bg, color: style.color, border: `1px solid ${style.border}`,
              letterSpacing: '0.08em',
            }}>{style.label}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{paper.year}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--violet-bright)', opacity: 0.6 }}>hash: {paper.hash}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginBottom: 2 }}>
            {paper.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 4 }}>
            {paper.titleEs}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {paper.authors} · {paper.journal}
          </div>
        </div>

        {/* Tags + chevron */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {paper.tags.map(t => (
              <span key={t} style={{
                padding: '1px 6px', background: 'var(--card)', border: '1px solid var(--border)',
                fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono',
              }}>{t}</span>
            ))}
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-dim)', transform: expanded ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Expanded: abstract + DOI */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)', padding: '12px var(--s3)',
          background: 'var(--card)', animation: 'fadeUp 0.15s ease both',
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12 }}>
            {paper.abstract}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              flex: 1, padding: '6px 10px', background: 'var(--slate)', border: '1px solid var(--border)',
              fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {paper.doi}
            </div>
            <button style={{
              padding: '6px 12px', background: 'var(--violet-10)', border: '1px solid var(--violet-20)',
              color: 'var(--violet-bright)', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono',
              cursor: 'pointer', letterSpacing: '0.06em', flexShrink: 0, transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--violet)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet-10)'; e.currentTarget.style.color = 'var(--violet-bright)'; }}>
              ANCLAR EN L2 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────────────
function CourseCard({ course, selected, onClick }) {
  const st = STATUS_STYLES[course.status];
  return (
    <div
      onClick={() => onClick(course)}
      style={{
        padding: 'var(--s3)', cursor: 'pointer', border: '1px solid',
        borderColor: selected ? 'var(--violet-20)' : 'var(--border)',
        background: selected ? 'var(--violet-06)' : 'var(--card)',
        borderLeft: `3px solid ${selected ? 'var(--violet)' : 'transparent'}`,
        transition: 'all 150ms ease', animation: 'fadeUp 0.2s ease both',
        marginBottom: 4,
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = 'var(--slate)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: selected ? 'var(--text)' : 'var(--text)', marginBottom: 2 }}>{course.title}</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)' }}>{course.code}</div>
        </div>
        <span style={{
          padding: '2px 8px', fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono',
          background: st.bg, color: st.color, border: `1px solid ${st.color}33`,
          letterSpacing: '0.08em', flexShrink: 0,
        }}>{st.label}</span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--s3)', marginTop: 8 }}>
        {[{ v: course.students, l: 'alumnos' }, { v: course.papers, l: 'fuentes' }].map(({ v, l }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 700, color: 'var(--violet-bright)' }}>{v}</div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{l}</div>
          </div>
        ))}
        <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {course.modules.map(m => (
            <span key={m} style={{
              width: 6, height: 6, background: MOD_COLORS[m] || 'var(--text-dim)', flexShrink: 0,
              title: m,
            }} title={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Course detail ─────────────────────────────────────────────────────
function CourseDetail({ course }) {
  const papers = PAPERS_BY_COURSE[course.id] || [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideIn 0.2s ease both' }}>
      {/* Course header */}
      <div style={{
        padding: 'var(--s3) var(--s4)', borderBottom: '1px solid var(--border)',
        background: 'var(--deep)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span className="label">{course.code}</span>
              <span style={{
                padding: '2px 8px', fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono',
                background: STATUS_STYLES[course.status].bg, color: STATUS_STYLES[course.status].color,
                border: `1px solid ${STATUS_STYLES[course.status].color}33`,
              }}>{STATUS_STYLES[course.status].label}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6 }}>{course.title}</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 640 }}>{course.description}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s4)', flexShrink: 0 }}>
            {[{ v: course.students, l: 'Estudiantes' }, { v: papers.length, l: 'Fuentes' }].map(({ v, l }) => (
              <div key={l} style={{ textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', padding: '8px 16px' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'var(--violet-bright)' }}>{v}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Module tags */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', alignSelf: 'center' }}>Módulos:</span>
          {course.modules.map(m => (
            <span key={m} style={{
              padding: '2px 8px', fontSize: 10, fontWeight: 600,
              background: `${MOD_COLORS[m]}18`, color: MOD_COLORS[m] || 'var(--text-muted)',
              border: `1px solid ${MOD_COLORS[m]}40`,
            }}>{m}</span>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', alignSelf: 'center' }}>
            hash: {course.hash} · actualizado {course.updatedAt}
          </span>
        </div>
      </div>

      {/* Papers list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s4)' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="label">Fuentes Bibliográficas</span>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 9,
              background: 'var(--violet-10)', border: '1px solid var(--violet-20)',
              color: 'var(--violet-bright)', padding: '1px 7px',
            }}>{papers.length} referencias</span>
          </div>
          <button style={{
            padding: '5px 12px', background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono',
            cursor: 'pointer', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--violet-bright)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            AÑADIR FUENTE
          </button>
        </div>

        {/* Type legend */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--s3)' }}>
          {Object.entries(TYPE_STYLES).map(([key, s]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, background: s.color }} />
              <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Paper items */}
        {papers.map((paper, idx) => <PaperItem key={paper.id} paper={paper} idx={idx} />)}

        {papers.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--s6)', color: 'var(--text-dim)' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, marginBottom: 8 }}>SIN FUENTES REGISTRADAS</div>
            <div style={{ fontSize: 12 }}>Añade papers, libros o videos a este curso.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Placeholder when no course selected ──────────────────────────────
function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', gap: 12 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity="0.3">
        <rect x="6" y="4" width="28" height="32" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 14h16M12 20h16M12 26h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em' }}>SELECCIONA UN CURSO</div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Haz clic en un curso para ver sus fuentes bibliográficas</div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────
function CursosScreen() {
  const [selected, setSelected] = useState(COURSES[0]);

  const totalStudents = COURSES.reduce((a, c) => a + c.students, 0);
  const totalPapers   = Object.values(PAPERS_BY_COURSE).flat().length;
  const activeCourses = COURSES.filter(c => c.status === 'active').length;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>

      {/* Left panel — course list */}
      <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--deep)' }}>

        {/* Stats */}
        <div style={{ padding: 'var(--s2)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 2 }}>
          {[{ v: activeCourses, l: 'Activos' }, { v: totalStudents, l: 'Alumnos' }, { v: totalPapers, l: 'Fuentes' }].map(({ v, l }) => (
            <div key={l} style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', padding: '6px 4px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 700, color: 'var(--violet-bright)' }}>{v}</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ height: 38, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--s3)', flexShrink: 0 }}>
          <span className="label">MIS CURSOS</span>
          <button style={{
            background: 'var(--violet)', border: 'none', color: 'white', padding: '3px 8px',
            fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.06em',
          }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1v6M1 4h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            NUEVO
          </button>
        </div>

        {/* Course list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s2)' }}>
          {COURSES.map(c => (
            <CourseCard key={c.id} course={c} selected={selected?.id === c.id} onClick={setSelected} />
          ))}
        </div>

        {/* Legend */}
        <div style={{ padding: 'var(--s2) var(--s3)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          {Object.entries(MOD_COLORS).map(([m, color]) => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, background: color }} />
              <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — course detail */}
      {selected ? <CourseDetail course={selected} /> : <EmptyState />}

    </div>
  );
}

Object.assign(window, { CursosScreen });
