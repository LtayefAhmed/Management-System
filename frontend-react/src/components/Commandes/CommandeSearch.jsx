import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const CommandeSearch = ({ onSearch, loading }) => {
  const [params, setParams] = useState({ nocde: '', noclt: '', date: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = {
      nocde: params.nocde ? params.nocde : undefined,
      noclt: params.noclt ? params.noclt : undefined,
      date: params.date ? params.date : undefined,
    };
    onSearch(p);
  };

  const handleClear = () => {
    setParams({ nocde: '', noclt: '', date: '' });
    onSearch({});
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>🔎 Recherche de commandes</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="N° client"
              name="noclt"
              value={params.noclt}
              onChange={handleChange}
              size="small"
              type="number"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Date commande"
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

export default CommandeSearch;
