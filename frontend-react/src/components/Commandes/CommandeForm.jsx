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
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const CommandeForm = ({ onSubmit, loading }) => {
  const [noclt, setNoclt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noclt || isNaN(noclt)) {
      alert('Veuillez entrer un numéro client valide');
      return;
    }
    onSubmit(parseInt(noclt));
    setNoclt('');
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🛒 Créer une nouvelle commande
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Cette action appelle <strong>pkg_gestion_commandes.ajouter_commande()</strong>
      </Alert>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Numéro client *"
              type="number"
              value={noclt}
              onChange={(e) => setNoclt(e.target.value)}
              disabled={loading}
              required
              helperText="Numéro du client (ex: 1, 2, 3...)"
              inputProps={{ min: "1" }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <AddShoppingCartIcon />}
              disabled={loading || !noclt}
              sx={{ height: '56px' }}
            >
              {loading ? 'Création...' : 'Créer commande'}
            </Button>
          </Grid>
        </Grid>
        
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note :</strong> Le numéro de commande est généré automatiquement par la séquence
          </Typography>
        </Alert>
      </Box>
    </Paper>
  );
};

export default CommandeForm;