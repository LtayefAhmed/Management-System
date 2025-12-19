import React, { useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { AppContext } from '../App';
import LogPanel from '../components/Common/LogPanel';
import DataTable from '../components/Common/DataTable';

const LogsPage = () => {
  // Dans un vrai projet, vous utiliseriez un contexte ou props
  // Pour cet exemple, je vais simuler des logs
  const [logs, setLogs] = React.useState([
    { id: 1, timestamp: '10:30:25', message: '✅ Connexion API établie', type: 'success' },
    { id: 2, timestamp: '10:31:10', message: '🔍 Recherche articles effectuée', type: 'info' },
    { id: 3, timestamp: '10:32:45', message: '➕ Article A015 ajouté', type: 'success' },
    { id: 4, timestamp: '10:33:20', message: '❌ Erreur: Article déjà existant', type: 'error' },
    { id: 5, timestamp: '10:34:05', message: '🔄 Commande #5 → PR', type: 'success' },
  ]);

  const [apiConnected, setApiConnected] = React.useState(true);
  const [dbConnected, setDbConnected] = React.useState(true);

  const handleClearLogs = () => {
    setLogs([]);
  };

  React.useEffect(() => {
    // Simuler la vérification de connexion
    const checkConnections = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/articles/test');
        const data = await response.json();
        setApiConnected(true);
        setDbConnected(data.success);
      } catch (error) {
        setApiConnected(false);
        setDbConnected(false);
      }
    };

    checkConnections();
    const interval = setInterval(checkConnections, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        📝 Logs et Surveillance
      </Typography>
      
      <Grid container spacing={3}>
        {/* Panneau de status */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              📡 État du système
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <DataTable
                apiConnected={apiConnected}
                dbConnected={dbConnected}
                size="large"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Card variant="outlined" sx={{ minWidth: 150 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="textSecondary" gutterBottom>
                      Logs actifs
                    </Typography>
                    <Typography variant="h4">
                      {logs.length}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card variant="outlined" sx={{ minWidth: 150 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="textSecondary" gutterBottom>
                      Dernière activité
                    </Typography>
                    <Typography variant="body1">
                      {logs[0]?.timestamp || 'Aucune'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Logs */}
        <Grid item xs={12}>
          <LogPanel 
            logs={logs}
            onClear={handleClearLogs}
          />
        </Grid>

        {/* Informations techniques */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              🛠️ Informations techniques
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Backend :</strong> Node.js + Express + OracleDB<br />
                <strong>Frontend :</strong> React + Material-UI<br />
                <strong>Base de données :</strong> Oracle 11g XE<br />
                <strong>Port API :</strong> 3000<br />
                <strong>Port Frontend :</strong> 3001
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              🔧 Packages testés
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { name: 'pkg_gestion_articles', status: '✅', desc: 'Gestion articles' },
                { name: 'pkg_gestion_commandes', status: '✅', desc: 'Workflow commandes' },
                { name: 'pkg_gestion_livraisons', status: '✅', desc: 'Gestion livraisons' },
              ].map((pkg) => (
                <Box key={pkg.name} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {pkg.status} {pkg.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pkg.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LogsPage;