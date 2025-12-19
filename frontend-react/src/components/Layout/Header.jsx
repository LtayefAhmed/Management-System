import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Header = ({ onMenuClick, apiConnected }) => {
  return (
    <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <DashboardIcon sx={{ mr: 1 }} />
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Système de Gestion - Soutenance
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={apiConnected ? "API connectée" : "API déconnectée"}>
            <Chip
              icon={apiConnected ? <CloudDoneIcon /> : <CloudOffIcon />}
              label={apiConnected ? "Connecté" : "Déconnecté"}
              color={apiConnected ? "success" : "error"}
              variant="outlined"
              size="small"
            />
          </Tooltip>
          
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Oracle Packages Test
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;