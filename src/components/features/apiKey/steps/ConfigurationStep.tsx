/**
 * Configuration Step Component
 * 
 * Form for configuring API key name, permissions, and expiration
 */

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Alert,
  Switch,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Info as InfoIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface ApiKeyConfiguration {
  name: string;
  permissions: string[];
  expiresAt: string | null;
}

interface ConfigurationStepProps {
  configuration: ApiKeyConfiguration;
  onChange: (config: ApiKeyConfiguration) => void;
}

const availablePermissions = [
  {
    id: 'hooks:write',
    label: 'Hooks Write',
    recommended: true,
  },
  {
    id: 'hooks:read',
    label: 'Hooks Read',
    recommended: false,
  },
  {
    id: 'admin:all',
    label: 'Admin Access',
    recommended: false,
  },
];

export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  configuration,
  onChange,
}) => {
  const [hasExpiration, setHasExpiration] = React.useState(!!configuration.expiresAt);
  
  // Stable minDate to prevent calendar reset issues
  const minDate = React.useMemo(() => new Date(), []);
  
  // Stable default date for when expiration is enabled
  const defaultExpirationDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }, []);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...configuration,
      name: event.target.value,
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const newPermissions = checked
      ? [...configuration.permissions, permissionId]
      : configuration.permissions.filter(p => p !== permissionId);
    
    onChange({
      ...configuration,
      permissions: newPermissions,
    });
  };

  const handleExpirationToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setHasExpiration(enabled);
    
    onChange({
      ...configuration,
      expiresAt: enabled ? defaultExpirationDate.toISOString() : null,
    });
  };

  const handleExpirationDateChange = (date: Date | null) => {
    onChange({
      ...configuration,
      expiresAt: date?.toISOString() ?? null,
    });
  };

  // Memoize the date value to prevent unnecessary re-renders
  const expirationDateValue = React.useMemo(() => {
    return configuration.expiresAt ? new Date(configuration.expiresAt) : null;
  }, [configuration.expiresAt]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Configure Your API Key
        </Typography>
      </Box>

      {/* Key Name */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            Key Identification
          </Typography>
          <TextField
            id="api-key-name"
            name="apiKeyName"
            fullWidth
            label="API Key Name"
            placeholder="e.g., Production Claude Code Integration"
            value={configuration.name}
            onChange={handleNameChange}
            helperText="Choose a descriptive name to help you identify this key later"
            required
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Select the permissions this API key should have. Follow the principle of least privilege.
          </Typography>
          
          <FormControl component="fieldset">
            <FormGroup sx={{ gap: 0.5 }}>
              {availablePermissions.map((permission) => (
                <Box key={permission.id}>
                  <FormControlLabel
                    sx={{ mb: 0, py: 0.5 }}
                    control={
                      <Checkbox
                        id={`permission-${permission.id}`}
                        name={`permission-${permission.id}`}
                        checked={configuration.permissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        sx={{ py: 0.5 }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" component="span">
                          {permission.label}
                        </Typography>
                        {permission.recommended && (
                          <Typography 
                            variant="body2" 
                            component="span" 
                            sx={{ color: 'success.main', fontWeight: 'medium' }}
                          >
                            Recommended
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </Box>
              ))}
            </FormGroup>
          </FormControl>

          {configuration.permissions.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography>
                Please select at least one permission for your API key.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Expiration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            Expiration (Optional)
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                id="expiration-toggle"
                name="expirationToggle"
                checked={hasExpiration}
                onChange={handleExpirationToggle}
              />
            }
            label="Set expiration date"
            sx={{ mb: 2 }}
          />
          
          {hasExpiration && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiration Date"
                value={expirationDateValue}
                onChange={handleExpirationDateChange}
                minDate={minDate}
                slotProps={{
                  textField: {
                    id: "expiration-date",
                    name: "expirationDate",
                    fullWidth: true,
                    helperText: "API key will automatically become inactive on this date",
                    variant: "outlined"
                  }
                }}
                format="MMM dd, yyyy"
                closeOnSelect
                shouldDisableDate={(date) => date < minDate}
                views={['year', 'month', 'day']}
              />
            </LocalizationProvider>
          )}
          
          {!hasExpiration && (
            <Alert severity="info">
              <Typography variant="body2">
                This API key will not expire and will remain active until manually revoked.
                Consider setting an expiration date for enhanced security.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

    </Box>
  );
};