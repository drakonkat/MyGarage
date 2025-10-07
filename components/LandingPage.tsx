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
} from '@mui/material';
import {
    ArrowForward,
    CheckCircleOutline,
    CarCrash,
    QueryStats,
    Build,
    NotificationsActive,
    CloudUpload,
    Storefront
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