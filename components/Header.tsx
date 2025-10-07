import React, { useState, useRef } from 'react';
import {
    AppBar, Toolbar, Typography, Button, IconButton,
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider,
    useMediaQuery, useTheme
} from '@mui/material';
import {
    AddCircle, UploadFile, Download, CarCrash, Analytics,
    Menu as MenuIcon, Brightness4, Brightness7, ColorLens
} from '@mui/icons-material';

interface HeaderProps {
    onImportClick: () => void;
    onExport: () => void;
    onAddCarClick: () => void;
    onSimulateClick: () => void;
    themeMode: 'light' | 'dark';
    setThemeMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
    primaryColor: string;
    setPrimaryColor: React.Dispatch<React.SetStateAction<string>>;
}

const Header: React.FC<HeaderProps> = ({
    onImportClick, onExport, onAddCarClick, onSimulateClick,
    themeMode, setThemeMode, primaryColor, setPrimaryColor
}) => {
    const theme = useTheme();
    // FIX: To fix "Property 'breakpoints' does not exist on type 'Theme'",
    // we pass a callback function to `useMediaQuery`. This ensures MUI provides
    // a correctly-typed `theme` object to the function.
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
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

    const drawerContent = (
        <Box
            sx={{ width: 250, bgcolor: 'background.default', height: '100%' }}
            role="presentation"
        >
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => { onSimulateClick(); handleDrawerToggle(); }}>
                        <ListItemIcon><Analytics /></ListItemIcon>
                        <ListItemText primary="Simulazione" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => { onImportClick(); handleDrawerToggle(); }}>
                        <ListItemIcon><UploadFile /></ListItemIcon>
                        <ListItemText primary="Importa" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => { onExport(); handleDrawerToggle(); }}>
                        <ListItemIcon><Download /></ListItemIcon>
                        <ListItemText primary="Esporta" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => { onAddCarClick(); handleDrawerToggle(); }}>
                        <ListItemIcon><AddCircle /></ListItemIcon>
                        <ListItemText primary="Aggiungi Auto" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem>
                    <ListItemText primary="Tema" />
                    <IconButton sx={{ ml: 1 }} onClick={() => setThemeMode(prev => prev === 'light' ? 'dark' : 'light')} color="inherit">
                        {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </ListItem>
                <ListItem>
                    <ListItemText primary="Colore" />
                    <IconButton onClick={handleColorButtonClick} color="inherit">
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

    const desktopHeader = (
        <Toolbar>
            <CarCrash sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Gestione Manutenzione Auto
            </Typography>
            <Button color="inherit" startIcon={<Analytics />} onClick={onSimulateClick}>Simulazione</Button>
            <Button color="inherit" startIcon={<UploadFile />} onClick={onImportClick}>Importa</Button>
            <Button color="inherit" startIcon={<Download />} onClick={onExport}>Esporta</Button>
            <Button color="inherit" startIcon={<AddCircle />} onClick={onAddCarClick}>Aggiungi</Button>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            <IconButton sx={{ ml: 1 }} onClick={() => setThemeMode(prev => prev === 'light' ? 'dark' : 'light')} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton onClick={handleColorButtonClick} color="inherit" title="Cambia colore primario">
                <ColorLens />
            </IconButton>
            <input
                type="color"
                ref={colorInputRef}
                value={primaryColor}
                onChange={handleColorChange}
                style={{ display: 'none' }}
            />
        </Toolbar>
    );

    const mobileHeader = (
         <Toolbar>
            <CarCrash sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Gestione Auto
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
            <AppBar position="static">
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
};

export default Header;
