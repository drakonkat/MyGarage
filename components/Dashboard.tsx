import React, { useState } from 'react';
import { Card, CardContent, Typography, CardActions, Button, Box, Tabs, Tab, Paper, List, ListItem, ListItemIcon, Avatar, ListItemText } from '@mui/material';
import { EventNote } from '@mui/icons-material';
import { Car } from '../types.ts';
import DashboardCharts from './DashboardCharts.tsx';

interface DashboardProps {
    cars: Car[];
    onCarSelect: (car: Car) => void;
    onDeleteCar: (carId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}


const Dashboard: React.FC<DashboardProps> = ({ cars, onCarSelect, onDeleteCar }) => {
    const [currentTab, setCurrentTab] = useState(0);
    const hasMaintenanceData = cars.some(car => car.maintenance.some(m => !m.isRecommendation && m.cost > 0));

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };
    
    const upcomingReminders = cars
        .flatMap(car => (car.reminders || []).map(reminder => ({
            ...reminder,
            carId: car.id,
            carName: `${car.year} ${car.make} ${car.model}`
        })))
        .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="Dashboard tabs">
                    <Tab label="Le mie Auto" id="dashboard-tab-0" aria-controls="dashboard-tabpanel-0" />
                    <Tab label="Panoramica" id="dashboard-tab-1" aria-controls="dashboard-tabpanel-1" />
                </Tabs>
            </Box>

            <TabPanel value={currentTab} index={0}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                    {cars.map((car) => (
                        <Box key={car.id} sx={{ p: 1.5, width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {car.year} {car.make} {car.model}
                                    </Typography>
                                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                        {car.maintenance.filter(r => !r.isRecommendation).length} interventi registrati
                                    </Typography>
                                    {car.knownIssues && car.knownIssues.filter(i => !i.isResolved).length > 0 && (
                                        <Typography sx={{ mb: 1.5 }} color="error.light">
                                            {car.knownIssues.filter(i => !i.isResolved).length} problemi aperti
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => onCarSelect(car)}>
                                        Visualizza Dettagli
                                    </Button>
                                    <Button size="small" color="error" onClick={() => onDeleteCar(car.id)}>
                                        Elimina
                                    </Button>
                                </CardActions>
                            </Card>
                        </Box>
                    ))}
                </Box>
            </TabPanel>
            
            <TabPanel value={currentTab} index={1}>
                 {hasMaintenanceData ? (
                    <DashboardCharts cars={cars} />
                ) : (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom>
                            La Panoramica è vuota
                        </Typography>
                        <Typography color="text.secondary">
                            Aggiungi almeno un intervento di manutenzione con un costo per visualizzare i grafici.
                        </Typography>
                    </Paper>
                )}

                 {upcomingReminders.length > 0 && (
                    <Paper elevation={3} sx={{ p: {xs: 2, md: 3}, mt: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Prossime Scadenze
                        </Typography>
                        <List>
                            {upcomingReminders.slice(0, 5).map(reminder => {
                                const isOverdue = new Date(reminder.nextDueDate) < new Date();
                                return (
                                    <ListItem key={reminder.id}>
                                        <ListItemIcon>
                                            <Avatar sx={{ bgcolor: isOverdue ? 'error.main' : 'primary.main' }}>
                                                <EventNote />
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${reminder.description} - €${reminder.amount.toFixed(2)}`}
                                            secondary={`${reminder.carName} - Scadenza: ${new Date(reminder.nextDueDate).toLocaleDateString()}`}
                                        />
                                    </ListItem>
                                )
                            })}
                        </List>
                    </Paper>
                )}
            </TabPanel>
        </Box>
    );
};

export default Dashboard;