// RainbowKitModal.jsx — High-fidelity Web3 wallet connection modal (RainbowKit layout)
const { useState, useEffect } = React;

const WALLET_LIST = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <path d="M29.5 14.2l-2.7-8.6-6-2.5-3.3 5.4v5l4 3.7 8-3z" fill="#E2761B"/>
        <path d="M2.5 14.2l2.7-8.6 6-2.5 3.3 5.4v5l-4 3.7-8-3z" fill="#E4761B"/>
        <path d="M25.3 22l1.5-6.8-7.3 2.7-1 5.3 6.8-1.2z" fill="#D7C1B1"/>
        <path d="M6.7 22l-1.5-6.8 7.3 2.7 1 5.3-6.8-1.2z" fill="#D7C1B1"/>
        <path d="M11 25.5l5 2.5 5-2.5-1.5-5.5H12.5l-1.5 5.5z" fill="#F2C39B"/>
        <path d="M16 11.5l3.2 4-3.2 2.3-3.2-2.3 3.2-4z" fill="#D7C1B1"/>
        <path d="M26.8 15.2l-4.5-4-3.3 1.8 1.5 3 6.3-.8z" fill="#E2761B"/>
        <path d="M5.2 15.2l4.5-4 3.3 1.8-1.5 3-6.3-.8z" fill="#E2761B"/>
        <path d="M16 3.1l-3 4.4h6l-3-4.4z" fill="#E47622"/>
      </svg>
    ),
    popular: true
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="url(#rainbowGrad)"/>
        <defs>
          <linearGradient id="rainbowGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF5C5C"/>
            <stop offset="0.3" stopColor="#FFB84D"/>
            <stop offset="0.6" stopColor="#4DECAA"/>
            <stop offset="1" stopColor="#6E54FF"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    popular: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#0052FF"/>
        <rect x="10" y="10" width="12" height="12" rx="2" fill="white"/>
      </svg>
    )
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <path d="M23.6 11.6a9.9 9.9 0 0 0-15.2 0l-.8.9a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l1.2-1.2c2.4-2.4 6.3-2.4 8.7 0l1.1 1.2a1 1 0 0 0 1.5 0l1.6-1.6a1 1 0 0 0 0-1.4l-.9-.9z" fill="#3B99FC"/>
        <path d="M23.9 17l1.6 1.6a1 1 0 0 1 0 1.4l-3.9 3.9a1 1 0 0 1-1.4 0l-4-4a.4.4 0 0 0-.5 0l-4 4a1 1 0 0 1-1.4 0l-3.9-3.9a1 1 0 0 1 0-1.4l1.6-1.6a1 1 0 0 1 1.4 0l2.9 2.9c.2.2.6.2.8 0l2.9-2.9a1.6 1.6 0 0 1 2.2 0l2.9 2.9c.2.2.6.2.8 0l2.9-2.9a1 1 0 0 1 1.4 0z" fill="#3B99FC"/>
      </svg>
    )
  }
];

