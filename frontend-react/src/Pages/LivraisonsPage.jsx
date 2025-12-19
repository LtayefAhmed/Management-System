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
import { livraisonService } from '../services/livraisons';
import LivraisonForm from '../components/Livraisons/LivraisonForm';
import LivraisonSearch from '../components/Livraisons/LivraisonSearch';
import LivraisonList from '../components/Livraisons/LivraisonList';
import LivraisonStatus from '../components/Livraisons/LivraisonStatus';

const LivraisonsPage = ({ addLog }) => {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [statusDialog, setStatusDialog] = useState({ open: false, livraison: null });

  useEffect(() => {
    handleRechercherLivraisons({});
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

  const handleAjouterLivraison = async (livraisonData) => {
    setLoading(true);
    try {
      const result = await livraisonService.ajouterLivraison(livraisonData);
      showSnackbar(`✅ ${result.message}`);
      addLog(`✅ Livraison planifiée pour commande ${livraisonData.nocde}`, 'success');
      
      // Rafraîchir la liste
      handleRechercherLivraisons({});
    } catch (error) {
      const msg = getErrorMessage(error) || "Erreur lors de la planification";
      showSnackbar(`❌ Erreur: ${msg}`, 'error');
      addLog(`❌ Erreur planification livraison: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRechercherLivraisons = async (params) => {
    setLoading(true);
    try {
      const result = await livraisonService.chercherLivraisons(params);
      setLivraisons(result.livraisons || []);
      addLog(`🔍 ${result.livraisons?.length || 0} livraison(s) trouvée(s)`, 'info');
    } catch (error) {
      const msg = getErrorMessage(error) || 'Erreur lors de la recherche';
      showSnackbar(`❌ Erreur: ${msg}`, 'error');
      addLog(`❌ Erreur recherche livraisons: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimerLivraison = async (nocde, dateliv) => {
    try {
      const result = await livraisonService.supprimerLivraison(nocde, dateliv);
      showSnackbar(`✅ ${result.message}`);
      addLog(`🗑️ Livraison supprimée`, 'warning');
      handleRechercherLivraisons({});
    } catch (error) {
      const msg = getErrorMessage(error) || 'Erreur lors de la suppression';
      showSnackbar(`❌ Erreur: ${msg}`, 'error');
      addLog(`❌ Erreur suppression livraison: ${msg}`, 'error');
    }
  };

  const handleModifierLivraison = async (nocde, dateliv, nouvelleDate, nouveauLivreur) => {
    try {
      const result = await livraisonService.modifierLivraison(nocde, dateliv, nouvelleDate, nouveauLivreur);
      showSnackbar(`✅ ${result.message}`);
      addLog(`✏️ Livraison modifiée`, 'info');
      setStatusDialog({ open: false, livraison: null });
      handleRechercherLivraisons({});
    } catch (error) {
      const msg = getErrorMessage(error) || 'Erreur lors de la modification';
      showSnackbar(`❌ Erreur: ${msg}`, 'error');
      addLog(`❌ Erreur modification livraison: ${msg}`, 'error');
    }
  };

  const handleEditStatusClick = (livraison) => {
    setStatusDialog({ open: true, livraison });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box component="span" sx={{ color: 'success.main' }}>🚚</Box> Gestion des Livraisons
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Cette page teste le package <strong>pkg_gestion_livraisons</strong> - Gestion complète des livraisons
      </Alert>
      
      <Grid container spacing={3}>
        {/* Formulaire de planification */}
        <Grid item xs={12} md={4}>
          <LivraisonForm 
            onSubmit={handleAjouterLivraison} 
            loading={loading}
          />
        </Grid>

        {/* Liste et recherche */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📅 Livraisons planifiées
            </Typography>
            <LivraisonSearch onSearch={handleRechercherLivraisons} loading={loading} />
            <LivraisonList 
              livraisons={livraisons}
              loading={loading}
              onDelete={handleSupprimerLivraison}
              onEdit={handleEditStatusClick}
            />
          </Paper>

          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Contraintes métier :</strong><br />
              1. Maximum 15 livraisons par jour et par ville pour un livreur<br />
              2. Les modifications sont limitées par l'heure (matin avant 9h, après-midi avant 14h)<br />
              3. La commande doit être en état "PR" (Prête) pour être livrée
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Dialogue de modification */}
      <LivraisonStatus
        open={statusDialog.open}
        livraison={statusDialog.livraison}
        onClose={() => setStatusDialog({ open: false, livraison: null })}
        onUpdate={handleModifierLivraison}
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

export default LivraisonsPage;