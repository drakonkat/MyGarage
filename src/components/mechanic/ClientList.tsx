import React from 'react';
import { List, ListItem, ListItemText, Paper, Typography, Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';

const ClientList: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const { clients } = mechanicStore;

    if (clients.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Nessun cliente trovato.</Typography>
                <Typography color="text.secondary">Aggiungine uno per iniziare a gestire i loro veicoli.</Typography>
            </Paper>
        );
    }

    return (
        <Paper variant="outlined">
            <List disablePadding>
                {clients.map((client, index) => (
                    <ListItem 
                        key={client.id} 
                        divider={index < clients.length - 1}
                    >
                        <ListItemText 
                            primary={`${client.firstName} ${client.lastName}`}
                            secondary={
                                <Box component="span" sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: {xs: 0, sm: 2} }}>
                                    <Typography component="span" variant="body2" color="text.secondary">
                                        {client.email || 'Nessuna email'}
                                    </Typography>
                                     <Typography component="span" variant="body2" color="text.secondary">
                                        {client.phone || 'Nessun telefono'}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
});

export default ClientList;