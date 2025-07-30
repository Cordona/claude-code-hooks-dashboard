/**
 * Generation Step Component
 * 
 * Final step showing key configuration summary and generation progress
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Key as KeyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

interface GenerationStepProps {
  configuration: {
    name: string;
    permissions: string[];
    expiresAt: string | null;
  };
  isGenerating: boolean;
  error?: string | null;
}

export const GenerationStep: React.FC<GenerationStepProps> = ({
  configuration,
  isGenerating,
  error,
}) => {
  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return 'Never expires';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isGenerating) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
        {/* Loading Header */}
        <Box sx={{ mb: 4 }}>
          <CircularProgress size={64} sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Generating Your API Key
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we securely create your API key...
          </Typography>
        </Box>

        {/* Progress Steps */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generation Progress
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <List dense>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon color="success" fontSize="small" />
                      <Typography variant="body2">Validating configuration</Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Generating secure key</Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Registering with backend
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Alert severity="info">
          <Typography variant="body2">
            This process typically takes 2-3 seconds. Please don&apos;t close this dialog.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <KeyIcon sx={{ fontSize: 64, color: 'primary.main', mb: 3, mx: 'auto' }} />
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Review API Key Configuration
        </Typography>
      </Box>

      {/* Security Reminder */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Final Reminder:</strong> Your API key will be shown only once after generation. 
          Make sure you&apos;re ready to copy and store it securely.
        </Typography>
      </Alert>

      {/* Configuration Summary */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom>
            Configuration Summary
          </Typography>
          
          <List>
            <ListItem sx={{ px: 0 }}>
              <Typography variant="body1">
                <strong>Name:</strong> {configuration.name || "Unnamed Key"}
              </Typography>
            </ListItem>
            
            <Divider />
            
            <ListItem sx={{ px: 0 }}>
              <Typography variant="body1">
                <strong>Permissions:</strong>{' '}
                {configuration.permissions.map((permission, index) => {
                  const getPermissionColor = (perm: string) => {
                    if (perm.includes('write')) return 'primary.main'; // Blue
                    if (perm.includes('read')) return 'success.main'; // Green
                    if (perm.includes('admin')) return 'warning.main'; // Orange/Amber
                    return 'text.primary'; // Default
                  };

                  return (
                    <span key={permission}>
                      <Typography
                        component="span"
                        sx={{ color: getPermissionColor(permission), fontWeight: 'medium' }}
                      >
                        {permission}
                      </Typography>
                      {index < configuration.permissions.length - 1 && ', '}
                    </span>
                  );
                })}
              </Typography>
            </ListItem>
            
            <Divider />
            
            <ListItem sx={{ px: 0 }}>
              <Typography variant="body1">
                <strong>Expiration:</strong> {formatExpirationDate(configuration.expiresAt)}
              </Typography>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Generation Failed:</strong> {error}
          </Typography>
        </Alert>
      )}

    </Box>
  );
};