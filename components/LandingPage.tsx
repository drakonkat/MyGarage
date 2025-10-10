import React from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Grid,
} from '@mui/material';
import {
    ArrowForward,
    CheckCircleOutline,
    CarCrash,
    QueryStats,
    Build,
    NotificationsActive,
    CloudUpload,
    Storefront,
    People,
    Web,
    EventAvailable,
    MarkEmailRead,
    RequestQuote,
    Analytics,
} from '@mui/icons-material';

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
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
                <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={onStart}>
                    Inizia Ora Gratuitamente
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Nessuna registrazione richiesta.
                </Typography>
            </Container>

            {/* Features Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                        Funzionalità Principali
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
                        <Box sx={{ p: 2, width: { xs: '100%', sm: '50%', md: '25%' } }}>
                            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent' }}>
                                <QueryStats sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>Simulatore Costi AI</Typography>
                                <Typography color="text.secondary">Prevedi le spese future per la manutenzione e i costi annuali.</Typography>
                            </Paper>
                        </Box>
                        <Box sx={{ p: 2, width: { xs: '100%', sm: '50%', md: '25%' } }}>
                            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent' }}>
                                <Build sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>Risorse Fai-da-te</Typography>
                                <Typography color="text.secondary">Trova tutorial e link per acquistare ricambi con un solo click.</Typography>
                            </Paper>
                        </Box>
                        <Box sx={{ p: 2, width: { xs: '100%', sm: '50%', md: '25%' } }}>
                            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent' }}>
                                <NotificationsActive sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>Promemoria Intelligenti</Typography>
                                <Typography color="text.secondary">Ricevi raccomandazioni basate su marca, modello e chilometraggio.</Typography>
                            </Paper>
                        </Box>
                        <Box sx={{ p: 2, width: { xs: '100%', sm: '50%', md: '25%' } }}>
                            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent' }}>
                                <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>Import/Export Dati</Typography>
                                <Typography color="text.secondary">I tuoi dati sono tuoi. Salvali e caricali liberamente in formato JSON.</Typography>
                            </Paper>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* User Tiers Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
                    Scegli il piano adatto a te
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2, alignItems: 'stretch' }}>
                    {/* Free Tier */}
                    <Box sx={{ p: 2, width: { xs: '100%', md: '33.33%' } }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 2, borderColor: 'primary.main' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div" gutterBottom>
                                    Uso Personale
                                </Typography>
                                <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 2 }}>
                                    Gratis
                                    <Typography component="span" color="text.secondary"> / per sempre</Typography>
                                </Typography>
                                <List>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Veicoli illimitati" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Cronologia manutenzione" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Simulatore costi AI" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline color="success" /></ListItemIcon><ListItemText primary="Import/Export dati" /></ListItem>
                                </List>
                            </CardContent>
                            <CardActions sx={{ p: 2 }}>
                                <Button size="large" variant="contained" fullWidth onClick={onStart}>Inizia Subito</Button>
                            </CardActions>
                        </Card>
                    </Box>

                    {/* Professional Tier - PROMOTION */}
                    <Box sx={{ p: 2, width: { xs: '100%', md: '33.33%' } }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 2, borderColor: 'secondary.main', bgcolor: 'action.hover' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h5" component="div">
                                        Per Officine
                                    </Typography>
                                    <Chip label="Anteprima Esclusiva" color="secondary" />
                                </Box>
                                <Typography variant="h6" component="p" color="secondary.light" sx={{ my: 2 }}>
                                   Un'anteprima esclusiva per te: <br/><strong>1 anno di gestionale gratuito!</strong>
                                </Typography>
                                 <List>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><Storefront color="secondary" /></ListItemIcon><ListItemText primary="Gestionale clienti" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><Storefront color="secondary" /></ListItemIcon><ListItemText primary="Pagamenti e fatture" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><Storefront color="secondary" /></ListItemIcon><ListItemText primary="Link lavori per cliente" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><Storefront color="secondary" /></ListItemIcon><ListItemText primary="Form richieste preventivo" /></ListItem>
                                </List>
                            </CardContent>
                            <CardActions sx={{ p: 2 }}>
                                 <Button
                                    size="large"
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    href="https://docs.google.com/forms/d/e/1FAIpQLSedr0NppzuFj35NPIhbO3n-QhkQa6ii3jR4HzzoBKXHp2b32Q/viewform?usp=dialog"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Prenota il tuo anno gratuito
                                </Button>
                            </CardActions>
                        </Card>
                    </Box>

                    {/* Registered Tier */}
                    <Box sx={{ p: 2, width: { xs: '100%', md: '33.33%' } }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0.7 }}>
                             <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h5" component="div">
                                        Personale PRO
                                    </Typography>
                                    <Chip label="Prossimamente" color="info" />
                                </Box>
                                <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 2 }}>
                                    A breve
                                </Typography>
                                <List>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline /></ListItemIcon><ListItemText primary="Tutte le feature gratuite" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline /></ListItemIcon><ListItemText primary="Backup nel cloud" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline /></ListItemIcon><ListItemText primary="Reminder via email" /></ListItem>
                                    <ListItem disableGutters><ListItemIcon sx={{minWidth: 32}}><CheckCircleOutline /></ListItemIcon><ListItemText primary="Accesso multi-dispositivo" /></ListItem>
                                </List>
                            </CardContent>
                            <CardActions sx={{ p: 2 }}>
                                <Button size="large" variant="outlined" fullWidth disabled>Registrati</Button>
                            </CardActions>
                        </Card>
                    </Box>
                </Box>
            </Container>
            
            {/* Workshop Features Details Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" gutterBottom>
                        Una Soluzione Completa per la Tua Officina
                    </Typography>
                    <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
                        Semplifica la gestione, fidelizza i clienti e aumenta la tua efficienza con strumenti pensati per il meccanico moderno.
                    </Typography>

                    <Grid container spacing={4}>
                        {/* Fix: The Grid component API has been updated. Responsive props are now passed via the 'size' object. */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <List>
                                <ListItem disableGutters>
                                    <ListItemIcon><People sx={{ fontSize: 32, color: 'primary.main' }} /></ListItemIcon>
                                    <ListItemText primary="Gestionale Clienti Semplificato" secondary="Tieni traccia di veicoli, cronologia interventi e contatti dei tuoi clienti in un unico posto, accessibile e facile da usare." />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemIcon><Web sx={{ fontSize: 32, color: 'primary.main' }} /></ListItemIcon>
                                    <ListItemText primary="Portale Cliente Dedicato" secondary="Offri ai tuoi clienti un'app con il logo della tua officina, dove possono visualizzare lo storico della manutenzione e i prossimi interventi." />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemIcon><EventAvailable sx={{ fontSize: 32, color: 'primary.main' }} /></ListItemIcon>
                                    <ListItemText primary="Prenotazioni Online" secondary="Permetti ai clienti di prenotare appuntamenti direttamente dal loro portale, riducendo le telefonate e ottimizzando il tuo calendario." />
                                </ListItem>
                            </List>
                        </Grid>
                        {/* Fix: The Grid component API has been updated. Responsive props are now passed via the 'size' object. */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <List>
                                <ListItem disableGutters>
                                    <ListItemIcon><MarkEmailRead sx={{ fontSize: 32, color: 'primary.main' }} /></ListItemIcon>
                                    <ListItemText primary="Promemoria Automatici" secondary="Invia notifiche automatiche per i prossimi tagliandi o scadenze, aumentando la fidelizzazione e il ritorno dei clienti." />
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemIcon><RequestQuote sx={{ fontSize: 32, color: 'primary.main' }} /></ListItemIcon>
                                    <ListItemText primary="Preventivi e Fatture Digitali" secondary="Crea e invia preventivi chiari e fatture professionali in pochi click. I clienti possono approvare i lavori direttamente online." />
                                </ListItem>
                                 <ListItem disableGutters>
                                    <ListItemIcon><Analytics sx={{ fontSize: 32, color: 'primary.main' }} /></ListItemIcon>
                                    <ListItemText primary="Report e Statistiche" secondary="Analizza le performance della tua officina, visualizza i servizi più richiesti e monitora i ricavi con report intuitivi." />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Typography sx={{ mb: 2, fontStyle: 'italic' }}>
                            Partecipa all'anteprima e ottieni <strong>1 anno di accesso completo gratuito</strong> per rivoluzionare la tua officina.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            href="https://docs.google.com/forms/d/e/1FAIpQLSedr0NppzuFj35NPIhbO3n-QhkQa6ii3jR4HzzoBKXHp2b32Q/viewform?usp=dialog"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Prenota il tuo anno gratuito
                        </Button>
                    </Box>
                </Container>
            </Box>


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
};

export default LandingPage;