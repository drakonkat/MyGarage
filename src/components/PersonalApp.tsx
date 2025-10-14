import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';
import { observer } from 'mobx-react-lite';
import Header from './Header.tsx';
import { useStores } from '../stores/RootStore.ts';
import { Car } from '../types.ts';
import { apiClient } from '../ApiClient.ts';
import Dashboard from './Dashboard.tsx';


const PersonalApp: React.FC = observer(() => {
    const { userStore } = useStores();
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedCars = await apiClient.getMyCars();
                setCars(fetchedCars);
            } catch (err: any) {
                setError(err.message || "Impossibile caricare i dati delle auto.");
            } finally {
                setLoading(false);
            }
        };

        if (userStore.isLoggedIn) {
            fetchCars();
        }
    }, [userStore.isLoggedIn]);


    return (
        <>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Il Mio Garage
                </Typography>
                 {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    // TODO: Implementare la selezione dell'auto e la vista dettagliata
                    <Dashboard cars={cars} onCarSelect={() => {}} onDeleteCar={() => {}} />
                )}
            </Container>
        </>
    );
});

export default PersonalApp;
