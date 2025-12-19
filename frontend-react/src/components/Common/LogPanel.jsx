import React from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

const LogPanel = ({ logs, onClear }) => {
  const getLogIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getLogColor = (type) => {
    switch(type) {
      case 'success': return 'success.main';
      case 'error': return 'error.main';
      case 'warning': return 'warning.main';
      default: return 'info.main';
    }
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          📝 Logs d'activité
        </Typography>
        <Tooltip title="Effacer tous les logs">
          <IconButton 
            size="small" 
            sx={{ color: 'white' }}
            onClick={onClear}
            disabled={logs.length === 0}
          >
            <ClearAllIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {logs.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Aucun log disponible. Les actions apparaîtront ici.
            </Typography>
          </Box>
        ) : (
          <List dense>
            {logs.map((log, index) => (
              <React.Fragment key={log.id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getLogIcon(log.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip 
                          label={log.timestamp} 
                          size="small" 
                          variant="outlined"
                        />
                        <Typography 
                          component="span" 
                          variant="body2" 
                          sx={{ color: getLogColor(log.type) }}
                        >
                          {log.message}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        ID: {log.id}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < logs.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
      
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
        <Chip 
          label={`${logs.length} log(s)`}
          size="small"
          variant="outlined"
          color="primary"
        />
      </Box>
    </Paper>
  );
};

export default LogPanel;