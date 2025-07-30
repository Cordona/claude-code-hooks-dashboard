/**
 * Welcome Step Component
 * 
 * Introduces users to API key generation with educational content
 */

import React from 'react';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  Key as KeyIcon,
} from '@mui/icons-material';

export const WelcomeStep: React.FC = () => {
  return (
    <Box 
      sx={{ 
        maxWidth: 600, 
        mx: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 300,
        py: 4
      }}
    >
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <KeyIcon sx={{ fontSize: 64, color: 'primary.main', mb: 3, mx: 'auto' }} />
        <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
          Welcome to API Key Generation
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Create a secure API key for Claude Code integration.
        </Typography>
      </Box>

      {/* Important Notice - Fixed at bottom */}
      <Alert severity="info" sx={{ mt: 'auto' }}>
        <Typography variant="body2">
          <strong>Important:</strong> API keys will be shown only once for security reasons. 
          Make sure to copy and store your key securely before closing this dialog.
        </Typography>
      </Alert>
    </Box>
  );
};