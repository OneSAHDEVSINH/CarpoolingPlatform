import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Assessment,
  DirectionsCar,
  LocalGasStation,
  Savings,
  Route
} from '@mui/icons-material';
import mockApi from '../../services/api';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MetricCard = ({ title, value, icon, color }) => (
  <Card sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
    <Box sx={{ p: 2, borderRadius: 3, bgcolor: `${color}.light`, color: `${color}.dark`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>{title}</Typography>
      <Typography variant="h5" fontWeight={800} color="text.primary">{value}</Typography>
    </Box>
  </Card>
);

const Reports = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await mockApi.reports.summary();
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" color="error">Failed to load reports data.</Typography>
      </Box>
    );
  }

  // Monthly Trips Bar Chart
  const tripsData = {
    labels: data.monthly_trips.map(d => d.month),
    datasets: [
      {
        label: 'Total Trips',
        data: data.monthly_trips.map(d => d.count),
        backgroundColor: theme.palette.primary.main,
        borderRadius: 6,
      }
    ]
  };

  // Fuel Trends Line Chart
  const fuelTrendData = {
    labels: data.fuel_trends.map(d => d.month),
    datasets: [
      {
        label: 'Fuel Efficiency (km/l)',
        data: data.fuel_trends.map(d => d.efficiency),
        borderColor: theme.palette.success.main,
        backgroundColor: `${theme.palette.success.main}33`,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Cost per KM Line Chart
  const costTrendData = {
    labels: data.cost_per_km.map(d => d.month),
    datasets: [
      {
        label: 'Cost (₹) per km',
        data: data.cost_per_km.map(d => d.cost),
        borderColor: theme.palette.warning.main,
        backgroundColor: `${theme.palette.warning.main}33`,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Vehicle Costs Doughnut Chart
  const vehicleCostData = {
    labels: data.vehicle_costs.map(d => d.vehicle),
    datasets: [
      {
        label: 'Vehicle Cost',
        data: data.vehicle_costs.map(d => d.cost),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main
        ],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" fontWeight={800} color="primary" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assessment fontSize="large" /> Analytics & Reports
      </Typography>

      {/* KPI Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Trips" value={data.total_trips} icon={<DirectionsCar />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Distance" value={`${data.total_distance} km`} icon={<Route />} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Fuel Saved" value={`${data.fuel_saved} L`} icon={<LocalGasStation />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Money Saved" value={`₹${data.money_saved}`} icon={<Savings />} color="warning" />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 4, height: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Monthly Travel Activity</Typography>
            <Box sx={{ height: 320 }}>
              <Bar data={tripsData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 4, height: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Vehicle Utilization Costs</Typography>
            <Box sx={{ height: 320 }}>
              <Doughnut data={vehicleCostData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 4, height: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Fuel Efficiency Trend</Typography>
            <Box sx={{ height: 270 }}>
              <Line data={fuelTrendData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 4, height: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Cost Efficiency (per km)</Typography>
            <Box sx={{ height: 270 }}>
              <Line data={costTrendData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
