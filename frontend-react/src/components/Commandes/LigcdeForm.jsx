import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { articleService } from '../../services/articles';
import { ligcdeService } from '../../services/ligcdes';

const LigcdeForm = ({ open, onClose, commande, onSuccess }) => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [qtecde, setQtecde] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [articlesLoading, setArticlesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadArticles();
      setError('');
    }
  }, [open]);

  const loadArticles = async () => {
    setArticlesLoading(true);
    try {
      const result = await articleService.chercherArticles({});
      setArticles(result.articles || []);
    } catch (err) {
      console.error('Erreur chargement articles:', err);
      setError('Erreur lors du chargement des articles');
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleAjouter = async () => {
    if (!selectedArticle || !qtecde || qtecde <= 0) {
      setError('Veuillez sélectionner un article et une quantité valide');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await ligcdeService.ajouterLigcde(
        commande.nocde,
        selectedArticle.refart.trim(),
        parseFloat(qtecde)
      );

      // Reset form
      setSelectedArticle(null);
      setQtecde('1');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      const msg = err.error || err.message || 'Erreur lors de l\'ajout';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un article à la commande #{commande?.nocde}</DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {articlesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Autocomplete
              options={articles}
              getOptionLabel={(option) => `${option.refart} - ${option.designation}`}
              value={selectedArticle}
              onChange={(e, newValue) => setSelectedArticle(newValue)}
              loading={articlesLoading}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sélectionner un article"
                  required
                  sx={{ mb: 2 }}
                />
              )}
              noOptionsText="Aucun article trouvé"
            />

            <TextField
              label="Quantité"
              type="number"
              value={qtecde}
              onChange={(e) => setQtecde(e.target.value)}
              disabled={loading}
              fullWidth
              inputProps={{ min: '1', step: '1' }}
              sx={{ mb: 2 }}
            />

            {selectedArticle && (
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Prix unitaire:</strong> {selectedArticle.prixV} DT
                </Typography>
                <Typography variant="body2">
                  <strong>Stock:</strong> {selectedArticle.stock}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 'bold' }}>
                  Sous-total: {(selectedArticle.prixV * (qtecde || 0)).toFixed(2)} DT
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button 
          onClick={handleAjouter} 
          variant="contained" 
          color="primary"
          disabled={loading || !selectedArticle || !qtecde || qtecde <= 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LigcdeForm;
