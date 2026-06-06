
// Login.jsx — Single role selector + upgraded Three.js (Earth + nodes + grid deformation)
const { useState, useRef, useEffect } = React;

// ── Three.js spacetime + Earth animation ──────────────────────────
function SpacetimeAnimation() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !window.THREE) return;
    const T = window.THREE;
    const W = mount.offsetWidth, H = mount.offsetHeight;
    if (!W || !H) return;

    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(46, W / H, 0.1, 500);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, -1, 0);

    // ── Spacetime grid ──
    const G = 28, STEP = 1;
    const basePts = [];
    const posArr = [];
    for (let i = 0; i < G; i++) {
      for (let j = 0; j < G; j++) {
        const x = (i - G / 2) * STEP;
        const z = (j - G / 2) * STEP;
        basePts.push(x, z);
        posArr.push(x, 0, z);
      }
    }
    const ptGeo = new T.BufferGeometry();
    const posF = new Float32Array(posArr);
    ptGeo.setAttribute('position', new T.BufferAttribute(posF, 3));
    const ptMat = new T.PointsMaterial({ color: 0x5240CC, size: 0.06, transparent: true, opacity: 0.7 });
    scene.add(new T.Points(ptGeo, ptMat));

    // Grid lines
    const lineMat = new T.LineBasicMaterial({ color: 0x1C1C38, transparent: true, opacity: 0.6 });
    const half = (G / 2) * STEP;
    for (let i = 0; i < G; i++) {
      const v = (i - G / 2) * STEP;
      scene.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(v, 0, -half), new T.Vector3(v, 0, half)]), lineMat));
      scene.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-half, 0, v), new T.Vector3(half, 0, v)]), lineMat));
    }

    // ── Earth (main moving body) ──
    const earthGeo = new T.SphereGeometry(0.45, 32, 32);
    const earthMat = new T.MeshBasicMaterial({ color: 0x1E6FB5 });
    const earth = new T.Mesh(earthGeo, earthMat);
    earth.position.y = 0.45;
    scene.add(earth);

    // Earth glow
    const eGlowGeo = new T.SphereGeometry(0.75, 16, 16);
    const eGlowMat = new T.MeshBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.15 });
    earth.add(new T.Mesh(eGlowGeo, eGlowMat));

    // Earth trail
    const TRAIL = 50;
    const trailF = new Float32Array(TRAIL * 3);
    const trailGeo = new T.BufferGeometry();
    trailGeo.setAttribute('position', new T.BufferAttribute(trailF, 3));
    trailGeo.setDrawRange(0, 0);
    scene.add(new T.Line(trailGeo, new T.LineBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.25 })));
    const trailHistory = [];

    // ── Small bright nodes (stars/planets) ──
    const STAR_POSITIONS = [
      [-6, 3], [5, -4], [-3, -6], [7, 2], [2, 7],
      [-7, -2], [4, 5], [-5, 4], [6, -6], [0, -8],
    ];
    const stars = STAR_POSITIONS.map(([sx, sz]) => {
      const starGeo = new T.SphereGeometry(0.14, 12, 12);
      const starMat = new T.MeshBasicMaterial({ color: 0xFFD700 });
      const star = new T.Mesh(starGeo, starMat);
      star.position.set(sx, 0.14, sz);
      scene.add(star);

      // Star glow
      const sgGeo = new T.SphereGeometry(0.35, 10, 10);
      const sgMat = new T.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.12 });
      const sg = new T.Mesh(sgGeo, sgMat);
      star.add(sg);

      return { mesh: star, glowMat: sgMat, baseMat: starMat, sx, sz };
    });

    // ── Sun (central massive body, fixed) ──
    const sunGeo = new T.SphereGeometry(0.6, 24, 24);
    const sunMat = new T.MeshBasicMaterial({ color: 0xFFA500 });
    const sun = new T.Mesh(sunGeo, sunMat);
    sun.position.set(0, 0.6, 0);
    scene.add(sun);
    const sunGlowGeo = new T.SphereGeometry(1.2, 16, 16);
    const sunGlowMat = new T.MeshBasicMaterial({ color: 0xFF8C00, transparent: true, opacity: 0.15 });
    sun.add(new T.Mesh(sunGlowGeo, sunGlowMat));

    let t = 0;
    let rafId;

    function tick() {
      t += 0.007;

      // Earth orbit (elliptical, relativistic speed)
      const a = 8.5, b = 6.0; // semi-axes
      const px = Math.cos(t * 0.5) * a;
      const pz = Math.sin(t * 0.5) * b;
      earth.position.x = px;
      earth.position.z = pz;

      // Lorentz contraction: compress Earth in direction of velocity
      const vx = -Math.sin(t * 0.5) * 0.5 * a;
      const vz =  Math.cos(t * 0.5) * 0.5 * b;
      const spd = Math.sqrt(vx * vx + vz * vz) * 0.12;
      const gamma = 1 / Math.sqrt(Math.max(0.001, 1 - Math.min(spd * spd, 0.98)));
      const inv = Math.max(0.3, 1 / gamma);
      // Rotate Earth scale along velocity direction
      const angle = Math.atan2(vz, vx);
      earth.rotation.y = -angle;
      earth.scale.set(inv, 1, 1);

      // Trail
      trailHistory.unshift([px, 0.45, pz]);
      if (trailHistory.length > TRAIL) trailHistory.pop();
      for (let i = 0; i < TRAIL; i++) {
        const h = trailHistory[i] || [px, 0.45, pz];
        trailF[i * 3] = h[0]; trailF[i * 3 + 1] = h[1]; trailF[i * 3 + 2] = h[2];
      }
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.setDrawRange(0, trailHistory.length);

      // Grid deformation: gravitational wells from Earth + Sun
      const pa = ptGeo.attributes.position;
      for (let i = 0; i < pa.count; i++) {
        const bx = basePts[i * 2], bz = basePts[i * 2 + 1];

        // Earth's gravitational well
        const dx = bx - px, dz = bz - pz;
        const de = Math.sqrt(dx * dx + dz * dz) + 0.5;
        const earthWell = -1.4 / (de + 0.6);

        // Sun's gravitational well (central, stronger)
        const ds = Math.sqrt(bx * bx + bz * bz) + 0.5;
        const sunWell = -2.2 / (ds + 0.8);

        // Lorentz contraction wave from Earth motion
        const wave = Math.sin(de * 1.5 - t * 3) * Math.exp(-de * 0.3) * 0.5;

        pa.setY(i, earthWell + sunWell + wave);
      }
      pa.needsUpdate = true;

      // Star glow based on proximity to Earth
      stars.forEach(star => {
        const dx = star.sx - px, dz = star.sz - pz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const proximity = Math.max(0, 1 - dist / 3.5);
        star.glowMat.opacity = 0.1 + proximity * 0.6;
        star.baseMat.color.setHSL(0.14, 1, 0.5 + proximity * 0.4);
        // Pulse all stars gently
        const pulse = 0.12 + Math.sin(t * 2 + star.sx) * 0.05;
        star.glowMat.opacity = Math.max(star.glowMat.opacity, pulse);
      });

      // Sun pulse
      sunGlowMat.opacity = 0.12 + Math.sin(t * 1.5) * 0.05;

      // Slow camera orbit
      camera.position.x = Math.sin(t * 0.03) * 20;
      camera.position.z = Math.cos(t * 0.03) * 20;
      camera.lookAt(0, -2, 0);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />;
}

