import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import { CarCrash, ArrowBack } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';

const AuthHeader: React.FC = observer(() => {
    const { viewStore } = useStores();

    const goHome = () => {
        viewStore.setView('landing');
    };

    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
                <CarCrash sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={goHome}>
                    CarMaintenance
                </Typography>
                <Button
                    color="inherit"
                    startIcon={<ArrowBack />}
                    onClick={goHome}
                >
                    Torna alla Home
                </Button>
            </Toolbar>
        </AppBar>
    );
});

export default AuthHeader;
