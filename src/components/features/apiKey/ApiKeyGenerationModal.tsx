/**
 * API Key Generation Modal Component
 * 
 * Multistep modal for generating API keys with security-first UX.
 * UI-only version with mock interactions for testing user experience.
 */

import React, { useState, useEffect, startTransition } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  Key as KeyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Step components
import {
  WelcomeStep,
  ConfigurationStep,
  GenerationStep,
  ApiKeyDisplayStep,
} from './steps';

import type { ApiKeyResponse } from '@/types/apiKey';
import { apiKeyClient } from '@/services/apiKey/client';

interface ApiKeyGenerationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (generatedKey: ApiKeyResponse) => void;
}

const steps = [
  {
    label: 'Welcome',
    icon: <InfoIcon />,
  },
  {
    label: 'Configure',
    icon: '2',
  },
  {
    label: 'Review',
    icon: '3',
  },
  {
    label: 'Generate',
    icon: '4',
  }
];

export const ApiKeyGenerationModal: React.FC<ApiKeyGenerationModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [keyConfiguration, setKeyConfiguration] = useState({
    name: '',
    permissions: ['hooks:write'] as string[],
    expiresAt: null as string | null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<ApiKeyResponse | null>(null);

  // Reset modal to clean state when opened
  useEffect(() => {
    if (open) {
      startTransition(() => {
        setActiveStep(0);
        setKeyConfiguration({
          name: '',
          permissions: ['hooks:write'],
          expiresAt: null,
        });
        setIsGenerating(false);
        setError(null);
        setGeneratedKey(null);
      });
    }
  }, [open]);

  const handleNext = () => {
    if (activeStep === steps.length - 2) { // "Generate" step (index 2)
      void handleGenerate();
    } else if (activeStep === steps.length - 1) { // "Your Key" step (index 3) 
      // Close modal and call onSuccess
      if (generatedKey) {
        onSuccess?.(generatedKey);
      }
      handleClose();
    } else {
      startTransition(() => {
        setActiveStep((prevStep) => prevStep + 1);
      });
    }
  };

  const handleBack = () => {
    startTransition(() => {
      setActiveStep((prevStep) => prevStep - 1);
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call real backend API
      const result = await apiKeyClient.generateApiKey({
        name: keyConfiguration.name,
        permissions: keyConfiguration.permissions,
        expiresAt: keyConfiguration.expiresAt
      });

      if (result.success) {
        startTransition(() => {
          setGeneratedKey(result.data);
          setActiveStep((prevStep) => prevStep + 1); // Go to the display step
        });
      } else {
        // Handle API errors with user-friendly messages
        setError(result.message);
      }
    } catch {
      setError('An unexpected error occurred while generating the API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      startTransition(() => {
        setActiveStep(0);
        setKeyConfiguration({
          name: '',
          permissions: ['hooks:write'],
          expiresAt: null,
        });
        setError(null);
        setGeneratedKey(null);
      });
      onClose();
    }
  };

  const getStepContent = (step: number) => {
    if (step === 0) {
      return <WelcomeStep />;
    }
    if (step === 1) {
      return (
        <ConfigurationStep
          configuration={keyConfiguration}
          onChange={setKeyConfiguration}
        />
      );
    }
    if (step === 2) {
      return (
        <GenerationStep
          configuration={keyConfiguration}
          isGenerating={isGenerating}
          error={error}
        />
      );
    }
    if (step === 3) {
      return generatedKey ? (
        <ApiKeyDisplayStep generatedKey={generatedKey} />
      ) : null;
    }
    return null;
  };

  const isStepValid = (step: number): boolean => {
    if (step === 1) {
      return keyConfiguration.name.trim().length > 0;
    }
    return true;
  };

  const canProceed = isStepValid(activeStep);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100vh' : 600,
        }
      }}
    >
      <DialogTitle
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyIcon color="primary" />
          <Typography variant="h6" component="h2">
            Generate API Key
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isGenerating}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'text.secondary',
            '&:hover': {
              color: 'error.main',
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Stepper */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel={!isMobile}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{
              '& .MuiStepIcon-root.Mui-completed': {
                color: 'success.main',
              },
              '& .MuiStepIcon-root.Mui-completed .MuiStepIcon-text': {
                fill: 'white',
              },
              '& .MuiStepLabel-label.Mui-completed': {
                color: 'success.main',
                fontWeight: 'medium',
              },
              '& .MuiTypography-caption': {
                '&.Mui-completed': {
                  color: 'success.main',
                },
              },
            }}
          >
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel
                  icon={step.icon}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Box sx={{ px: 3, pb: 2, minHeight: 300 }}>
          <Fade in key={activeStep} timeout={300}>
            <Box>
              {getStepContent(activeStep)}
            </Box>
          </Fade>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: 'center'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || isGenerating}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed || isGenerating}
            startIcon={activeStep === steps.length - 2 ? <KeyIcon /> : undefined}
          >
            {(() => {
              if (activeStep === steps.length - 2) return 'Generate Key';
              if (activeStep === steps.length - 1) return 'Done';
              return 'Next';
            })()}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};