// ── Role icons ─────────────────────────────────────────────────────
const RoleIcons = {
  estudiante: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 19c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 7L18 4l1 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
    </svg>
  ),
  profesor: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="14" width="18" height="6" rx="0" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 14V8l6-4 6 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 14v-4h4v4" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  revisor: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L20 6v6c0 5-4 8-9 9-5-1-9-4-9-9V6L11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  investigador: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="11" cy="11" rx="10" ry="4" transform="rotate(30 11 11)" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
      <ellipse cx="11" cy="11" rx="10" ry="4" transform="rotate(-30 11 11)" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
    </svg>
  ),
  laboratorio: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M8 3h6M9 3v5l-4.5 9A1.5 1.5 0 005.8 19h10.4a1.5 1.5 0 001.3-2l-4.5-9V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5 14h7" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
    </svg>
  ),
  sponsor: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M6 3h10l4.5 5.5-9.5 10.5-9.5-10.5L6 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 8.5h17M6 3l4.5 5.5 1 10M16 3l-4.5 5.5-1 10" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const ROLE_BG = {
  estudiante: 'var(--violet)',
  profesor: '#3D6BF5',
  revisor: '#2E4F9B',
  investigador: '#00D8F6',
  laboratorio: '#00E676',
  sponsor: '#FFB300',
};

