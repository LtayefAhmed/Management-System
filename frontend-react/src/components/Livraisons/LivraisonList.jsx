import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Typography,
  Box,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const LivraisonList = ({ livraisons, loading, onDelete, onEdit }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getEtatColor = (etat) => {
    switch(etat) {
      case 'EC': return 'warning';  // En cours
      case 'LI': return 'success';  // Livrée
      case 'AL': return 'error';    // Annulée livraison
      default: return 'default';
    }
  };

  const getEtatIcon = (etat) => {
    switch(etat) {
      case 'EC': return <PendingIcon fontSize="small" />;
      case 'LI': return <CheckCircleIcon fontSize="small" />;
      case 'AL': return <CancelIcon fontSize="small" />;
      default: return null;
    }
  };

  const getEtatLabel = (etat) => {
    switch(etat) {
      case 'EC': return 'En cours';
      case 'LI': return 'Livrée';
      case 'AL': return 'Annulée';
      default: return etat;
    }
  };

  const getModePaiementLabel = (mode) => {
    return mode === 'avant_livraison' ? 'Avant' : 'Après';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Chargement des livraisons...
        </Typography>
      </Box>
    );
  }

  if (!livraisons || livraisons.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
        <Typography color="textSecondary">
          Aucune livraison trouvée. Planifiez une nouvelle livraison.
        </Typography>
      </Paper>
    );
  }

  const paginatedLivraisons = livraisons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h6">
          🚚 Liste des livraisons ({livraisons.length} total)
        </Typography>
        <Typography variant="body2">
          Appel à pkg_gestion_livraisons.chercher_livraison()
        </Typography>
      </Box>
      
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>Commande</strong></TableCell>
              <TableCell><strong>Date livraison</strong></TableCell>
              <TableCell><strong>Livreur</strong></TableCell>
              <TableCell><strong>Paiement</strong></TableCell>
              <TableCell><strong>État</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLivraisons.map((livraison, index) => (
              <TableRow 
                key={index} 
                hover
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>
                  <Chip 
                    label={`#${livraison.nocde}`}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(livraison.dateliv).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`Livreur #${livraison.livreur}`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getModePaiementLabel(livraison.modepay)}
                    color={livraison.modepay === 'avant_livraison' ? 'success' : 'info'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={getEtatIcon(livraison.etatliv)}
                    label={getEtatLabel(livraison.etatliv)}
                    color={getEtatColor(livraison.etatliv)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Modifier">
                    <IconButton 
                      size="small" 
                      color="info"
                      onClick={() => onEdit && onEdit(livraison)}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        if (window.confirm(`Supprimer la livraison du ${new Date(livraison.dateliv).toLocaleDateString()}?`)) {
                          onDelete && onDelete(livraison.nocde, livraison.dateliv);
                        }
                      }}
                      disabled={loading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={livraisons.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
      />
    </Paper>
  );
};

export default LivraisonList;