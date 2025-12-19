import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import { commandeService } from '../services/commandes';
import CommandeForm from '../components/Commandes/CommandeForm';
import CommandeList from '../components/Commandes/CommandeList';
import CommandeStatus from '../components/Commandes/CommandeStatus';
import CommandeSearch from '../components/Commandes/CommandeSearch';

const CommandesPage = ({ addLog }) => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [statusDialog, setStatusDialog] = useState({ open: false, commande: null });

  useEffect(() => {
    handleRechercherCommandes({});
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getErrorMessage = (error) => {
    if (!error) return 'Erreur inconnue';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error) return error.error;
    if (error.details && typeof error.details === 'string') return error.details;
    try { return JSON.stringify(error.details || error); } catch { return 'Erreur inconnue'; }
  };

  const handleAjouterCommande = async (noclt) => {
    setLoading(true);
    try {
      const result = await commandeService.ajouterCommande(noclt);
      showSnackbar(`✅ Commande créée: #${result.nocde}`);
      addLog(`✅ Commande #${result.nocde} créée pour client ${noclt}`, 'success');
      
      // Rafraîchir la liste
      handleRechercherCommandes({});
    } catch (error) {
      showSnackbar(`❌ Erreur: ${error.error || 'Erreur lors de la création'}`, 'error');
      addLog(`❌ Erreur création commande: ${error.error || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRechercherCommandes = async (params) => {
    setLoading(true);
    try {
      const result = await commandeService.chercherCommandes(params);
      setCommandes(result.commandes || []);
      addLog(`🔍 ${result.commandes?.length || 0} commande(s) trouvée(s)`, 'info');
    } catch (error) {
      showSnackbar(`❌ Erreur: ${error.error || 'Erreur lors de la recherche'}`, 'error');
      addLog(`❌ Erreur recherche commandes: ${error.error || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModifierEtat = async (nocde, nouvel_etat) => {
    try {
      const result = await commandeService.modifierEtatCommande(nocde, nouvel_etat);
      showSnackbar(`✅ État modifié: ${result.message}`);
      addLog(`🔄 Commande #${nocde} → ${nouvel_etat}`, 'success');
      
      // Fermer le dialogue et rafraîchir
      setStatusDialog({ open: false, commande: null });
      handleRechercherCommandes({});
    } catch (error) {
      showSnackbar(`❌ Erreur: ${error.error || 'Erreur lors de la modification'}`, 'error');
      addLog(`❌ Erreur modification état: ${error.error || error.message}`, 'error');
    }
  };

  const handleAnnulerCommande = async (commande) => {
    try {
      const result = await commandeService.annulerCommande(commande.nocde);
      showSnackbar(`✅ Commande annulée`);
      addLog(`❌ Commande #${commande.nocde} annulée`, 'warning');
      
      // Rafraîchir la liste
      handleRechercherCommandes({});
    } catch (error) {
      const msg = getErrorMessage(error);
      showSnackbar(`❌ ${msg}`, 'error');
      addLog(`❌ Erreur annulation commande: ${msg}`, 'error');
    }
  };

  const handleEditStatusClick = (commande) => {
    setStatusDialog({ open: true, commande });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box component="span" sx={{ color: 'secondary.main' }}>📋</Box> Gestion des Commandes
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette page teste le package <strong>pkg_gestion_commandes</strong> - Workflow complet des commandes
      </Alert>
      
      <Grid container spacing={3}>
        {/* Formulaire de création */}
        <Grid item xs={12} md={4}>
          <CommandeForm 
            onSubmit={handleAjouterCommande} 
            loading={loading}
          />
        </Grid>
        
        {/* Liste des commandes */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Liste des commandes
            </Typography>
            <CommandeSearch onSearch={handleRechercherCommandes} loading={loading} />
            <CommandeList 
              commandes={commandes}
              loading={loading}
              onEditStatus={handleEditStatusClick}
              onCancel={handleAnnulerCommande}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogue de modification d'état */}
      <CommandeStatus
        open={statusDialog.open}
        commande={statusDialog.commande}
        onClose={() => setStatusDialog({ open: false, commande: null })}
        onUpdate={handleModifierEtat}
        loading={loading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default CommandesPage;