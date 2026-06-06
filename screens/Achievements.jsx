// Achievements.jsx — Logros y Certificaciones NFT en Monad Testnet
const { useState, useEffect } = React;

const ROLE_ACHIEVEMENTS = {
  estudiante: {
    title: 'Academia del Estudiante',
    score: 91,
    monEarned: 45.5,
    achievements: [
      { id: 'est_1', title: 'Debatiente Estelar', desc: 'Discutió efectos relativistas con el acompañante IA.', unlocked: true, date: '01/06/2026', icon: '✨' },
      { id: 'est_2', title: 'Grafo Convergente', desc: 'Fusionó 3 ramas distintas de conocimiento en un meta-nodo.', unlocked: true, date: '03/06/2026', icon: '🧠' },
      { id: 'est_3', title: 'Pionero de Axiom', desc: 'Alcanzó 10 transacciones validadas en la L2.', unlocked: false, requirement: 'Requiere 10 transacciones en Axiom L2 (Llevas 6)', icon: '⚡' },
    ],
    certs: [
      { id: 'cert_est_1', name: 'Iniciación en Spacetime', tokenId: '#1042', hash: '0xbc72e12a98f45a1c328ef782d43e5c9b6e8a', status: 'minted', contract: '0x3a9de0143890c5c4e5e97d79d6e30128b9361661' },
      { id: 'cert_est_2', name: 'Máster en Relatividad Especial', tokenId: '#1893', status: 'available', contract: '0x5b39ad2e7c9c42b7128d2ef7c9c42b7128d2ef7c' },
    ]
  },
  profesor: {
    title: 'Consorcio del Profesorado',
    score: 95,
    monEarned: 120.0,
    achievements: [
      { id: 'prof_1', title: 'Guía Cognitivo', desc: 'Auditó exitosamente 5 árboles de conversación de estudiantes.', unlocked: true, date: '28/05/2026', icon: '🧭' },
      { id: 'prof_2', title: 'Sello del Axioma', desc: 'Selló 12 firmas inmutables de estudiantes en Axiom L2.', unlocked: true, date: '02/06/2026', icon: '🛡️' },
      { id: 'prof_3', title: 'Cátedra Cuántica', desc: 'Auditó nodos de 10 estudiantes diferentes.', unlocked: false, requirement: 'Requiere auditar 10 estudiantes (Llevas 6)', icon: '🎓' },
    ],
    certs: [
      { id: 'cert_prof_1', name: 'Certificación en Mentoría Web3', tokenId: '#2018', hash: '0x71ed96362a74286665796248a3138f321cd4ea7e', status: 'minted', contract: '0x8b3d7f2c6a2b3c9e1d4e5b9a7f2c6a2b3c9e1d4e' },
      { id: 'cert_prof_2', name: 'Acreditación de Auditoría Lorentz', tokenId: '#2099', status: 'available', contract: '0x2e7c4f2a8b3d6a2b3c9e1d4e5b9a7f2c6a2b3c9e' },
    ]
  },
  revisor: {
    title: 'Comité de Revisión Académica',
    score: 88,
    monEarned: 85.0,
    achievements: [
      { id: 'rev_1', title: 'Ojo de Halcón', desc: 'Validó 15 payloads de transacciones académicas.', unlocked: true, date: '30/05/2026', icon: '👁️' },
      { id: 'rev_2', title: 'Consistencia Axiom', desc: 'Verificó 20 hashes en bloques firmados.', unlocked: true, date: '04/06/2026', icon: '🔒' },
      { id: 'rev_3', title: 'Criptógrafo Maestro', desc: 'Corrió el script de auditoría sobre 100 bloques seguidos.', unlocked: false, requirement: 'Requiere auditar 100 bloques (Llevas 42)', icon: '🗝️' },
    ],
    certs: [
      { id: 'cert_rev_1', name: 'Sello de Auditor Académico L2', tokenId: '#3054', hash: '0x1d4e5b9a7f2c6a2b3c9e1d4e5b9a7f2c6a2b3c9e', status: 'minted', contract: '0x9c42b7128d2ef7c9c42b7128d2ef7c9c42b7128d2ef' },
      { id: 'cert_rev_2', name: 'Licencia de Validador Lorentz', tokenId: '#3102', status: 'available', contract: '0x5240cc9b8aff5240cc9b8aff5240cc9b8aff5240cc9b' },
    ]
  },
  investigador: {
    title: 'Gabinete de Investigación',
    score: 93,
    monEarned: 150.0,
    achievements: [
      { id: 'inv_1', title: 'Analista de Grafos', desc: 'Analizó y estructuró 8 grafos de conocimiento científico.', unlocked: true, date: '29/05/2026', icon: '📊' },
      { id: 'inv_2', title: 'K-Merge Origin', desc: 'Confirmó 6 commits académicos en Lorentz_Force.tex.', unlocked: true, date: '01/06/2026', icon: '🐙' },
      { id: 'inv_3', title: 'Teoría Unificada', desc: 'Generó un nodo teórico con profundidad mayor a 8.0.', unlocked: false, requirement: 'Requiere profundidad de nodo > 8.0 (Máx. actual 7.4)', icon: '⚛️' },
    ],
    certs: [
      { id: 'cert_inv_1', name: 'Diploma en Física Teórica L2', tokenId: '#4082', hash: '0x4f2a8b3d6a2b3c9e1d4e5b9a7f2c6a2b3c9e1d4e', status: 'minted', contract: '0x00d8f600d8f600d8f600d8f600d8f600d8f600d8' },
      { id: 'cert_inv_2', name: 'Patente de Cripto-Física Relativista', tokenId: '#4115', status: 'available', contract: '0x00e67600e67600e67600e67600e67600e67600e6' },
    ]
  },
  laboratorio: {
    title: 'Consorcio de Laboratorios',
    score: 90,
    monEarned: 210.0,
    achievements: [
      { id: 'lab_1', title: 'Muestreo Inmutable', desc: 'Registró 4 lotes de datos experimentales en K-Merge.', unlocked: true, date: '27/05/2026', icon: '🧪' },
      { id: 'lab_2', title: 'Validador de Constantes', desc: 'Monitoreó experimentos sobre la constancia de la velocidad de la luz c.', unlocked: true, date: '31/05/2026', icon: '🚨' },
      { id: 'lab_3', title: 'Súper Computación', desc: 'Ejecutó 30 simulaciones simultáneas en Monad.', unlocked: false, requirement: 'Requiere 30 simulaciones (Llevas 18)', icon: '🖥️' },
    ],
    certs: [
      { id: 'cert_lab_1', name: 'Licencia de Lab Descentralizado', tokenId: '#5091', hash: '0x8b3d7f2c6a2b3c9e1d4e5b9a7f2c6a2b3c9e1d4e', status: 'minted', contract: '0x10b98110b98110b98110b98110b98110b98110b9' },
      { id: 'cert_lab_2', name: 'Acreditación Lorentz.ai Laboratory', tokenId: '#5122', status: 'available', contract: '0x05c46b05c46b05c46b05c46b05c46b05c46b05c46b' },
    ]
  },
  sponsor: {
    title: 'Gabinete de Patrocinio',
    score: 97,
    monEarned: 890.0,
    achievements: [
      { id: 'spon_1', title: 'Mecenas de Spacetime', desc: 'Apoyó el financiamiento de 3 proyectos científicos activos.', unlocked: true, date: '25/05/2026', icon: '💎' },
      { id: 'spon_2', title: 'Subvención de Gas L2', desc: 'Financió más de 100,000 transacciones en el validador.', unlocked: true, date: '04/06/2026', icon: '⛽' },
      { id: 'spon_3', title: 'Inversor Titán', desc: 'Financiar 1M de transacciones inmutables.', unlocked: false, requirement: 'Requiere patrocinar 1M de txs (Llevas 420K)', icon: '👑' },
    ],
    certs: [
      { id: 'cert_spon_1', name: 'Socio Fundador Lorentz.ai', tokenId: '#6001', hash: '0x9c4d2e7c4f2a8b3d6a2b3c9e1d4e5b9a7f2c6a2b3c9e', status: 'minted', contract: '0xffb300ffb300ffb300ffb300ffb300ffb300ffb300' },
      { id: 'cert_spon_2', name: 'Insignia de Consorcio Global', tokenId: '#6012', status: 'available', contract: '0xff9f00ff9f00ff9f00ff9f00ff9f00ff9f00ff9f00' },
    ]
  }
};

