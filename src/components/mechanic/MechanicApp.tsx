import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button, List, ListItem, ListItemText, Paper, ListItemIcon } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import Header from '../Header.tsx';
import { useStores } from '../../stores/RootStore.ts';
import { apiClient } from '../../ApiClient.ts';
import { Client } from '../../types.ts';
import CreateClientModal from './CreateClientModal.tsx';

const MechanicApp: React.FC = observer(() => {
    const { userStore } = useStores();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchClients = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedClients = await apiClient.getMyClients();
            setClients(fetchedClients);
        } catch (err: any) {
            setError(err.message || "Impossibile caricare la lista clienti.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userStore.isLoggedIn) {
            fetchClients();
        }
    }, [userStore.isLoggedIn]);

    const handleClientCreated = () => {
        setIsModalOpen(false);
        fetchClients(); // Ricarica la lista dopo la creazione
    };


    return (
        <>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" gutterBottom>
                        Dashboard Officina
                    </Typography>
                     <Button 
                        variant="contained" 
                        startIcon={<PersonAdd />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Crea Nuovo Cliente
                    </Button>
                </Box>
                
                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    I Miei Clienti
                </Typography>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <Paper variant="outlined">
                        <List>
                            {clients.length === 0 && (
                                <ListItem>
                                    <ListItemText primary="Nessun cliente trovato." secondary="Aggiungine uno per iniziare a gestire i loro veicoli."/>
                                </ListItem>
                            )}
                            {clients.map((client, index) => (
                                <ListItem key={client.id} divider={index < clients.length - 1}>
                                    <ListItemText 
                                        primary={`${client.firstName} ${client.lastName}`}
                                        secondary={client.email || client.phone || `Cliente dal: ${new Date(client.createdAt).toLocaleDateString()}`}
                                    />
                                     <Button variant="outlined" size="small">
                                        Gestisci
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Container>
            
            <CreateClientModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClientCreated={handleClientCreated}
            />
        </>
    );
});

export default MechanicApp;