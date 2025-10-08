import React, { useState, useRef } from 'react';
import {
    AppBar, Toolbar, Typography, Button, IconButton,
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider,
    useMediaQuery, useTheme, TextField, InputAdornment, Tooltip
} from '@mui/material';
import {
    AddCircle, UploadFile, Download, CarCrash, Analytics,
    Menu as MenuIcon, Brightness4, Brightness7, ColorLens, Search
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
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const Header: React.FC<HeaderProps> = ({
    onImportClick, onExport, onAddCarClick, onSimulateClick,
    themeMode, setThemeMode, primaryColor, setPrimaryColor,
    searchQuery, setSearchQuery
}) => {
    const theme = useTheme();
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
            <Typography variant="h6" component="div" noWrap>
                CarMaintenance
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

             <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Cerca auto…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: '20px',
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                            },
                        },
                    }}
                    sx={{ mr: 2 }}
                />

                <Tooltip title="Aggiungi Auto">
                    <IconButton color="inherit" onClick={onAddCarClick}>
                        <AddCircle />
                    </IconButton>
                </Tooltip>
                 <Tooltip title="Importa Dati">
                    <IconButton color="inherit" onClick={onImportClick}>
                        <UploadFile />
                    </IconButton>
                </Tooltip>
                 <Tooltip title="Esporta Dati">
                    <IconButton color="inherit" onClick={onExport}>
                        <Download />
                    </IconButton>
                </Tooltip>
                 <Tooltip title="Simulazione Costi">
                    <IconButton color="inherit" onClick={onSimulateClick}>
                        <Analytics />
                    </IconButton>
                </Tooltip>
                
                <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                
                <Tooltip title="Cambia Tema">
                    <IconButton onClick={() => setThemeMode(prev => prev === 'light' ? 'dark' : 'light')} color="inherit">
                        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Tooltip>
                 <Tooltip title="Cambia Colore Primario">
                    <IconButton onClick={handleColorButtonClick} color="inherit">
                        <ColorLens />
                    </IconButton>
                 </Tooltip>
                <input
                    type="color"
                    ref={colorInputRef}
                    value={primaryColor}
                    onChange={handleColorChange}
                    style={{ display: 'none' }}
                />
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

    const mobileHeader = (
         <Toolbar>
            <CarCrash sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
};

export default Header;