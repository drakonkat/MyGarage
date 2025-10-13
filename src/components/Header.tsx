import React, { useState, useRef } from 'react';
import {
    AppBar, Toolbar, Typography, Button, IconButton,
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider,
    useMediaQuery, useTheme, TextField, InputAdornment, Tooltip
} from '@mui/material';
import {
    AddCircle, UploadFile, Download, CarCrash, Analytics,
    Menu as MenuIcon, Brightness4, Brightness7, ColorLens, Search, Login, AppRegistration, Logout
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/RootStore.ts';


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
    searchQuery, setSearchQuery
}) => {
    const { userStore, viewStore } = useStores();
    const { isLoggedIn, user } = userStore;

    const theme = useTheme();
    // Fix: Cast theme to `any` to bypass a TypeScript error likely caused by an incorrect Theme type definition.
    const isMobile = useMediaQuery((theme as any).breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // FIXME: Theme state is not yet in MobX
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
    
    const AuthButtons = () => (
        !isLoggedIn ? (
            <>
                <Button color="inherit" startIcon={<Login />} onClick={() => viewStore.setView('login')}>Accedi</Button>
                <Button color="inherit" startIcon={<AppRegistration />} onClick={() => viewStore.setView('signup')}>Registrati</Button>
            </>
        ) : (
             <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 2 }}>Ciao, {user?.email}</Typography>
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
            <CarCrash sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" noWrap sx={{ cursor: 'pointer' }} onClick={() => viewStore.setView('landing')}>
                CarMaintenance
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

             <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                {isLoggedIn && user?.role === 'personal' && onAddCarClick && (
                     <Tooltip title="Aggiungi Auto">
                        <IconButton color="inherit" onClick={onAddCarClick}>
                            <AddCircle />
                        </IconButton>
                    </Tooltip>
                )}
                 {/* Altri bottoni specifici per la vista */}
                
                <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                
                <AuthButtons />
            </Box>

             <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    onClick={handleDrawerToggle}
                >
                    <MenuIcon />
                </IconButton>
            </Box>
        </Toolbar>
    );

    return (
        <>
            <AppBar position="static" elevation={0} sx={{borderBottom: 1, borderColor: 'divider'}}>
                {desktopHeader}
            </AppBar>
            {/* Drawer per mobile non implementato completamente con la nuova logica */}
        </>
    );
});

export default Header;