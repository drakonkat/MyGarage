import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Chip, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import { Invoice } from '../../types.ts';
import CreateInvoiceModal from './CreateInvoiceModal.tsx';


const getStatusChip = (status: Invoice['status']) => {
    const style = {
        color: 'white',
        bgcolor: 'grey.700'
    };
    switch (status) {
        case 'sent':
            style.bgcolor = 'info.main';
            break;
        case 'paid':
            style.bgcolor = 'success.main';
            break;
        case 'overdue':
            style.bgcolor = 'error.main';
            break;
        case 'cancelled':
            style.bgcolor = 'warning.dark';
            break;
    }
    return <Chip label={status} sx={style} size="small" />;
};


const InvoicesView: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: GridColDef[] = [
        { field: 'invoiceNumber', headerName: 'Numero', width: 130 },
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
            field: 'invoiceDate', 
            headerName: 'Data', 
            width: 150,
            valueGetter: (params: GridValueGetterParams) => new Date(params.row.invoiceDate).toLocaleDateString()
        },
        { field: 'totalAmount', headerName: 'Importo', width: 130, type: 'number',
            valueGetter: (params: GridValueGetterParams) => `€${params.row.totalAmount.toFixed(2)}`
        },
        {
            field: 'status',
            headerName: 'Stato',
            width: 150,
            renderCell: (params) => getStatusChip(params.value as Invoice['status']),
        },
    ];

    const onInvoiceCreated = () => {
        setIsModalOpen(false);
        mechanicStore.fetchInvoices();
        mechanicStore.fetchDashboardStats();
    };

    return (
        <Paper variant="outlined">
             <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Tutte le Fatture</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}>
                    Crea Fattura
                </Button>
            </Box>
             {mechanicStore.error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{mechanicStore.error}</Alert>}
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={mechanicStore.invoices}
                    columns={columns}
                    loading={mechanicStore.isLoadingInvoices}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <CreateInvoiceModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onInvoiceCreated={onInvoiceCreated}
            />
        </Paper>
    );
});

export default InvoicesView;
