import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Dashboard from './Pages/Dashboard';
import ArticlesPage from './Pages/ArticlesPage';
import CommandesPage from './Pages/CommandesPage';
import LivraisonsPage from './Pages/LivraisonsPage';
import LogsPage from './Pages/LogsPage';

// Composants
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Services
import { checkApiConnection } from './services/api';

// Thème Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Créer un contexte pour partager les logs
export const AppContext = React.createContext();

function App() {
  const [apiConnected, setApiConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState([]);

  // Vérifier la connexion API au démarrage
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await checkApiConnection();
        setApiConnected(result.success);
        
        if (result.success) {
          addLog('✅ Connexion API établie', 'success');
        } else {
          addLog('❌ API non disponible', 'error');
          toast.error('API non disponible. Vérifiez le serveur backend.');
        }
      } catch (error) {
        setApiConnected(false);
        addLog('❌ Erreur connexion API', 'error');
        toast.error('Impossible de se connecter à l\'API');
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Vérifier toutes les 30s
    
    return () => clearInterval(interval);
  }, []);

  // Fonction pour ajouter des logs
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      timestamp,
      message,
      type
    };
    
    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]); // Garder max 100 logs
    
    // Afficher une notification toast pour les erreurs
    if (type === 'error') {
      toast.error(message);
    } else if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast.warning(message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContext.Provider value={{ logs, addLog, apiConnected }}>
        <Router>
          <div className="app" style={{ display: 'flex', minHeight: '100vh' }}>
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            
            <Sidebar 
              open={sidebarOpen} 
              onToggle={() => setSidebarOpen(!sidebarOpen)} 
              apiConnected={apiConnected}
            />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Header 
                onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                apiConnected={apiConnected}
              />
              
              <main style={{ flex: 1, padding: '24px', overflow: 'auto', backgroundColor: '#f5f5f5' }}>
                <Routes>
                  <Route path="/" element={<Dashboard addLog={addLog} />} />
                  <Route path="/articles" element={<ArticlesPage addLog={addLog} />} />
                  <Route path="/commandes" element={<CommandesPage addLog={addLog} />} />
                  <Route path="/livraisons" element={<LivraisonsPage addLog={addLog} />} />
                  <Route path="/logs" element={<LogsPage />} />
                </Routes>
              </main>
              
              <Footer />
            </div>
          </div>
        </Router>
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export default App;