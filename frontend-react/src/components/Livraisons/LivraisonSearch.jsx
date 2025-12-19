import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const LivraisonSearch = ({ onSearch, loading }) => {
  const [params, setParams] = useState({ nocde: '', livreur: '', code_postal: '', date: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = {
      nocde: params.nocde ? params.nocde : undefined,
      livreur: params.livreur ? params.livreur : undefined,
      code_postal: params.code_postal ? params.code_postal : undefined,
      date: params.date ? params.date : undefined,
    };
    onSearch(p);
  };

  const handleClear = () => {
    setParams({ nocde: '', livreur: '', code_postal: '', date: '' });
    onSearch({});
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>🔎 Recherche de livraisons</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="N° commande"
              name="nocde"
              value={params.nocde}
              onChange={handleChange}
              size="small"
              type="number"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="ID Livreur"
              name="livreur"
              value={params.livreur}
              onChange={handleChange}
              size="small"
              type="number"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Code postal"
              name="code_postal"
              value={params.code_postal}
              onChange={handleChange}
              size="small"
              type="number"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              value={params.date}
              onChange={handleChange}
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={loading}>Rechercher</Button>
              <Button variant="outlined" onClick={handleClear} disabled={loading}>Effacer</Button>
              <Button variant="text" onClick={() => onSearch({})} disabled={loading}>Voir tous</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default LivraisonSearch;
