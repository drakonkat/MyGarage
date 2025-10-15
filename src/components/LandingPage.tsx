import React from 'react';
import {
    Container, Box, Typography, Button, Card, CardContent, CardActions,
    List, ListItem, ListItemIcon, ListItemText, Stack
} from '@mui/material';
import {
    CheckCircleOutline, CarCrash, Login, AppRegistration,
    CloudSync, Email, Devices
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/RootStore.ts';

const LandingPage: React.FC = observer(() => {
    const { viewStore } = useStores();

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
                <CarCrash sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                    Gestione Manutenzione Auto
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: '750px', mx: 'auto' }}>
                    Semplice, Intelligente, Potenziato dall'IA. Tieni traccia, prevedi i costi e non dimenticare mai più un intervento.
                </Typography>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} justifyContent="center">
                     <Button variant="contained" size="large" startIcon={<AppRegistration />} onClick={() => viewStore.setView('signup')}>
                        Registrati Gratuitamente
                    </Button>
                     <Button variant="outlined" size="large" startIcon={<Login />} onClick={() => viewStore.setView('login')}>
                        Accedi
                    </Button>
                </Stack>
            </Container>

            {/* User Tiers Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                    Scegli il piano adatto a te
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', mx: -2 }}>
                    {/* Free Tier */}
                    <Box sx={{ p: 2, width: { xs: '100%', md: '33.333%' } }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div" gutterBottom>
                                    Uso Personale
                                </Typography>
                                <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 2 }}>
                                    Gratis
                                    <Typography component="span" color="text.secondary"> / senza account</Typography>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                    Ideale per una prova veloce. I dati vengono salvati solo sul tuo browser attuale.
                                </Typography>
                                <List>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Veicoli illimitati" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Cronologia manutenzione" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Simulatore costi AI" /></ListItem>
                                </List>
                            </CardContent>
                            <CardActions sx={{ p: 2 }}>
                                <Button size="large" variant="outlined" fullWidth onClick={() => viewStore.setView('anonymous_dashboard')}>
                                    Prova Subito
                                </Button>
                            </CardActions>
                        </Card>
                    </Box>

                    {/* Registered Tier */}
                    <Box sx={{ p: 2, width: { xs: '100%', md: '33.333%' } }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 2, borderColor: 'primary.main', transform: { md: 'scale(1.05)' }, zIndex: 1 }}>
                             <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div">
                                    Personale PRO
                                </Typography>
                                <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 2 }}>
                                    Gratis
                                    <Typography component="span" color="text.secondary"> / con account</Typography>
                                </Typography>
                                 <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                    La soluzione completa per l'utente privato, con i dati al sicuro nel cloud.
                                </Typography>
                                <List>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="primary" /></ListItemIcon><ListItemText primary="Tutte le feature della prova" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CloudSync color="primary" /></ListItemIcon><ListItemText primary="Backup nel cloud" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><Devices color="primary" /></ListItemIcon><ListItemText primary="Accesso multi-dispositivo" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><Email color="primary" /></ListItemIcon><ListItemText primary="Reminder via email" /></ListItem>
                                </List>
                            </CardContent>
                            <CardActions sx={{ p: 2 }}>
                                <Button size="large" variant="contained" fullWidth onClick={() => viewStore.setView('signup')}>Registrati Ora</Button>
                            </CardActions>
                        </Card>
                    </Box>
                    
                     {/* Professional Tier */}
                    <Box sx={{ p: 2, width: { xs: '100%', md: '33.333%' } }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div">
                                    Per Officine
                                </Typography>
                                <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 2 }}>
                                    Gratis
                                    <Typography component="span" color="text.secondary"> / con account</Typography>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                    Strumenti professionali per gestire clienti, veicoli, preventivi e fatture.
                                </Typography>
                                <List>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Gestionale clienti e veicoli" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Creazione preventivi e fatture" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Portale dedicato per i clienti" /></ListItem>
                                </List>
                            </CardContent>
                            <CardActions sx={{ p: 2 }}>
                                 <Button size="large" variant="outlined" fullWidth onClick={() => viewStore.setView('signup')}>
                                     Registra la tua Officina
                                 </Button>
                            </CardActions>
                        </Card>
                    </Box>
                </Box>
            </Container>

            {/* Footer */}
            <Box component="footer" sx={{ bgcolor: 'background.paper', py: 4, mt: 4 }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} Gestione Manutenzione Auto. Tutti i diritti riservati.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
});

export default LandingPage;