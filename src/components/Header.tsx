import React, { useState, useRef } from 'react';
import {
    AppBar, Toolbar, Typography, Button, IconButton,
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider,
    useMediaQuery, useTheme, Tooltip
} from '@mui/material';
import {
    AddCircle, UploadFile, Download, CarCrash, Analytics,
    Menu as MenuIcon, Brightness4, Brightness7, ColorLens, Login, AppRegistration, Logout, Home
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/RootStore.ts';

// Props are mostly for anonymous mode where state is local
interface HeaderProps {
    onImportClick?: () => void;
    onExport?: () => void;
    onAddCarClick?: () => void;
    onSimulateClick?: () => void;
    searchQuery?: string;
    setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
}

const Header: React.FC<HeaderProps> = observer(({
    onImportClick, onExport, onAddCarClick, onSimulateClick,
}) => {
    const { userStore, viewStore } = useStores();
    const { isLoggedIn, user } = userStore;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // TODO: Move theme state to a UIStore in MobX
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
    const [primaryColor, setPrimaryColor] = useState('#90caf9');
    const colorInputRef = useRef<HTMLInputElement>(null);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleColorButtonClick = () => {
        colorInputRef.current?.click();
    };

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrimaryColor(event.target.value);
    };
    
    const goHome = () => {
        viewStore.setView('landing');
    };

    const drawerContent = (
        <Box
            sx={{ width: 250, bgcolor: 'background.default', height: '100%' }}
            role="presentation"
            onClick={handleDrawerToggle}
            onKeyDown={handleDrawerToggle}
        >
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={goHome}>
                        <ListItemIcon><Home /></ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            {isLoggedIn ? (
                 <List>
                     <ListItem>
                        <ListItemText primary={user?.email} secondary={user?.role} />
                     </ListItem>
                     {user?.role === 'personal' && onAddCarClick && (
                        <ListItem disablePadding>
                            <ListItemButton onClick={onAddCarClick}>
                                <ListItemIcon><AddCircle /></ListItemIcon>
                                <ListItemText primary="Aggiungi Auto" />
                            </ListItemButton>
                        </ListItem>
                     )}
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => userStore.logout()}>
                            <ListItemIcon><Logout /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                </List>
            ) : (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => viewStore.setView('login')}>
                            <ListItemIcon><Login /></ListItemIcon>
                            <ListItemText primary="Accedi" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => viewStore.setView('signup')}>
                            <ListItemIcon><AppRegistration /></ListItemIcon>
                            <ListItemText primary="Registrati" />
                        </ListItemButton>
                    </ListItem>
                     <Divider />
                    {onSimulateClick && (
                        <ListItem disablePadding>
                            <ListItemButton onClick={onSimulateClick}>
                                <ListItemIcon><Analytics /></ListItemIcon>
                                <ListItemText primary="Simulazione" />
                            </ListItemButton>
                        </ListItem>
                    )}
                    {onImportClick && (
                         <ListItem disablePadding>
                            <ListItemButton onClick={onImportClick}>
                                <ListItemIcon><UploadFile /></ListItemIcon>
                                <ListItemText primary="Importa" />
                            </ListItemButton>
                        </ListItem>
                    )}
                    {onExport && (
                        <ListItem disablePadding>
                            <ListItemButton onClick={onExport}>
                                <ListItemIcon><Download /></ListItemIcon>
                                <ListItemText primary="Esporta" />
                            </ListItemButton>
                        </ListItem>
                    )}
                </List>
            )}
            <Divider />
            <List>
                <ListItem>
                    <ListItemText primary="Tema" />
                    <IconButton sx={{ ml: 1 }} onClick={(e) => { e.stopPropagation(); setThemeMode(prev => prev === 'light' ? 'dark' : 'light')}} color="inherit">
                        {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </ListItem>
                <ListItem>
                    <ListItemText primary="Colore" />
                    <IconButton onClick={(e) => {e.stopPropagation(); handleColorButtonClick()}} color="inherit">
                         <ColorLens sx={{ color: primaryColor }} />
                    </IconButton>
                    <input
                        type="color"
                        ref={colorInputRef}
                        value={primaryColor}
                        onChange={handleColorChange}
                        style={{ display: 'none' }}
                    />
                </ListItem>
            </List>
        </Box>
    );

    const AuthButtons = () => (
        !isLoggedIn ? (
            <>
                <Button color="inherit" startIcon={<Login />} onClick={() => viewStore.setView('login')}>Accedi</Button>
                <Button color="inherit" startIcon={<AppRegistration />} onClick={() => viewStore.setView('signup')}>Registrati</Button>
            </>
        ) : (
             <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>Ciao, {user?.email}</Typography>
                <Tooltip title="Logout">
                    <IconButton color="inherit" onClick={() => userStore.logout()}>
                        <Logout />
                    </IconButton>
                </Tooltip>
            </Box>
        )
    );

    const desktopHeader = (
        <Toolbar>
            <CarCrash sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" noWrap sx={{ cursor: 'pointer' }} onClick={goHome}>
                CarMaintenance
            </Typography>
            
            {viewStore.currentView === 'anonymous_dashboard' && (
                 <Button
                    color="inherit"
                    startIcon={<Home />}
                    onClick={goHome}
                    sx={{ ml: 4 }}
                >
                    Torna alla Home
                </Button>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                 {/* Anonymous App actions */}
                {!isLoggedIn && onAddCarClick && (
                    <Tooltip title="Aggiungi Auto">
                        <IconButton color="inherit" onClick={onAddCarClick}>
                            <AddCircle />
                        </IconButton>
                    </Tooltip>
                )}
                {!isLoggedIn && onImportClick && (
                    <Tooltip title="Importa Dati">
                        <IconButton color="inherit" onClick={onImportClick}>
                            <UploadFile />
                        </IconButton>
                    </Tooltip>
                )}
                {!isLoggedIn && onExport && (
                    <Tooltip title="Esporta Dati">
                        <IconButton color="inherit" onClick={onExport}>
                            <Download />
                        </IconButton>
                    </Tooltip>
                )}
                 {!isLoggedIn && onSimulateClick && (
                    <Tooltip title="Simulazione Costi">
                        <IconButton color="inherit" onClick={onSimulateClick}>
                            <Analytics />
                        </IconButton>
                    </Tooltip>
                )}
                {/* Logged in Personal App actions */}
                {isLoggedIn && user?.role === 'personal' && onAddCarClick && (
                     <Tooltip title="Aggiungi Auto">
                        <IconButton color="inherit" onClick={onAddCarClick}>
                            <AddCircle />
                        </IconButton>
                    </Tooltip>
                )}
                
                <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                
                <AuthButtons />
            </Box>
        </Toolbar>
    );

    const mobileHeader = (
         <Toolbar>
            <CarCrash sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={goHome}>
                CarMaintenance
            </Typography>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
            >
                <MenuIcon />
            </IconButton>
        </Toolbar>
    );

    return (
        <>
            <AppBar position="static" elevation={0} sx={{borderBottom: 1, borderColor: 'divider'}}>
                {isMobile ? mobileHeader : desktopHeader}
            </AppBar>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerToggle}
            >
                {drawerContent}
            </Drawer>
        </>
    );
});

export default Header;
