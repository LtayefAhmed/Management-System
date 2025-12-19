import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { articleService, commandeService, livraisonService } from '../services';

const Dashboard = ({ addLog }) => {
  const [stats, setStats] = useState({
    articles: { count: 0, loading: true },
    commandes: { count: 0, loading: true },
    livraisons: { count: 0, loading: true },
  });

  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [articlesRes, commandesRes, livraisonsRes] = await Promise.allSettled([
        articleService.chercherArticles({}),
        commandeService.chercherCommandes({}),
        livraisonService.chercherLivraisons({}),
      ]);

      setStats({
        articles: { 
          count: articlesRes.status === 'fulfilled' ? articlesRes.value.articles?.length || 0 : 0, 
          loading: false 
        },
        commandes: { 
          count: commandesRes.status === 'fulfilled' ? commandesRes.value.commandes?.length || 0 : 0, 
          loading: false 
        },
        livraisons: { 
          count: livraisonsRes.status === 'fulfilled' ? livraisonsRes.value.livraisons?.length || 0 : 0, 
          loading: false 
        },
      });

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const StatCard = ({ title, count, loading, icon, color }) => (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            bgcolor: `${color}.light`, 
            color: `${color}.main`,
            p: 1.5, 
            borderRadius: 2,
            mr: 2
          }}>
            {icon}
          </Box>
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
        </Box>
        {loading ? (
          <LinearProgress />
        ) : (
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
            {count}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SpeedIcon color="primary" />
        Tableau de Bord - Système de Gestion
      </Typography>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Articles"
            count={stats.articles.count}
            loading={stats.articles.loading}
            icon={<InventoryIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Commandes"
            count={stats.commandes.count}
            loading={stats.commandes.loading}
            icon={<ShoppingCartIcon fontSize="large" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Livraisons"
            count={stats.livraisons.count}
            loading={stats.livraisons.loading}
            icon={<ShippingIcon fontSize="large" />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Informations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📋 Packages Oracle Testés
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="pkg_gestion_articles" 
                  secondary="Gestion complète des articles (ajout, modification, suppression)" 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="pkg_gestion_commandes" 
                  secondary="Workflow des commandes (création, changement d'état, annulation)" 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="pkg_gestion_livraisons" 
                  secondary="Gestion des livraisons avec contraintes métier" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              ⚙️ Fonctionnalités Démo
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Triggers en temps réel" 
                  secondary="Vérifications automatiques (unicité, format téléphone, prix)" 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Contraintes métier" 
                  secondary="Limites de livraisons, workflows commandes, validations" 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Gestion d'erreurs" 
                  secondary="Messages Oracle personnalisés, rollback automatique" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Instructions pour la soutenance */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          🎯 Instructions pour la Soutenance
        </Typography>
        <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
          <Typography variant="body2">
            1. Testez les triggers en essayant d'ajouter un article avec un nom déjà existant<br />
            2. Vérifiez les contraintes métier avec les limites de livraisons (15 max/jour/ville)<br />
            3. Observez les logs en temps réel pour voir les appels aux packages<br />
            4. Testez les transitions d'état des commandes (EC → PR → LI → SO)<br />
            5. Testez la suppression logique des articles liés à des commandes
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default Dashboard;