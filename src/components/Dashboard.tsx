import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Box, Paper, List, ListItem, ListItemIcon, Avatar, ListItemText, Grid, Chip } from '@mui/material';
import { EventNote, Build, DirectionsCar, ErrorOutline, EuroSymbol } from '@mui/icons-material';
import { Car } from '../types.ts';
import DashboardCharts from './DashboardCharts.tsx';

interface DashboardProps {
    cars: Car[];
    onCarSelect: (car: Car) => void;
    onDeleteCar: (carId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cars, onCarSelect, onDeleteCar }) => {
    // Calculations for KPIs
    const totalCost = cars.reduce((total, car) =>
        total + car.maintenance.reduce((carTotal, record) =>
            carTotal + (record.isRecommendation ? 0 : record.cost), 0), 0);

    const openIssues = cars.reduce((total, car) =>
        total + (car.knownIssues?.filter(i => !i.isResolved).length || 0), 0);

    const upcomingReminders = cars
        .flatMap(car => (car.reminders || []).map(reminder => ({
            ...reminder,
            carId: car.id,
            carName: `${car.year} ${car.make} ${car.model}`
        })))
        .filter(r => new Date(r.nextDueDate) >= new Date())
        .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

    const hasMaintenanceData = cars.some(car => car.maintenance.some(m => !m.isRecommendation && m.cost > 0));

    if (cars.length === 0) {
        return (
            <Paper elevation={0} variant="outlined" sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                <DirectionsCar sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    Il tuo garage è vuoto
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Aggiungi la tua prima auto usando il pulsante in alto per iniziare a monitorare la manutenzione.
                </Typography>
            </Paper>
        );
    }
    
    // KPI Card component
    const KPICard = ({ title, value, icon, color = 'primary' }: { title: string, value: string | number, icon: React.ReactNode, color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' }) => (
         <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
            <Avatar sx={{ bgcolor: `${color}.main`, color: 'white', mr: 2 }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h6" component="p" fontWeight="bold">{value}</Typography>
                <Typography variant="body2" color="text.secondary">{title}</Typography>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={3}>
                {/* KPIs */}
                <Grid item xs={12} sm={6} md={4}>
                    <KPICard title="Auto nel Garage" value={cars.length} icon={<DirectionsCar />} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <KPICard title="Costo Totale Manutenzione" value={`€${totalCost.toFixed(2)}`} icon={<EuroSymbol />} color="success"/>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                    <KPICard title="Problemi Aperti" value={openIssues} icon={<ErrorOutline />} color={openIssues > 0 ? 'error' : 'info'} />
                </Grid>
                
                {/* Main content grid */}
                <Grid item xs={12} lg={5}>
                     <Paper elevation={0} variant="outlined" sx={{ p: {xs: 2, md: 3}, height: '100%' }}>
                        <Typography variant="h5" gutterBottom>
                            Prossime Scadenze
                        </Typography>
                        {upcomingReminders.length > 0 ? (
                            <List>
                                {upcomingReminders.slice(0, 5).map(reminder => (
                                    <ListItem key={reminder.id} disablePadding>
                                        <ListItemIcon>
                                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                <EventNote />
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${reminder.description} - €${reminder.amount.toFixed(2)}`}
                                            secondary={`${reminder.carName} - Scade il: ${new Date(reminder.nextDueDate).toLocaleDateString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', pt: 2}}>
                                <EventNote sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                <Typography variant="h6">Nessuna scadenza imminente</Typography>
                                <Typography color="text.secondary" align="center" variant="body2">
                                    Seleziona un'auto per aggiungere bollo, assicurazione o altre scadenze.
                                </Typography>
                             </Box>
                         )}
                     </Paper>
                </Grid>
                
                <Grid item xs={12} lg={7}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {cars.map((car) => {
                            const latestMileage = car.maintenance.length > 0 ? Math.max(...car.maintenance.map(m => m.mileage)) : 'N/D';
                            return (
                                <Card variant="outlined" key={car.id}>
                                    <CardContent>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                            <Typography variant="h6" component="div" fontWeight="bold">
                                                {car.year} {car.make} {car.model}
                                            </Typography>
                                            {car.licensePlate && <Chip label={car.licensePlate} size="small" variant="outlined"/>}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Ultimo chilometraggio: {typeof latestMileage === 'number' ? latestMileage.toLocaleString() : latestMileage} km
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, color: 'text.secondary', gap: 2 }}>
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <Build sx={{ fontSize: 16, mr: 0.5 }} />
                                                <Typography variant="body2">
                                                    {car.maintenance.filter(r => !r.isRecommendation).length} interventi
                                                </Typography>
                                            </Box>
                                            {car.knownIssues && car.knownIssues.filter(i => !i.isResolved).length > 0 && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                                                    <ErrorOutline sx={{ fontSize: 16, mr: 0.5 }} />
                                                    <Typography variant="body2" color="inherit">
                                                        {car.knownIssues.filter(i => !i.isResolved).length} problemi aperti
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" variant="text" onClick={() => onCarSelect(car)}>
                                            Gestisci Veicolo
                                        </Button>
                                    </CardActions>
                                </Card>
                            )
                        })}
                    </Box>
                </Grid>

                 {hasMaintenanceData && (
                     <Grid item xs={12}>
                        <DashboardCharts cars={cars} />
                     </Grid>
                 )}
            </Grid>
        </Box>
    );
};

export default Dashboard;