function RainbowKitModal({ onClose, onConnect }) {
  const [selectedWallet, setSelectedWallet] = useState('metamask');
  const [connecting, setConnecting]       = useState(false);
  const [errorMsg, setErrorMsg]             = useState('');

  const handleWalletSelect = (walletId) => {
    setSelectedWallet(walletId);
    setErrorMsg('');
  };

  const connectRealWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setErrorMsg('No se detectó ninguna billetera Web3 (como MetaMask o Rabby) en tu navegador. Por favor instala una extensión de billetera para continuar.');
      return;
    }

    setConnecting(true);
    setErrorMsg('');

    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No se encontraron cuentas autorizadas.');
      }

      const address = accounts[0];

      // Switch to Monad Testnet (Chain ID 10143 = 0x279f)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x279f' }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x279f',
                chainName: 'Monad Testnet',
                nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
                rpcUrls: ['https://testnet-rpc.monad.xyz'],
                blockExplorerUrls: ['https://testnet-rpc.monad.xyz'] // Fallback or Explorer URL
              }]
            });
          } catch (addError) {
            console.error('Error adding Monad Testnet:', addError);
          }
        } else {
          console.error('Error switching chain:', switchError);
        }
      }

      // Fetch balance from Monad Testnet RPC
      let balance = '0.0000';
      try {
        const response = await fetch('https://testnet-rpc.monad.xyz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
          })
        });
        const rpcData = await response.json();
        if (rpcData.result) {
          const wei = BigInt(rpcData.result);
          balance = (Number(wei) / 1e18).toFixed(4);
        }
      } catch (rpcErr) {
        console.error('Error fetching balance from Monad RPC:', rpcErr);
      }

      setConnecting(false);
      onConnect(address, balance, true); // address, balance, isReal
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar billetera.');
      setConnecting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(7,7,14,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeUp 0.2s cubic-bezier(0.25,0,0.35,1) both'
    }}>
      {/* Modal Container */}
      <div style={{
        width: '100%', maxWidth: 650, height: 440,
        background: 'var(--slate)', border: '1px solid var(--border)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.8), 4px 4px 0 var(--violet-deep)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, background: 'var(--violet)', borderRadius: '50%' }} />
            Conectar Billetera (RainbowKit)
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-dim)',
              fontSize: 22, cursor: 'pointer', transition: 'color 150ms'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >×</button>
        </div>

        {/* Body Split */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Left Panel: Wallet options */}
          <div style={{
            width: 250, borderRight: '1px solid var(--border)',
            background: 'var(--deep)', padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)', padding: '6px 8px', letterSpacing: '0.05em' }}>BILLETERAS COMPATIBLES</div>
            {WALLET_LIST.map(wallet => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: selectedWallet === wallet.id ? 'var(--violet-10)' : 'transparent',
                  border: selectedWallet === wallet.id ? '1px solid var(--violet-20)' : '1px solid transparent',
                  borderRadius: '2px', cursor: 'pointer', textAlign: 'left',
                  color: selectedWallet === wallet.id ? 'var(--text)' : 'var(--text-muted)',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => {
                  if (selectedWallet !== wallet.id) {
                    e.currentTarget.style.background = 'var(--slate)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedWallet !== wallet.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <span style={{ display: 'flex' }}>{wallet.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{wallet.name}</span>
                {wallet.popular && (
                  <span style={{
                    fontSize: 8, fontFamily: 'JetBrains Mono', background: 'var(--border)',
                    padding: '2px 6px', color: 'var(--text-muted)', borderRadius: '20px'
                  }}>POPULAR</span>
                )}
              </button>
            ))}
          </div>

          {/* Right Panel: Selected Wallet Connection Details */}
          <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'var(--slate)' }}>
            {connecting ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                {/* Circular spinner */}
                <div style={{
                  width: 50, height: 50, border: '3px solid var(--border)',
                  borderTop: '3px solid var(--violet-bright)', borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                    Esperando aprobación de billetera...
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    Confirma la solicitud de conexión en tu extensión de billetera.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: '50%', background: 'var(--deep)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)', boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                  }}>
                    {WALLET_LIST.find(w => w.id === selectedWallet)?.icon}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    Conectar con {WALLET_LIST.find(w => w.id === selectedWallet)?.name}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5 }}>
                    Accede a Lorentz.ai utilizando criptografía descentralizada en la red <strong style={{ color: 'var(--success)' }}>Monad Testnet</strong> (Chain ID 10143).
                  </p>

                  {errorMsg && (
                    <div style={{
                      padding: '8px 12px', background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.25)',
                      color: 'var(--error)', fontSize: 11, fontFamily: 'JetBrains Mono', maxWidth: 300, textAlign: 'left',
                      lineHeight: 1.4, marginTop: 4
                    }}>
                      {errorMsg}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280, marginBottom: 12 }}>
                  <button
                    onClick={connectRealWallet}
                    style={{
                      width: '100%', padding: '12px', background: 'var(--violet)', border: 'none',
                      borderRadius: '2px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(110,84,255,0.4)', transition: 'transform 100ms, background 150ms'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--violet-deep)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet)'; }}
                  >
                    Establecer Conexión →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RainbowKitModal });
