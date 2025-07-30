/**
 * Security Education Step Component
 * 
 * Critical security education and warnings before API key generation
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

export const SecurityEducationStep: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Main Security Alert */}
      <Alert severity="error" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          Critical Security Information
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Your API key will be shown only once.</strong> After generation, you cannot retrieve it again.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Chip label="✅ Copy immediately" color="success" variant="outlined" size="small" />
          <Chip label="✅ Store securely" color="success" variant="outlined" size="small" />
          <Chip label="❌ No retrieval later" color="error" variant="outlined" size="small" />
        </Box>
      </Alert>

      {/* Claude Code Integration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon color="primary" />
            Claude Code Configuration
          </Typography>
          
          <Paper sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
              {`# Add to ~/.claude/settings.json
{
  "apiKey": "your-generated-key-here",
  "hooks": {
    "baseUrl": "http://localhost:8085"
  }
}`}
            </Typography>
          </Paper>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Replace &quot;your-generated-key-here&quot; with your actual API key
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};