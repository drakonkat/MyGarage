import React from 'react';
import { Paper, Typography, useTheme, Stack, Box } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Car } from '../types.ts';

interface DashboardChartsProps {
    cars: Car[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ cars }) => {
    const theme = useTheme();
    const tickColor = theme.palette.text.secondary;

    // Use theme colors for better consistency
    const THEME_COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.error.main,
    ];

    const costData = cars.map(car => ({
        name: `${car.make.substring(0,10)} ${car.model.substring(0,10)}`,
        'Costo Totale': car.maintenance
            .filter(record => !record.isRecommendation)
            .reduce((total, record) => total + record.cost, 0),
    })).filter(data => data['Costo Totale'] > 0); // Only show cars with costs

    const countData = cars.map(car => ({
        name: `${car.make} ${car.model}`,
        value: car.maintenance.filter(record => !record.isRecommendation).length,
    }));
    
    const filteredCountData = countData.filter(d => d.value > 0);

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: {xs: 2, md: 3}, bgcolor: 'background.paper' }}>
            <Typography variant="h5" gutterBottom>
                Analisi dei Costi
            </Typography>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} sx={{ mt: 3 }}>
                <Box sx={{ width: '100%', flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" align="center" gutterBottom>
                        Costo Totale Manutenzione per Veicolo
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="name" stroke={tickColor} tick={{ fontSize: 12 }} angle={-35} textAnchor="end" />
                            <YAxis stroke={tickColor} tickFormatter={(value) => `€${value}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            />
                            <Bar dataKey="Costo Totale" fill={theme.palette.primary.main} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
                <Box sx={{ width: '100%', flex: 1, minWidth: 0, maxWidth: {xs: '100%', lg: '400px'} }}>
                    <Typography variant="h6" align="center" gutterBottom>
                        Numero di Interventi per Veicolo
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                             <Pie
                                data={filteredCountData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {filteredCountData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                 contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </Stack>
        </Paper>
    );
};

export default DashboardCharts;