// ── Role selector (single, no duplicate) ─────────────────────────
function RoleSelector({ selected, onSelect }) {
  const roles = [
    { id: 'estudiante', label: 'Estudiante', desc: 'Debate con IA · grafo de conocimiento' },
    { id: 'profesor',   label: 'Profesor',   desc: 'Audita el proceso cognitivo' },
    { id: 'revisor',    label: 'Revisor',    desc: 'Verifica hashes · Axiom L2' },
    { id: 'investigador', label: 'Investigador', desc: 'Analiza grafos · K-Merge' },
    { id: 'laboratorio',  label: 'Laboratorio',  desc: 'Control de datos · docs' },
    { id: 'sponsor',      label: 'Sponsor',      desc: 'Valida valor · financiación' },
  ];
  const idx = roles.findIndex(r => r.id === selected);
  const row = Math.floor(idx / 3);
  const col = idx % 3;

  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
        ROL DE ACCESO
      </label>
      <div style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        background: 'var(--slate)',
        border: '1px solid var(--border)',
        padding: 4,
        gap: 3
      }}>
        {/* Sliding highlight */}
        <div style={{
          position: 'absolute', zIndex: 0,
          top: `calc(${row * 50}% + 4px)`,
          left: `calc(${col * (100 / 3)}% + 4px)`,
          width: `calc(${100 / 3}% - ${16 / 3}px)`,
          height: 'calc(50% - 8px)',
          background: ROLE_BG[selected] || 'var(--violet)',
          transition: 'left 260ms cubic-bezier(0.25,0,0.35,1), top 260ms cubic-bezier(0.25,0,0.35,1), background 260ms ease',
          boxShadow: `0 0 14px ${ROLE_BG[selected] || 'var(--violet)'}66`,
        }} />
        {roles.map(role => (
          <button key={role.id} onClick={() => onSelect(role.id)} style={{
            zIndex: 1, position: 'relative', padding: '11px 5px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            color: selected === role.id ? 'white' : 'var(--text-dim)',
            transition: 'color 200ms ease',
          }}>
            <span style={{ opacity: selected === role.id ? 1 : 0.45, transition: 'opacity 200ms' }}>
              {RoleIcons[role.id]}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{role.label}</span>
            <span style={{ fontSize: 9, opacity: selected === role.id ? 0.75 : 0.35, textAlign: 'center', lineHeight: 1.3, fontFamily: 'JetBrains Mono', transition: 'opacity 200ms', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 90 }}>{role.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Shared field ──────────────────────────────────────────────────
function Field({ label, type = 'text', placeholder, value, onChange, autoFocus }) {
  const [f, setF] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} autoFocus={autoFocus}
        style={{
          width: '100%', background: 'var(--slate)',
          border: `1px solid ${f ? 'var(--violet)' : 'var(--border)'}`,
          borderRadius: '2px', padding: '11px 14px', color: 'var(--text)',
          fontSize: 13, fontFamily: 'DM Sans', outline: 'none', transition: 'border-color 150ms',
        }}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.71 5.3-1.93l-2.58-2a4.8 4.8 0 01-7.14-2.52H1v2.07A8 8 0 008 16z" fill="#34A853"/>
      <path d="M3.58 9.55A4.8 4.8 0 013.38 8c0-.54.1-1.06.2-1.55V4.38H1A8 8 0 000 8c0 1.29.31 2.5.86 3.57l2.72-2.02z" fill="#FBBC05"/>
      <path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 001 4.38l2.72 2.07C4.42 4.7 6.04 3.18 8 3.18z" fill="#EA4335"/>
    </svg>
  );
}

function PrimaryBtn({ children, onClick, loading }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px', background: 'var(--violet)',
      border: '2px solid rgba(0,0,0,0.2)', borderRadius: '2px', color: 'white',
      fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em',
      boxShadow: hov ? '5px 5px 0 var(--violet-deep)' : '3px 3px 0 var(--violet-deep)',
      transform: hov ? 'translate(-2px,-2px)' : '',
      transition: 'all 120ms cubic-bezier(0.25,0,0.35,1)',
      opacity: loading ? 0.7 : 1,
    }}
    onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {loading ? 'Verificando…' : children}
    </button>
  );
}

