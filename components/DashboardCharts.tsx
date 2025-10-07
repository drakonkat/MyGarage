import React from 'react';
import { Paper, Typography, useTheme, Stack, Box } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Car } from '../types.ts';

interface DashboardChartsProps {
    cars: Car[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const DashboardCharts: React.FC<DashboardChartsProps> = ({ cars }) => {
    const theme = useTheme();
    const tickColor = theme.palette.text.secondary;

    const costData = cars.map(car => ({
        name: `${car.make} ${car.model}`,
        'Costo Totale': car.maintenance
            .filter(record => !record.isRecommendation)
            .reduce((total, record) => total + record.cost, 0),
    }));

    const countData = cars.map(car => ({
        name: `${car.make} ${car.model}`,
        value: car.maintenance.filter(record => !record.isRecommendation).length,
    }));
    
    // Filter out cars with no maintenance records for the pie chart to avoid clutter
    const filteredCountData = countData.filter(d => d.value > 0);

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
            <Typography variant="h5" gutterBottom>
                Panoramica
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: 3 }}>
                <Box sx={{ width: '100%', flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" align="center" gutterBottom>
                        Costo Totale Manutenzione per Veicolo
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="name" stroke={tickColor} tick={{ fontSize: 12 }} />
                            <YAxis stroke={tickColor} tickFormatter={(value) => `€${value}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            />
                            <Legend />
                            <Bar dataKey="Costo Totale" fill={theme.palette.primary.main} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
                <Box sx={{ width: '100%', flex: 1, minWidth: 0 }}>
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
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                // FIX: Coerce `percent` to a number to prevent a TypeScript error.
                                // The `recharts` library's types can be ambiguous, and this ensures
                                // the value is treated as a number for the arithmetic operation.
                                label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                            >
                                {filteredCountData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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