
// App.jsx — Role-based routing with login gate
const { useState } = React;

const DEFAULT_SCREEN = {
  estudiante:   'synaptrac',
  profesor:     'professor',
  revisor:      'revisor',
  investigador: 'synaptrac',
  laboratorio:  'kmerge',
  sponsor:      'axiom',
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole]         = useState('estudiante');
  const [screen, setScreen]     = useState('synaptrac');

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
  };

  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    switch (screen) {
      case 'synaptrac':  return <SynaptracScreen />;
      case 'graph':      return <GraphScreen />;
      case 'kmerge':     return <KMergeScreen />;
      case 'discursus':  return <DiscursusScreen />;
      case 'professor':  return <ProfessorScreen />;
      case 'revisor':    return <RevisorScreen />;
      case 'axiom':      return <AxiomScreen />;
      case 'profile':    return <ProfileScreen />;
      default:           return <SynaptracScreen />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--void)', color: 'var(--text)' }}>
      <Sidebar
        screen={screen}
        setScreen={setScreen}
        role={role}
        onLogout={handleLogout}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar screen={screen} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
