import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { SalesChart } from '../components/analytics/SalesChart';
import { PriceTrendChart } from '../components/analytics/PriceTrendChart';
import { InventoryStatusChart } from '../components/analytics/InventoryStatusChart';
import { PerformanceMetrics } from '../components/analytics/PerformanceMetrics';
import { useAnalytics } from '../hooks/useAnalytics';

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const { data, loading, error } = useAnalytics(timeRange);

  if (loading) return <Box>Loading analytics...</Box>;
  if (error) return <Box color="error.main">{error}</Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PerformanceMetrics metrics={data.metrics} />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Sales Trend</Typography>
              <SalesChart data={data.salesData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Inventory Status</Typography>
              <InventoryStatusChart data={data.inventoryData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Price Trends</Typography>
              <PriceTrendChart data={data.priceData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 