const GAS_COST = 0.0024; // MON gas cost to mint

function AchievementsScreen({ role, walletAddress, walletBalance, setWalletBalance }) {
  const [data, setData] = useState(ROLE_ACHIEVEMENTS[role] || ROLE_ACHIEVEMENTS.estudiante);
  const [mintingCert, setMintingCert] = useState(null);
  const [signing, setSigning] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  // L2 Reputation Engine Scores
  const [repScores, setRepScores] = useState({ knowledgeScore: 45, reputationScore: 870, consistencyScore: 72 });

  // Sync data if role changes or wallet updates
  useEffect(() => {
    setData(ROLE_ACHIEVEMENTS[role] || ROLE_ACHIEVEMENTS.estudiante);
    
    // Fetch live reputation scores
    fetch(`/api/blockchain/student-reputation?student_id=JD`)
      .then(res => res.json())
      .then(d => {
        if (d && !d.error) {
          setRepScores(d);
        }
      })
      .catch(err => console.log('Err fetching student reputation:', err));
  }, [role, walletAddress]);

  const triggerMint = (cert) => {
    if (!walletAddress) {
      alert('Debes conectar tu billetera (RainbowKit) en el panel de login o en la barra superior para pagar el gas de acuñación en Monad Testnet.');
      return;
    }
    const balanceNum = parseFloat(walletBalance);
    if (balanceNum < GAS_COST) {
      alert(`Fondos insuficientes en Monad Testnet para pagar el gas.\nCosto de Gas: ${GAS_COST} MON\nTu balance: ${walletBalance} MON`);
      return;
    }
    setMintingCert(cert);
    setSigning(false);
    setSuccessAnim(false);
  };

  const handleSignAndMint = () => {
    setSigning(true);
    setTimeout(() => {
      // Create random tx hash
      const randomHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      // Deduct gas from wallet balance dynamically!
      if (walletBalance && setWalletBalance) {
        const nextBalance = (parseFloat(walletBalance) - GAS_COST).toFixed(4);
        setWalletBalance(nextBalance);
      }

      // Update certificate status locally
      const updatedCerts = data.certs.map(c => {
        if (c.id === mintingCert.id) {
          return { ...c, status: 'minted', hash: randomHash };
        }
        return c;
      });

      setData(prev => ({
        ...prev,
        certs: updatedCerts,
        monEarned: prev.monEarned + 10.0 // Give them some MON rewards for unlocking the NFT!
      }));

      setSigning(false);
      setSuccessAnim(true);

      setTimeout(() => {
        setMintingCert(null);
        setSuccessAnim(false);
      }, 2000);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--void)', padding: 'var(--s4)' }} className="fade-up">
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--s3)', marginBottom: 'var(--s4)' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Logros y Certificaciones NFT</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Asegura tus logros académicos e investigación mediante contratos inmutables en <span style={{ color: 'var(--success)' }}>Monad Testnet</span>.
          </p>
        </div>
        
        {/* Wallet info panel */}
        <div style={{
          background: 'var(--deep)', border: '1px solid var(--border)', padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 14, borderRadius: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>BILLETERA CONECTADA</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Desconectado'}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>BALANCE MONAD TESTNET</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {walletAddress ? `${walletBalance} MON` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
        {/* Reputation Score */}
        <div style={{ background: 'var(--deep)', border: '1px solid var(--border)', padding: 'var(--s3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 80, opacity: 0.04, userSelect: 'none' }}>🏆</div>
          <h4 style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Reputation Score (On-Chain)</h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>{repScores.reputationScore}</span>
            <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>REP</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border)', marginTop: 12 }}>
            <div style={{ width: `${Math.min(100, repScores.reputationScore / 10)}%`, height: '100%', background: 'var(--violet)' }} />
          </div>
        </div>

        {/* Knowledge Score */}
        <div style={{ background: 'var(--deep)', border: '1px solid var(--border)', padding: 'var(--s3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 80, opacity: 0.04, userSelect: 'none' }}>🧠</div>
          <h4 style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Knowledge Score (BKUs / AKUs)</h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--success)' }}>{repScores.knowledgeScore}</span>
            <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>PTS</span>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 12, fontFamily: 'JetBrains Mono' }}>
            Unidades de conocimiento validadas por contrato.
          </p>
        </div>

        {/* Consistency Score */}
        <div style={{ background: 'var(--deep)', border: '1px solid var(--border)', padding: 'var(--s3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 80, opacity: 0.04, userSelect: 'none' }}>⚡</div>
          <h4 style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Consistency Score</h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--warn)' }}>
              {repScores.consistencyScore}%
            </span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border)', marginTop: 12 }}>
            <div style={{ width: `${repScores.consistencyScore}%`, height: '100%', background: 'var(--warn)' }} />
          </div>
        </div>
      </div>

      {/* Grid Layout: Achievements Left, Certifications Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--s4)', minHeight: 0 }}>
        {/* Achievements list */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 'var(--s3)', borderLeft: '2px solid var(--violet)', paddingLeft: 10 }}>
            Hitos y Objetivos ({data.title})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.achievements.map(ach => (
              <div
                key={ach.id}
                style={{
                  padding: '16px 20px', background: ach.unlocked ? 'var(--deep)' : 'rgba(25,25,50,0.2)',
                  border: ach.unlocked ? '1px solid var(--border)' : '1px solid var(--border-subtle)',
                  display: 'flex', gap: 16, alignItems: 'center', transition: 'all 150ms ease'
                }}
                onMouseEnter={e => { if (ach.unlocked) e.currentTarget.style.borderColor = 'var(--violet-20)'; }}
                onMouseLeave={e => { if (ach.unlocked) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{
                  fontSize: 24, width: 44, height: 44, borderRadius: '50%',
                  background: ach.unlocked ? 'var(--slate)' : 'var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${ach.unlocked ? 'var(--border)' : 'var(--border-subtle)'}`,
                  opacity: ach.unlocked ? 1 : 0.45
                }}>{ach.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: ach.unlocked ? 'var(--text)' : 'var(--text-muted)' }}>
                      {ach.title}
                    </span>
                    {ach.unlocked ? (
                      <span style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--success)', background: 'rgba(78,236,170,0.08)', padding: '2px 6px', border: '1px solid rgba(78,236,170,0.2)' }}>
                        DESBLOQUEADO · {ach.date}
                      </span>
                    ) : (
                      <span style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', background: 'var(--border-subtle)', padding: '2px 6px' }}>
                        BLOQUEADO
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: ach.unlocked ? 'var(--text-muted)' : 'var(--text-dim)', lineHeight: 1.4 }}>
                    {ach.unlocked ? ach.desc : ach.requirement}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications (NFTs) */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 'var(--s3)', borderLeft: '2px solid var(--warn)', paddingLeft: 10 }}>
            Certificados Monad NFT
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {data.certs.map(cert => {
              const isMinted = cert.status === 'minted';
              return (
                <div
                  key={cert.id}
                  style={{
                    background: 'linear-gradient(145deg, var(--card), var(--deep))',
                    border: isMinted ? '1px solid var(--warn)' : '1px solid var(--border)',
                    boxShadow: isMinted ? '0 8px 24px rgba(255,184,77,0.1)' : 'none',
                    padding: 20, borderRadius: '2px', position: 'relative', overflow: 'hidden'
                  }}
                >
                  {/* Glowing background light for minted */}
                  {isMinted && (
                    <div style={{
                      position: 'absolute', top: -30, right: -30, width: 90, height: 90,
                      background: 'radial-gradient(circle, rgba(255,184,77,0.15) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }} />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>CERTIFICADO DE LOGRO</span>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{cert.name}</h4>
                    </div>
                    <span style={{
                      fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700,
                      color: isMinted ? 'var(--warn)' : 'var(--text-dim)'
                    }}>{cert.tokenId}</span>
                  </div>

                  {/* Metadata fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, background: 'rgba(0,0,0,0.15)', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'JetBrains Mono' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Contrato:</span>
                      <span style={{ color: 'var(--text-muted)' }}>{cert.contract.slice(0, 6)}...{cert.contract.slice(-4)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'JetBrains Mono' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Red:</span>
                      <span style={{ color: 'var(--success)' }}>Monad Testnet (10143)</span>
                    </div>
                    {isMinted && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'JetBrains Mono' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Tx Hash:</span>
                        <a
                          href={`https://testnet.monadexplorer.com/tx/${cert.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--violet-bright)', textDecoration: 'underline' }}
                        >
                          {cert.hash.slice(0, 8)}...
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Mint Button or Status */}
                  {isMinted ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: 8,
                      background: 'rgba(78,236,170,0.06)', border: '1px solid rgba(78,236,170,0.15)',
                      padding: '8px', color: 'var(--success)', fontFamily: 'JetBrains Mono', fontSize: 11,
                      justifyContent: 'center', fontWeight: 600
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
                      SEGUIDO Y MINTADO EN MONAD
                    </div>
                  ) : (
                    <button
                      onClick={() => triggerMint(cert)}
                      style={{
                        width: '100%', padding: '9px', background: 'var(--violet)', border: 'none',
                        color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        transition: 'transform 100ms, background 150ms'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--violet-deep)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--violet)'}
                    >
                      Acuñar Certificado (NFT)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Signing Transaction Modal */}
      {mintingCert && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(7,7,14,0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeUp 0.15s cubic-bezier(0.25,0,0.35,1) both'
        }}>
          <div style={{
            width: 380, background: 'var(--slate)', border: '1px solid var(--border)',
            boxShadow: '0 24px 50px rgba(0,0,0,0.7), 4px 4px 0 var(--warn)',
            padding: 24, textAlign: 'center', position: 'relative'
          }}>
            {!signing && !successAnim && (
              <>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>
                  Acuñación NFT (Monad Testnet)
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>
                  Vas a firmar una transacción Web3 para acuñar tu certificado inmutable <strong style={{ color: 'var(--warn)' }}>{mintingCert.name}</strong>.
                </p>

                <div style={{
                  background: 'var(--deep)', border: '1px solid var(--border)',
                  padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8,
                  marginBottom: 20, textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 11
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Red:</span>
                    <span style={{ color: 'var(--success)' }}>Monad Testnet</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Costo del NFT:</span>
                    <span style={{ color: 'var(--text)' }}>Gratis (Logro Académico)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Tarifa de Gas:</span>
                    <span style={{ color: 'var(--warn)' }}>{GAS_COST} MON</span>
                  </div>
                  <div style={{ width: '100%', height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text)' }}>Total a Deducir:</span>
                    <span style={{ color: 'var(--warn)' }}>{GAS_COST} MON</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setMintingCert(null)}
                    style={{
                      flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)',
                      color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSignAndMint}
                    style={{
                      flex: 1, padding: '10px', background: 'var(--warn)', border: 'none',
                      color: 'var(--void)', fontSize: 12, fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    Firmar y Acuñar
                  </button>
                </div>
              </>
            )}

            {signing && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
                <div style={{
                  width: 44, height: 44, border: '3px solid var(--border)',
                  borderTop: '3px solid var(--warn)', borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                    Procesando transacción L1...
                  </h4>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
                    Confirmando bloque en Monad Testnet RPC.
                  </p>
                </div>
              </div>
            )}

            {successAnim && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '10px 0' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', background: 'rgba(78,236,170,0.1)',
                  border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: 'var(--success)'
                }}>✓</div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
                    ¡Acuñación Exitosa!
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Tu NFT ha sido acuñado y sellado en el bloque. Se han deducido {GAS_COST} MON de tu balance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AchievementsScreen });
