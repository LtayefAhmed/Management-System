import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const LivraisonStatus = ({ open, livraison, onClose, onUpdate, loading }) => {
  const [nouvelleDate, setNouvelleDate] = useState('');
  const [nouveauLivreur, setNouveauLivreur] = useState('');

  useEffect(() => {
    if (livraison) {
      setNouvelleDate(livraison.dateliv ? livraison.dateliv.split('T')[0] : '');
      setNouveauLivreur(livraison.livreur?.toString() || '');
    }
  }, [livraison]);

  const handleSubmit = () => {
    if (livraison) {
      onUpdate(
        livraison.nocde,
        livraison.dateliv ? livraison.dateliv.split('T')[0] : '',
        nouvelleDate || null,
        nouveauLivreur ? parseInt(nouveauLivreur) : null
      );
    }
  };

  if (!livraison) return null;

  const etatLabel = {
    'EC': 'En cours',
    'LI': 'Livrée',
    'AL': 'Annulée'
  }[livraison.etatliv] || livraison.etatliv;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon />
          Modifier la livraison #{livraison?.nocde}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            État actuel: <strong>{etatLabel}</strong> | Date: {livraison?.dateliv ? new Date(livraison.dateliv).toLocaleDateString('fr-FR') : 'N/A'}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nouvelle date (optionnel)"
              type="date"
              value={nouvelleDate}
              onChange={(e) => setNouvelleDate(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              helperText="Laisser vide pour ne pas modifier"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nouveau livreur (optionnel)"
              type="number"
              value={nouveauLivreur}
              onChange={(e) => setNouveauLivreur(e.target.value)}
              disabled={loading}
              inputProps={{ min: "1" }}
              helperText="Laisser vide pour ne pas modifier"
            />
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note :</strong> Les modifications sont limitées par l'heure (avant 9h ou 14h)
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || (!nouvelleDate && !nouveauLivreur)}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Modification...' : 'Modifier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LivraisonStatus;