// ── Login form — SINGLE role selector, no duplicate ───────────────
function LoginForm({ role, onRoleChange, onLogin, onGoRegister, onGoForgot }) {
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

  const handle = () => {
    if (!email || !pass) { setErr('Completa todos los campos.'); return; }
    setLoading(true); setErr('');
    setTimeout(() => { setLoading(false); onLogin(role); }, 1100);
  };

  const roleLabel = {
    estudiante: 'Estudiante',
    profesor: 'Profesor',
    revisor: 'Revisor',
    investigador: 'Investigador',
    laboratorio: 'Laboratorio',
    sponsor: 'Sponsor',
  }[role] || 'Estudiante';

  return (
    <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Brand */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, background: ROLE_BG[role] || 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(110,84,255,0.5)', transition: 'background 300ms' }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 3.5v5L6 11 1 8.5v-5L6 1z" fill="white"/></svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em' }}>Lorentz.ai</span>
          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'white', background: ROLE_BG[role], padding: '2px 7px', transition: 'background 300ms' }}>{roleLabel.toUpperCase()}</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 3 }}>Iniciar sesión</h2>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>Acceso {roleLabel.toLowerCase()} · Nodo institucional</p>
      </div>

      {/* Single role selector */}
      <RoleSelector selected={role} onSelect={onRoleChange} />

      {/* Google */}
      <button style={{
        width: '100%', padding: '11px', background: 'transparent', border: '1px solid var(--border)',
        borderRadius: '2px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet-20)'; e.currentTarget.style.color = 'var(--text)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
        <GoogleIcon /> Continuar con Google
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-dim)', fontSize: 11, fontFamily: 'JetBrains Mono' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} /><span>O</span><div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Fields */}
      <Field label="Correo institucional" type="email" placeholder="johannes@universidad.edu" value={email} onChange={setEmail} autoFocus />
      <Field label="Contraseña" type="password" placeholder="••••••••" value={pass} onChange={setPass} />

      {err && <div style={{ padding: '7px 12px', background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.3)', fontSize: 12, color: 'var(--error)', fontFamily: 'JetBrains Mono' }}>{err}</div>}

      <PrimaryBtn onClick={handle} loading={loading}>Iniciar sesión →</PrimaryBtn>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--violet-bright)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: 'DM Sans', padding: 0 }} onClick={onGoForgot}>¿Olvidaste tu contraseña?</button>
        <button style={{ background: 'none', border: 'none', color: 'var(--violet-bright)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: 'DM Sans', padding: 0 }} onClick={onGoRegister}>Crear cuenta</button>
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────────────────────────
function RegisterForm({ role, onDone, onBack }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [loading, setLoading] = useState(false);
  const handle = () => { if (!name || !email || !pass) return; setLoading(true); setTimeout(() => { setLoading(false); onDone(role); }, 1400); };
  return (
    <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Crear cuenta</h2><p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>Registro permanente en Axiom L2</p></div>
      <Field label="Nombre completo" placeholder="Johannes Droste" value={name} onChange={setName} autoFocus />
      <Field label="Correo institucional" type="email" placeholder="johannes@universidad.edu" value={email} onChange={setEmail} />
      <Field label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={pass} onChange={setPass} />
      <div style={{ padding: '8px 12px', background: 'var(--violet-06)', border: '1px solid var(--violet-20)', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', lineHeight: 1.6 }}>Tu identidad académica se registrará de forma inmutable en Axiom L2.</div>
      <PrimaryBtn onClick={handle} loading={loading}>Crear cuenta →</PrimaryBtn>
      <div style={{ textAlign: 'center' }}><button style={{ background: 'none', border: 'none', color: 'var(--violet-bright)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: 'DM Sans', padding: 0 }} onClick={onBack}>← Volver</button></div>
    </div>
  );
}

// ── Forgot ────────────────────────────────────────────────────────
function ForgotForm({ onBack }) {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false);
  const handle = () => { if (!email) return; setLoading(true); setTimeout(() => { setLoading(false); setSent(true); }, 1200); };
  return (
    <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Recuperar acceso</h2><p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>Enlace de verificación a tu correo</p></div>
      {sent ? <div style={{ padding: 'var(--s3)', background: 'rgba(78,236,170,0.07)', border: '1px solid rgba(78,236,170,0.25)' }}><div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--success)', letterSpacing: '0.1em', marginBottom: 8 }}>ENLACE ENVIADO</div><p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>Revisa tu bandeja en <strong style={{ color: 'var(--violet-bright)' }}>{email}</strong>. Expira en 15 min.</p></div>
        : <><Field label="Correo institucional" type="email" placeholder="johannes@universidad.edu" value={email} onChange={setEmail} autoFocus /><PrimaryBtn onClick={handle} loading={loading}>Enviar enlace →</PrimaryBtn></>}
      <div style={{ textAlign: 'center' }}><button style={{ background: 'none', border: 'none', color: 'var(--violet-bright)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: 'DM Sans', padding: 0 }} onClick={onBack}>← Volver</button></div>
    </div>
  );
}

// ── Main login screen ─────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [view, setView] = useState('login');
  const [role, setRole] = useState('estudiante');

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', background: 'var(--void)', zIndex: 100, overflow: 'hidden' }}>
      {/* Left: Three.js */}
      <div style={{ width: '44%', position: 'relative', overflow: 'hidden', background: 'var(--deep)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: 'var(--s5)' }}>
        <SpacetimeAnimation />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(transparent, var(--deep))', zIndex: 1, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 'var(--s3)' }}>
            <div style={{ width: 38, height: 38, background: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(110,84,255,0.6), 4px 4px 0 var(--violet-deep)' }}>
              <svg width="18" height="18" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 3.5v5L6 11 1 8.5v-5L6 1z" fill="white"/></svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>Lorentz.ai</h1>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 'var(--s3)' }}>
            Audita el proceso de pensamiento del estudiante — verificable criptográficamente en Axiom L2.
          </p>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
            Espaciotiempo de Minkowski · Contracción de Lorentz · Curva gravitacional
          </div>
        </div>
      </div>

      {/* Right: form — NO duplicate role selector */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--s5)', overflowY: 'auto' }}>
        {view === 'login' && (
          <LoginForm
            role={role}
            onRoleChange={setRole}
            onLogin={r => onLogin(r || role)}
            onGoRegister={() => setView('register')}
            onGoForgot={() => setView('forgot')}
          />
        )}
        {view === 'register' && <RegisterForm role={role} onDone={r => onLogin(r || role)} onBack={() => setView('login')} />}
        {view === 'forgot'   && <ForgotForm onBack={() => setView('login')} />}
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
