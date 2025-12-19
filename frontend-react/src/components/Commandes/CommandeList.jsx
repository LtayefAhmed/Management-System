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
  IconButton,
  TablePagination,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import LigcdeForm from './LigcdeForm';

const CommandeList = ({ commandes, loading, onEditStatus, onCancel, onArticlesAdded }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ligcdeDialog, setLigcdeDialog] = useState({ open: false, commande: null });

  const getEtatColor = (etat) => {
    switch(etat) {
      case 'EC': return 'warning';  // En cours
      case 'PR': return 'info';     // Prête
      case 'LI': return 'success';  // Livrée
      case 'SO': return 'default';  // Soldée
      case 'AN': return 'error';    // Annulée
      case 'AL': return 'secondary'; // Annulée en cours de livraison
      default: return 'default';
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (commande) => {
    onEditStatus(commande);
  };

  const handleCancelClick = (commande) => {
    if (onCancel) {
      onCancel(commande);
    }
  };

  const handleAddArticlesClick = (commande) => {
    setLigcdeDialog({ open: true, commande });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Chargement des commandes...
        </Typography>
      </Box>
    );
  }

  if (!commandes || commandes.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
        <Typography color="textSecondary">
          Aucune commande trouvée. Créez une nouvelle commande pour commencer.
        </Typography>
      </Paper>
    );
  }

  const paginatedCommandes = commandes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h6">
          📋 Liste des commandes ({commandes.length} total)
        </Typography>
        <Typography variant="body2">
          États: EC=En cours, PR=Prête, LI=Livrée, SO=Soldée, AN=Annulée, AL=À livrer
        </Typography>
      </Box>
      
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>N° Commande</strong></TableCell>
              <TableCell><strong>Client</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>État</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCommandes.map((commande) => (
              <TableRow 
                key={commande.nocde} 
                hover
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>
                  <Chip 
                    label={`#${commande.nocde}`}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Typography>
                    Client #{commande.noclt}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(commande.datecde).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getEtatLabel(commande.etatcde)}
                    color={getEtatColor(commande.etatcde)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Voir détails">
                    <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {commande.etatcde === 'EC' && (
                    <Tooltip title="Ajouter articles">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleAddArticlesClick(commande)}
                        sx={{ mr: 1 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Modifier l'état">
                    <IconButton 
                      size="small" 
                      color="warning"
                      onClick={() => handleEditClick(commande)}
                      disabled={commande.etatcde === 'AN' || commande.etatcde === 'SO'}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {commande.etatcde !== 'AN' && commande.etatcde !== 'SO' && commande.etatcde !== 'AL' && (
                    <Tooltip title="Annuler">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleCancelClick(commande)}
                        sx={{ ml: 1 }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={commandes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
      />

      {/* Dialog pour ajouter des articles */}
      <LigcdeForm
        open={ligcdeDialog.open}
        onClose={() => setLigcdeDialog({ open: false, commande: null })}
        commande={ligcdeDialog.commande}
        onSuccess={() => {
          if (onArticlesAdded) onArticlesAdded();
          setLigcdeDialog({ open: false, commande: null });
        }}
      />
    </Paper>
  );
};

export default CommandeList;