/**
 * API Key Display Step Component
 * 
 * Shows the generated API key with copy functionality.
 * Critical "show once only" security pattern implementation.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Key as KeyIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  CheckCircle as SuccessIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import type { ApiKeyResponse } from '@/types/apiKey';

interface ApiKeyDisplayStepProps {
  generatedKey: ApiKeyResponse;
}

export const ApiKeyDisplayStep: React.FC<ApiKeyDisplayStepProps> = ({
  generatedKey,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      // Fallback: Create a temporary text area for manual selection
      try {
        const textField = document.createElement('textarea');
        textField.value = generatedKey.apiKey;
        textField.style.position = 'fixed';
        textField.style.left = '-999999px';
        textField.style.top = '-999999px';
        textField.setAttribute('readonly', '');
        document.body.appendChild(textField);
        
        // Select the text for manual copying
        textField.focus();
        textField.select();
        textField.setSelectionRange(0, generatedKey.apiKey.length);
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(textField)) {
            textField.remove();
          }
        }, 100);
        
        // Show success state to indicate text is selected for copying
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      } catch {
        // Silent failure - user can still manually copy from the display
      }
    }
  };

  const formatDate = (dateInput: string | number | null) => {
    if (!dateInput) return 'Never expires';
    
    let date: Date;
    
    if (typeof dateInput === 'number') {
      // Backend returns Unix timestamp in seconds, convert to milliseconds
      date = new Date(dateInput * 1000);
    } else {
      // Handle string dates (ISO format)
      date = new Date(dateInput);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return `Invalid date: ${dateInput}`;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', py: 4 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <SuccessIcon sx={{ fontSize: 64, color: 'success.main', mb: 3, mx: 'auto' }} />
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          API Key Generated Successfully!
        </Typography>
      </Box>

      {/* Critical Warning */}
      <Alert severity="error" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon />
          Critical: This is your only chance to copy this key!
        </Typography>
        <Typography variant="body2">
          <strong>The complete API key will never be shown again.</strong> Make sure to copy and store it securely now.
        </Typography>
      </Alert>

      {/* API Key Display */}
      <Card sx={{ mb: 3, border: '2px solid', borderColor: 'success.main' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyIcon color="success" />
            Your API Key
          </Typography>
          
          <Box 
            sx={{ 
              position: 'relative',
              mb: 2 
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.primary',
                wordBreak: 'break-all',
                userSelect: 'text',
                cursor: 'text',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => {
                // Select all text when clicked
                const selection = window.getSelection();
                const element = document.getElementById('api-key-text');
                if (selection && element) {
                  const range = document.createRange();
                  range.selectNodeContents(element);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }}
            >
              <Typography
                id="api-key-text"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'text.primary',
                  wordBreak: 'break-all',
                  width: '100%',
                  pr: 6, // Prevent text from overlapping with copy button
                }}
              >
                {generatedKey.apiKey}
              </Typography>
            </Box>

            <IconButton
              onClick={handleCopyKey}
              sx={{
                position: 'absolute',
                top: '50%',
                right: 8,
                transform: 'translateY(-50%)',
                backgroundColor: copied ? 'success.main' : 'primary.main',
                color: 'white',
                opacity: isHovered || copied ? 1 : 0.7,
                transition: 'all 0.2s ease',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: copied ? 'success.dark' : 'primary.dark',
                  opacity: 1,
                  transform: 'translateY(-50%) scale(1.05)',
                },
              }}
            >
              {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Box>

        </CardContent>
      </Card>

      {/* Key Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Key Details
          </Typography>
          
          <List>
            <ListItem sx={{ px: 0 }}>
              <Typography variant="body1">
                <strong>Name:</strong> {generatedKey.name}
              </Typography>
            </ListItem>
            
            <Divider />
            
            <ListItem sx={{ px: 0 }}>
              <Typography variant="body1">
                <strong>Permissions:</strong>{' '}
                {generatedKey.permissions.map((permission, index) => {
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
                      {index < generatedKey.permissions.length - 1 && ', '}
                    </span>
                  );
                })}
              </Typography>
            </ListItem>
            
            <Divider />
            
            <ListItem sx={{ px: 0 }}>
              <Typography variant="body1">
                <strong>Expiration:</strong> {formatDate(generatedKey.expiresAt)}
              </Typography>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Next Steps
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText
                primary="1. Store the key securely"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. Keep the key private"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. Test the integration"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};