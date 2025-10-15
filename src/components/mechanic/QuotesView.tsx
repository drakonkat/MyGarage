import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import { Quote } from '../../types.ts';
import CreateQuoteModal from './CreateQuoteModal.tsx';

const getStatusChip = (status: Quote['status']) => {
    const style = {
        color: 'white',
        bgcolor: 'grey.700'
    };
    switch (status) {
        case 'sent':
            style.bgcolor = 'info.main';
            break;
        case 'accepted':
            style.bgcolor = 'success.main';
            break;
        case 'rejected':
            style.bgcolor = 'error.main';
            break;
        case 'invoiced':
            style.bgcolor = 'secondary.main';
            break;
    }
    return <Chip label={status} sx={style} size="small" />;
};


const QuotesView: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: GridColDef[] = [
        { field: 'quoteNumber', headerName: 'Numero', width: 130 },
        { 
            field: 'client', 
            headerName: 'Cliente', 
            width: 200,
            valueGetter: (params: GridValueGetterParams) => `${params.row.client?.firstName || ''} ${params.row.client?.lastName || ''}`
        },
        { 
            field: 'car', 
            headerName: 'Veicolo', 
            width: 200,
            valueGetter: (params: GridValueGetterParams) => `${params.row.car?.year || ''} ${params.row.car?.make || ''} ${params.row.car?.model || ''}`
        },
        { 
            field: 'quoteDate', 
            headerName: 'Data', 
            width: 150,
            valueGetter: (params: GridValueGetterParams) => new Date(params.row.quoteDate).toLocaleDateString()
        },
        { field: 'totalAmount', headerName: 'Importo', width: 130, type: 'number',
            valueGetter: (params: GridValueGetterParams) => `€${params.row.totalAmount.toFixed(2)}`
        },
        {
            field: 'status',
            headerName: 'Stato',
            width: 150,
            renderCell: (params) => getStatusChip(params.value as Quote['status']),
        },
    ];

    const onQuoteCreated = () => {
        setIsModalOpen(false);
        mechanicStore.fetchQuotes();
        mechanicStore.fetchDashboardStats();
    };

    return (
        <Paper variant="outlined">
             <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Tutti i Preventivi</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}>
                    Crea Preventivo
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
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <CreateQuoteModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onQuoteCreated={onQuoteCreated}
            />
        </Paper>
    );
});

export default QuotesView;
