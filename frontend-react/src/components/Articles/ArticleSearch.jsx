import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const ArticleSearch = ({ onSearch, loading }) => {
  const [searchParams, setSearchParams] = useState({
    refart: '',
    designation: '',
    categorie: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleClear = () => {
    setSearchParams({
      refart: '',
      designation: '',
      categorie: '',
    });
    onSearch({}); // Recherche vide = tous les articles
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Recherche d'articles
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Référence"
              name="refart"
              value={searchParams.refart}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ex: A001"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Désignation"
              name="designation"
              value={searchParams.designation}
              onChange={handleChange}
              disabled={loading}
              placeholder="Nom de l'article"
              size="small"
              InputProps={{
                endAdornment: searchParams.designation && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchParams(prev => ({ ...prev, designation: '' }))}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Catégorie"
              name="categorie"
              value={searchParams.categorie}
              onChange={handleChange}
              disabled={loading}
              placeholder="Électronique, Bureau..."
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={loading}
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleClear}
                disabled={loading}
              >
                Effacer
              </Button>
              
              <Button
                variant="text"
                onClick={() => onSearch({})}
                disabled={loading}
              >
                Voir tous
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ArticleSearch;