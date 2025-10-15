import React from 'react';
import { Grid, Paper, Typography, Box, Avatar, useTheme } from '@mui/material';
import { People, EuroSymbol, RequestQuote, ReportProblem } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';

// KPI Card component
const KPICard = ({ title, value, icon, color = 'primary' }: { title: string, value: string | number, icon: React.ReactNode, color?: 'primary' | 'secondary' | 'error' | 'success' }) => (
     <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Avatar sx={{ bgcolor: `${color}.main`, color: 'white', mr: 2 }}>
            {icon}
        </Avatar>
        <Box>
            <Typography variant="h5" component="p" fontWeight="bold">{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

const MechanicDashboard: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const { dashboardStats } = mechanicStore;
    const theme = useTheme();
    const tickColor = theme.palette.text.secondary;

    const chartData = dashboardStats.monthlyRevenue.map(item => ({
        name: new Date(item.month + '-02').toLocaleString('default', { month: 'short' }), // a little hack to make it parse correctly
        Fatturato: item.revenue
    }));
    
    return (
        <Grid container spacing={3}>
            {/* KPIs */}
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Clienti Attivi" value={dashboardStats.clientCount} icon={<People />} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Fatturato Totale" value={`€${dashboardStats.totalRevenue.toFixed(2)}`} icon={<EuroSymbol />} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Preventivi in Attesa" value={dashboardStats.pendingQuotes} icon={<RequestQuote />} color="secondary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Fatture Scadute" value={dashboardStats.overdueInvoices} icon={<ReportProblem />} color="error" />
            </Grid>

            {/* Chart */}
            <Grid item xs={12}>
                 <Paper variant="outlined" sx={{ p: {xs: 2, md: 3} }}>
                     <Typography variant="h6" gutterBottom>
                        Andamento Fatturato (Anno Corrente)
                    </Typography>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="name" stroke={tickColor} />
                            <YAxis stroke={tickColor} tickFormatter={(value) => `€${value}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            />
                            <Legend />
                            <Bar dataKey="Fatturato" fill={theme.palette.primary.main} />
                        </BarChart>
                    </ResponsiveContainer>
                 </Paper>
            </Grid>
        </Grid>
    );
});

export default MechanicDashboard;
