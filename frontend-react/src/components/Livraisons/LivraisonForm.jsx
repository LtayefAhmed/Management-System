import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  CircularProgress,
  Paper,
  Typography,
  Alert,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const LivraisonForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    nocde: '',
    livreur: '',
    dateliv: new Date().toISOString().split('T')[0],
    modepay: 'avant_livraison',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nocde || !formData.livreur || !formData.dateliv) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    onSubmit(formData);
    // Réinitialiser le formulaire
    setFormData({
      nocde: '',
      livreur: '',
      dateliv: new Date().toISOString().split('T')[0],
      modepay: 'avant_livraison',
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🚚 Planifier une livraison
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Cette action appelle <strong>pkg_gestion_livraisons.ajouter_livraison()</strong>
      </Alert>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="N° Commande *"
              name="nocde"
              type="number"
              value={formData.nocde}
              onChange={handleChange}
              disabled={loading}
              required
              helperText="Numéro de la commande à livrer"
              inputProps={{ min: "1" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ID Livreur *"
              name="livreur"
              type="number"
              value={formData.livreur}
              onChange={handleChange}
              disabled={loading}
              required
              helperText="Identifiant du livreur"
              inputProps={{ min: "1" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date de livraison *"
              name="dateliv"
              type="date"
              value={formData.dateliv}
              onChange={handleChange}
              disabled={loading}
              required
              InputLabelProps={{ shrink: true }}
              helperText="Date prévue pour la livraison"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Mode de paiement</InputLabel>
              <Select
                name="modepay"
                value={formData.modepay}
                onChange={handleChange}
                label="Mode de paiement"
              >
                <MenuItem value="avant_livraison">Avant livraison</MenuItem>
                <MenuItem value="apres_livraison">Après livraison</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Contrainte :</strong> Maximum 15 livraisons par jour et par ville pour un livreur
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <LocalShippingIcon />}
              disabled={loading || !formData.nocde || !formData.livreur || !formData.dateliv}
            >
              {loading ? 'Planification...' : 'Planifier la livraison'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default LivraisonForm;