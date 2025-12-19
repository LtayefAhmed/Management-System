import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  LinearProgress,
  Typography,
  Box,
  Alert,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import ArticleForm from './ArticleForm';

const ArticleList = ({ articles, onDelete, loading, onEdit }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [editingArticle, setEditingArticle] = React.useState(null);
  const [openEdit, setOpenEdit] = React.useState(false);

  const getStockColor = (qtestk) => {
    if (qtestk === 0) return 'error';
    if (qtestk < 10) return 'warning';
    return 'success';
  };

  const getStockLabel = (qtestk) => {
    if (qtestk === 0) return 'Rupture';
    if (qtestk < 10) return 'Faible';
    return 'Disponible';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEdit = (article) => {
    setEditingArticle(article);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setEditingArticle(null);
    setOpenEdit(false);
  };

  const handleSubmitEdit = async (formData) => {
    if (!editingArticle) return;
    // Delegate to parent
    if (onEdit) {
      await onEdit(editingArticle.refart, formData);
    }
    handleCloseEdit();
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          Chargement des articles...
        </Typography>
      </Box>
    );
  }

  if (articles.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography>
          Aucun article trouvé. Utilisez la recherche ou ajoutez un nouvel article.
        </Typography>
      </Alert>
    );
  }

  const paginatedArticles = articles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h6">
          📋 Liste des articles ({articles.length} total)
        </Typography>
        <Typography variant="body2">
          Appel à pkg_gestion_articles.chercher_article()
        </Typography>
      </Box>
      
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>Référence</strong></TableCell>
              <TableCell><strong>Désignation</strong></TableCell>
              <TableCell><strong>Prix A/V (€)</strong></TableCell>
              <TableCell><strong>TVA</strong></TableCell>
              <TableCell><strong>Catégorie</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedArticles.map((article) => (
              <TableRow 
                key={article.refart} 
                hover
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>
                  <Chip 
                    label={article.refart} 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {article.designation}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Achat: {article.prixA} €
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Vente: {article.prixV} €
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`${article.codetva === 1 ? '7%' : '19%'}`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={article.categorie || 'Non spécifiée'}
                    size="small"
                    color="secondary"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={<InfoIcon />}
                    label={`${article.qtestk} (${getStockLabel(article.qtestk)})`}
                    color={getStockColor(article.qtestk)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    color="primary"
                    title="Voir détails"
                    sx={{ mr: 1 }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="info"
                    title="Éditer"
                    sx={{ mr: 1 }}
                    onClick={() => handleOpenEdit(article)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => {
                      if (window.confirm(`Supprimer l'article ${article.refart} ?`)) {
                        onDelete(article.refart);
                      }
                    }}
                    title="Supprimer"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={articles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} sur ${count}`
        }
      />

      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'article {editingArticle?.refart}</DialogTitle>
        <DialogContent>
          {editingArticle && (
            <ArticleForm
              onSubmit={handleSubmitEdit}
              loading={loading}
              initialValues={editingArticle}
              mode="edit"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Annuler</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ArticleList;