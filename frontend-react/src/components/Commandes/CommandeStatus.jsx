import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const CommandeStatus = ({ open, commande, onClose, onUpdate, loading }) => {
  const [newEtat, setNewEtat] = useState(commande?.etatcde || '');

  const getNextEtats = (currentEtat) => {
    switch(currentEtat) {
      case 'EC': return ['PR', 'AN'];  // En cours → Prête ou Annulée
      case 'PR': return ['LI', 'AN', 'AL'];  // Prête → Livrée ou Annulée ou Annulée en cours de livraison
      case 'LI': return ['SO'];        // Livrée → Soldée
      default: return [];
    }
  };

  const getEtatLabel = (etat) => {
    switch(etat) {
      case 'EC': return 'En cours';
      case 'PR': return 'Prête';
      case 'LI': return 'Livrée';
      case 'SO': return 'Soldée';
      case 'AN': return 'Annulée';
      case 'AL': return 'Annulée (en cours de livraison)';
      default: return etat;
    }
  };

  const handleSubmit = () => {
    if (newEtat && newEtat !== commande.etatcde) {
      onUpdate(commande.nocde, newEtat);
    }
  };

  if (!commande) return null;

  const allowedTransitions = getNextEtats(commande.etatcde);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon />
          Modifier l'état de la commande #{commande.nocde}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Client: #{commande.noclt} | Date: {new Date(commande.datecde).toLocaleDateString()}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            État actuel:
          </Typography>
          <Chip 
            label={getEtatLabel(commande.etatcde)}
            color="primary"
            size="medium"
          />
        </Box>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Nouvel état</InputLabel>
          <Select
            value={newEtat}
            onChange={(e) => setNewEtat(e.target.value)}
            label="Nouvel état"
            disabled={loading || allowedTransitions.length === 0}
          >
            {allowedTransitions.map((etat) => (
              <MenuItem key={etat} value={etat}>
                {getEtatLabel(etat)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {allowedTransitions.length === 0 && (
          <Alert severity="warning">
            Cette commande ne peut plus être modifiée (état final).
          </Alert>
        )}
        
        {allowedTransitions.length > 0 && (
          <Alert severity="info">
            Transitions autorisées: {allowedTransitions.map(etat => getEtatLabel(etat)).join(', ')}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !newEtat || newEtat === commande.etatcde || allowedTransitions.length === 0}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommandeStatus;