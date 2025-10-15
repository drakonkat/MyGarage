import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
    Stack,
    Divider,
    IconButton,
    Paper,
} from '@mui/material';
import { AddCircle, ArrowBack, Delete } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import AddMaintenanceModal from '../AddMaintenanceModal.tsx';
import { MaintenanceRecord } from '../../types.ts';

const MechanicCarDetailView: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const { selectedCar: car } = mechanicStore;
    const [isModalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!car) {
        // This should ideally not happen if logic in MechanicApp is correct
        return (
            <Box>
                <Button startIcon={<ArrowBack />} onClick={() => mechanicStore.unselectCar()}>
                    Indietro
                </Button>
                <Alert severity="warning" sx={{mt: 2}}>Nessun veicolo selezionato.</Alert>
            </Box>
        );
    }
    
    const handleAddMaintenance = async (record: Omit<MaintenanceRecord, 'id'>) => {
        setError(null);
        try {
            await mechanicStore.addMaintenanceRecord(car.id, record);
            setModalOpen(false);
        } catch (err: any) {
            setError(err.message);
            // Non chiudere la modale in caso di errore
        }
    };
    
    const handleDeleteMaintenance = async (recordId: string) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo intervento dalla cronologia?")) {
            return;
        }
        setError(null);
        try {
            await mechanicStore.deleteMaintenanceRecord(recordId);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const maintenanceHistory = (car.maintenance || [])
        .filter(r => r.description !== 'Veicolo aggiunto al sistema')
        .sort((a, b) => b.mileage - a.mileage);


    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => mechanicStore.unselectCar()}>
                Torna al Cliente
            </Button>
            
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h5" gutterBottom>{car.year} {car.make} {car.model}</Typography>
                        <Typography color="text.secondary">Proprietario: {mechanicStore.selectedClient?.firstName} {mechanicStore.selectedClient?.lastName}</Typography>
                    </Box>
                    {car.licensePlate && <Chip label={car.licensePlate} />}
                </Stack>
            </Paper>

            <Box sx={{ my: 3 }}>
                 <Button
                    variant="contained"
                    startIcon={<AddCircle />}
                    onClick={() => setModalOpen(true)}
                >
                    Aggiungi Intervento
                </Button>
            </Box>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{mb: 2}}>{error}</Alert>}
            
             <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Cronologia Manutenzione</Typography>
                    {maintenanceHistory.length === 0 ? (
                        <Typography color="text.secondary">Nessun intervento registrato.</Typography>
                    ) : (
                        <List disablePadding>
                            {maintenanceHistory.map((record, index) => (
                                <React.Fragment key={record.id}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMaintenance(record.id)}>
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText 
                                            primary={record.description}
                                            secondary={`Data: ${new Date(record.date).toLocaleDateString()} | Chilometraggio: ${record.mileage.toLocaleString()} km | Costo: €${record.cost.toFixed(2)}`}
                                        />
                                    </ListItem>
                                    {index < maintenanceHistory.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            <AddMaintenanceModal 
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                onAddMaintenance={handleAddMaintenance}
            />
        </Box>
    );
});

export default MechanicCarDetailView;
