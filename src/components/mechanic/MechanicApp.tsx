import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button, List, ListItem, ListItemText, TextField } from '@mui/material';
import { observer } from 'mobx-react-lite';
import Header from '../Header.tsx';
import { useStores } from '../../stores/RootStore.ts';
import { apiClient } from '../../ApiClient.ts';
import CreateClientModal from './CreateClientModal.tsx';

interface Client {
    id: number;
    email: string;
    createdAt: string;
}

const MechanicApp: React.FC = observer(() => {
    const { userStore } = useStores();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clientEmail, setClientEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [showCreateClientModal, setShowCreateClientModal] = useState(false);
    const [emailForNewClient, setEmailForNewClient] = useState('');

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

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        setError(null);
        try {
            await apiClient.addClient(clientEmail);
            setClientEmail('');
            await fetchClients(); // Refresh client list
        } catch(err: any) {
            if (err.message && err.message.toLowerCase().includes("not found")) {
                setEmailForNewClient(clientEmail);
                setShowCreateClientModal(true);
            } else {
                setError(err.message || "Errore nell'aggiunta del cliente.");
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleClientCreated = () => {
        setShowCreateClientModal(false);
        setClientEmail('');
        setEmailForNewClient('');
        fetchClients();
    };


    return (
        <>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard Officina
                </Typography>
                
                <Box component="form" onSubmit={handleAddClient} sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
                     <TextField
                        label="Email cliente da aggiungere o creare"
                        variant="outlined"
                        size="small"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        required
                        type="email"
                        sx={{flexGrow: 1}}
                    />
                    <Button type="submit" variant="contained" disabled={isAdding}>
                        {isAdding ? <CircularProgress size={24} /> : 'Aggiungi'}
                    </Button>
                </Box>
                
                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

                <Typography variant="h5" gutterBottom>
                    I Miei Clienti
                </Typography>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <List>
                        {clients.length === 0 && <Typography>Nessun cliente trovato. Aggiungine uno per iniziare.</Typography>}
                        {clients.map(client => (
                            <ListItem key={client.id} divider>
                                <ListItemText 
                                    primary={client.email}
                                    secondary={`Cliente dal: ${new Date(client.createdAt).toLocaleDateString()}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Container>
            <CreateClientModal
                open={showCreateClientModal}
                onClose={() => setShowCreateClientModal(false)}
                onClientCreated={handleClientCreated}
                initialEmail={emailForNewClient}
            />
        </>
    );
});

export default MechanicApp;
