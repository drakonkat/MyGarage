import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Chip, Tooltip, IconButton, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Visibility } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import CreateQuoteModal from './CreateQuoteModal.tsx';
import { Quote, Client, Car } from '../../types.ts';

const statusStyles: { [key: string]: { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } } = {
    draft: { label: 'Bozza', color: 'default' },
    sent: { label: 'Inviato', color: 'info' },
    accepted: { label: 'Accettato', color: 'success' },
    rejected: { label: 'Rifiutato', color: 'error' },
    invoiced: { label: 'Fatturato', color: 'secondary' }
};

const QuotesView: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleQuoteCreated = () => {
        setIsModalOpen(false);
        mechanicStore.fetchQuotes();
        mechanicStore.fetchDashboardStats();
    };

    const columns: GridColDef<Quote>[] = [
        { field: 'quoteNumber', headerName: 'Numero', width: 150 },
        { 
            field: 'clientName', 
            headerName: 'Cliente', 
            flex: 1, 
            minWidth: 150,
            valueGetter: (params) => {
                const client = params?.row?.client;
                return client ? `${client.firstName} ${client.lastName}` : '-';
            }
        },
        { 
            field: 'carDescription', 
            headerName: 'Veicolo', 
            flex: 1, 
            minWidth: 150,
            valueGetter: (params) => {
                const car = params?.row?.car;
                return car ? `${car.year} ${car.make} ${car.model}` : '-';
            }
        },
        { 
            field: 'quoteDate', 
            headerName: 'Data', 
            width: 120,
            type: 'date',
            valueGetter: (params) => params.value ? new Date(params.value) : null
        },
        { 
            field: 'totalAmount', 
            headerName: 'Importo (€)', 
            type: 'number', 
            width: 130,
            valueFormatter: ({ value }) => value != null ? `€${value.toFixed(2)}` : ''
        },
        {
            field: 'status',
            headerName: 'Stato',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const statusInfo = statusStyles[params.value] || { label: params.value, color: 'default' };
                return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />;
            },
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Azioni',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            cellClassName: 'actions',
            getActions: (/*{ id }*/) => {
                return [
                    // <Tooltip title="Visualizza Dettagli">
                    //     <IconButton onClick={() => {}}>
                    //         <Visibility />
                    //     </IconButton>
                    // </Tooltip>
                    // TODO: Add edit/view/delete functionality
                ];
            },
        },
    ];

    return (
        <Paper variant="outlined">
             <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Preventivi</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}>
                    Nuovo Preventivo
                </Button>
            </Box>
            {mechanicStore.error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{mechanicStore.error}</Alert>}
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={mechanicStore.quotes}
                    columns={columns}
                    loading={mechanicStore.isLoadingQuotes}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: {
                            sortModel: [{ field: 'quoteDate', sort: 'desc' }],
                        },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <CreateQuoteModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onQuoteCreated={handleQuoteCreated}
            />
        </Paper>
    );
});

export default QuotesView;
