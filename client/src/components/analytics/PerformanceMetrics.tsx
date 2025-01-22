import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  TrendingUp,
  Inventory,
  AttachMoney,
  ShowChart
} from '@mui/icons-material';

interface MetricsProps {
  metrics: {
    totalSales: number;
    totalRevenue: number;
    averagePrice: number;
    inventoryTurnover: number;
    profitMargin: number;
  };
}

export const PerformanceMetrics: React.FC<MetricsProps> = ({ metrics }) => {
  const MetricCard = ({ title, value, icon, color }: any) => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ 
          backgroundColor: `${color}.light`,
          p: 1,
          borderRadius: 1,
          mr: 2
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h6">
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Total Sales"
          value={metrics.totalSales}
          icon={<TrendingUp />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          icon={<AttachMoney />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Avg Price"
          value={`$${metrics.averagePrice.toFixed(2)}`}
          icon={<ShowChart />}
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Inventory Turnover"
          value={metrics.inventoryTurnover.toFixed(2)}
          icon={<Inventory />}
          color="warning"
        />
      </Grid>
    </Grid>
  );
}; 