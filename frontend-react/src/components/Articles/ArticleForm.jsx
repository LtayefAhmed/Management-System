import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Box,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ArticleForm = ({ onSubmit, loading, initialValues = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    designation: '',
    prixA: '',
    prixV: '',
    codetva: '',
    categorie: '',
    qtestk: '',
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        designation: initialValues.designation || '',
        prixA: initialValues.prixA !== undefined && initialValues.prixA !== null ? initialValues.prixA : '',
        prixV: initialValues.prixV !== undefined && initialValues.prixV !== null ? initialValues.prixV : '',
        codetva: initialValues.codetva !== undefined && initialValues.codetva !== null ? initialValues.codetva : '',
        categorie: initialValues.categorie || '',
        qtestk: initialValues.qtestk !== undefined && initialValues.qtestk !== null ? initialValues.qtestk : '',
      });
    }
  }, [initialValues]);

  const categories = [
    'Électronique',
    'Informatique',
    'Bureau',
    'Fournitures',
    'Mobilier',
    'Divers',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation simple : si les deux prix fournis, vérifier relation
    if (formData.prixA !== '' && formData.prixV !== '') {
      if (parseFloat(formData.prixV) <= parseFloat(formData.prixA)) {
        alert('Le prix de vente doit être supérieur au prix d\'achat');
        return;
      }
    }

    onSubmit(formData);

    // Réinitialiser le formulaire uniquement en mode ajout
    if (mode === 'add') {
      setFormData({
        designation: '',
        prixA: '',
        prixV: '',
        codetva: '',
        categorie: '',
        qtestk: '',
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Désignation *"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
            disabled={loading}
            helperText="Nom de l'article"
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Prix d'achat *"
            name="prixA"
            type="number"
            value={formData.prixA}
            onChange={handleChange}
            required
            disabled={loading}
            inputProps={{ step: "0.01", min: "0" }}
            helperText="€"
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Prix de vente *"
            name="prixV"
            type="number"
            value={formData.prixV}
            onChange={handleChange}
            required
            disabled={loading}
            inputProps={{ step: "0.01", min: "0" }}
            helperText="€"
          />
        </Grid>
        
        <Grid item xs={6}>
          <FormControl fullWidth required disabled={loading}>
            <InputLabel>Code TVA *</InputLabel>
            <Select
              name="codetva"
              value={formData.codetva}
              onChange={handleChange}
              label="Code TVA *"
            >
              <MenuItem value={1}>TVA 7% (Code 1)</MenuItem>
              <MenuItem value={2}>TVA 19% (Code 2)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Quantité stock"
            name="qtestk"
            type="number"
            value={formData.qtestk}
            onChange={handleChange}
            disabled={loading}
            inputProps={{ min: "0" }}
            helperText="Unités"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              label="Catégorie"
            >
              <MenuItem value="">
                <em>Non spécifiée</em>
              </MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {mode === 'add' ? (
              <>Cette action appelle <strong>pkg_gestion_articles.ajouter_article()</strong></>
            ) : (
              <>Cette action appelle <strong>pkg_gestion_articles.modifier_article()</strong></>
            )}
          </Alert>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            disabled={loading || !formData.designation || (mode === 'add' && (!formData.prixA || !formData.prixV)) || !formData.codetva}
            sx={{ mt: 1 }}
          >
            {loading ? (mode === 'add' ? 'Ajout en cours...' : 'Enregistrement...') : (mode === 'add' ? 'Ajouter l\'article' : 'Enregistrer les modifications')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ArticleForm;