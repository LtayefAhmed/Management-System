import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Alert,
  Snackbar,
} from '@mui/material';
import { articleService } from '../services/articles';
import ArticleForm from '../components/Articles/ArticleForm';
import ArticleSearch from '../components/Articles/ArticleSearch';
import ArticleList from '../components/Articles/ArticleList';

const ArticlesPage = ({ addLog }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getErrorMessage = (error) => {
    if (!error) return 'Erreur inconnue';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error) return error.error;
    if (error.details && typeof error.details === 'string') return error.details;
    try { return JSON.stringify(error.details || error); } catch { return 'Erreur inconnue'; }
  };

  const handleAjouterArticle = async (articleData) => {
    setLoading(true);
    try {
      const result = await articleService.ajouterArticle(articleData);
      showSnackbar(`✅ Article ajouté: ${result.refart}`);
      addLog(`✅ Article ${result.refart} ajouté avec succès`, 'success');
      
      // Rafraîchir la liste
      handleRechercherArticles({});
    } catch (error) {
      const msg = getErrorMessage(error) || "Erreur lors de l'ajout";
      showSnackbar(`❌ Erreur: ${msg}`, 'error');
      addLog(`❌ Erreur ajout article: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRechercherArticles = async (params) => {
    setLoading(true);
    try {
      const result = await articleService.chercherArticles(params);
      setArticles(result.articles || []);
      addLog(`🔍 ${result.articles?.length || 0} article(s) trouvé(s)`, 'info');
    } catch (error) {
      const msg = getErrorMessage(error) || 'Erreur lors de la recherche';
      showSnackbar(`❌ Erreur: ${msg}`, 'error');
      addLog(`❌ Erreur recherche: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimerArticle = async (refart) => {
    if (!window.confirm(`Supprimer l'article ${refart} ?`)) return;
    
    try {
      const result = await articleService.supprimerArticle(refart);
      showSnackbar(`✅ ${result.message}`);
      addLog(`🗑️ Article ${refart} supprimé`, 'warning');
      
      // Rafraîchir la liste
      handleRechercherArticles({});
    } catch (error) {
      const msg = getErrorMessage(error) || 'Erreur lors de la suppression';
      showSnackbar(`❌ Erreur: ${msg}`, 'error');
      addLog(`❌ Erreur suppression: ${msg}`, 'error');
    }
  };

  const handleModifierArticle = async (refart, articleData) => {
    setLoading(true);
    try {
      const result = await articleService.modifierArticle(refart, articleData);
      showSnackbar(`✅ ${result.message}`);
      addLog(`✏️ Article ${refart} modifié`, 'info');

      // Rafraîchir la liste
      handleRechercherArticles({});
    } catch (error) {
      const msg = getErrorMessage(error) || 'Erreur lors de la modification';
      showSnackbar(`❌ Erreur: ${msg}`, 'error');
      addLog(`❌ Erreur modification article: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box component="span" sx={{ color: 'primary.main' }}>📦</Box> Gestion des Articles
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette page teste le package <strong>pkg_gestion_articles</strong> - Gestion complète des articles (ajout, recherche, suppression)
      </Alert>
      
      <Grid container spacing={3}>
        {/* Formulaire d'ajout */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                ➕ Ajouter un article
              </Typography>
              <ArticleForm 
                onSubmit={handleAjouterArticle} 
                loading={loading}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recherche et liste */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              🔍 Rechercher des articles
            </Typography>
            <ArticleSearch 
              onSearch={handleRechercherArticles}
              loading={loading}
            />
          </Paper>
          
          {/* Liste des articles */}
          <Box>
            <ArticleList 
              articles={articles}
              onDelete={handleSupprimerArticle}
              onEdit={handleModifierArticle}
              loading={loading}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default ArticlesPage;