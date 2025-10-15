import React, { useState } from 'react';
import { Box, Button, Typography, Paper, List, Card, CardContent, CardActions, Tooltip, Alert, Chip, Stack } from '@mui/material';
import { ArrowBack, AddCircle } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import AddCarToClientModal from './AddCarToClientModal.tsx';

const ClientDetailView: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const { selectedClient: client } = mechanicStore;
    const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
    
    if (!client) return null;

    const cars = client.cars || [];

    const handleCarAdded = () => {
        setIsAddCarModalOpen(false);
        // The store already refreshes the client data
    };

    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => mechanicStore.unselectClient()}>
                Torna alla lista clienti
            </Button>
            
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
                <Typography variant="h5" gutterBottom>{client.firstName} {client.lastName}</Typography>
                <Typography color="text.secondary">Email: {client.email || 'N/D'}</Typography>
                <Typography color="text.secondary">Telefono: {client.phone || 'N/D'}</Typography>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
                <Typography variant="h6">Veicoli del Cliente</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircle />}
                    onClick={() => setIsAddCarModalOpen(true)}
                >
                    Aggiungi Veicolo
                </Button>
            </Box>
            
            {mechanicStore.error && <Alert severity="error" sx={{mb: 2}}>{mechanicStore.error}</Alert>}

            {cars.length === 0 ? (
                 <Typography color="text.secondary">Nessun veicolo registrato per questo cliente.</Typography>
            ) : (
                <List sx={{p: 0}}>
                    {cars.map(car => (
                        <Card key={car.id} variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="h6">{car.year} {car.make} {car.model}</Typography>
                                    {car.licensePlate && <Chip label={car.licensePlate} variant="outlined" />}
                                </Stack>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => mechanicStore.selectCar(car)}>
                                    Gestisci Veicolo
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </List>
            )}

            {isAddCarModalOpen && (
                 <AddCarToClientModal
                    open={isAddCarModalOpen}
                    onClose={() => setIsAddCarModalOpen(false)}
                    onCarAdded={handleCarAdded}
                />
            )}
        </Box>
    );
});

export default ClientDetailView;