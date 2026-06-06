
// App.jsx — Role-based routing with login gate
const { useState } = React;

const DEFAULT_SCREEN = {
  estudiante:   'synaptrac',
  profesor:     'professor',
  revisor:      'revisor',
  investigador: 'nexus',
  laboratorio:  'nexus',
  sponsor:      'axiom',
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole]         = useState('estudiante');
  const [screen, setScreen]     = useState('synaptrac');

  // Web3 connection states (Monad Testnet)
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0.0000');
  const [isWalletReal, setIsWalletReal]   = useState(false);
  const [showRainbowKitModal, setShowRainbowKitModal] = useState(false);

  const handleLogin = (r) => {
    const chosenRole = r || 'estudiante';
    setRole(chosenRole);
    setScreen(DEFAULT_SCREEN[chosenRole] || 'synaptrac');
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setRole('estudiante');
    setScreen('synaptrac');
    setWalletAddress(null);
    setWalletBalance('0.0000');
    setIsWalletReal(false);
  };

  const handleConnectWallet = (address, balance, isReal) => {
    setWalletAddress(address);
    setWalletBalance(balance);
    setIsWalletReal(isReal);
    // Auto log in if not logged in
    if (!loggedIn) {
      handleLogin(role);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance('0.0000');
    setIsWalletReal(false);
  };

  if (!loggedIn) {
    return (
      <>
        <LoginScreen
          onLogin={handleLogin}
          role={role}
          setRole={setRole}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          onOpenWalletModal={() => setShowRainbowKitModal(true)}
        />
        {showRainbowKitModal && (
          <RainbowKitModal
            onClose={() => setShowRainbowKitModal(false)}
            onConnect={handleConnectWallet}
          />
        )}
      </>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'nexus':        return <NexusScreen />;
      case 'synaptrac':    return <SynaptracScreen />;
      case 'graph':        return <GraphScreen />;
      case 'kmerge':       return <KMergeScreen />;
      case 'discursus':    return <DiscursusScreen />;
      case 'professor':    return <ProfessorScreen />;
      case 'cursos':       return <CursosScreen />;
      case 'revisor':      return <RevisorScreen />;
      case 'axiom':        return <AxiomScreen />;
      case 'profile':      return <ProfileScreen />;
      case 'achievements': return <AchievementsScreen role={role} walletAddress={walletAddress} walletBalance={walletBalance} setWalletBalance={setWalletBalance} />;
      default:             return <SynaptracScreen />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--void)', color: 'var(--text)' }}>
      <Sidebar
        screen={screen}
        setScreen={setScreen}
        role={role}
        onLogout={handleLogout}
        walletAddress={walletAddress}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar
          screen={screen}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          onOpenWalletModal={() => setShowRainbowKitModal(true)}
          onDisconnectWallet={handleDisconnectWallet}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {renderScreen()}
        </div>
      </div>
      {showRainbowKitModal && (
        <RainbowKitModal
          onClose={() => setShowRainbowKitModal(false)}
          onConnect={handleConnectWallet}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
