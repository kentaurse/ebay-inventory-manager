import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Button,
  Slider,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { useNotificationSettings } from '../hooks/useNotificationSettings';

export const NotificationSettings: React.FC = () => {
  const {
    settings,
    loading,
    error,
    updateSettings,
    saveSettings
  } = useNotificationSettings();

  if (loading) return <Box>Loading...</Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Notification Settings
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={(e) => updateSettings({
                  ...settings,
                  enabled: e.target.checked
                })}
              />
            }
            label="Enable Notifications"
          />

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>
              Low Stock Threshold
            </Typography>
            <Slider
              value={settings.lowStockThreshold}
              onChange={(_, value) => updateSettings({
                ...settings,
                lowStockThreshold: value as number
              })}
              min={1}
              max={20}
              marks
              valueLabelDisplay="auto"
              disabled={!settings.enabled}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>
              Price Change Threshold (%)
            </Typography>
            <Slider
              value={settings.priceChangeThresholdPercent}
              onChange={(_, value) => updateSettings({
                ...settings,
                priceChangeThresholdPercent: value as number
              })}
              min={1}
              max={50}
              marks
              valueLabelDisplay="auto"
              disabled={!settings.enabled}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Webhook URL"
              value={settings.webhookUrl || ''}
              onChange={(e) => updateSettings({
                ...settings,
                webhookUrl: e.target.value
              })}
              disabled={!settings.enabled}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveSettings}
              disabled={loading}
            >
              Save Settings
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}; 