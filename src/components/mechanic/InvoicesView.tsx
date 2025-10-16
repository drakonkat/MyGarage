import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Chip, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import CreateInvoiceModal from './CreateInvoiceModal.tsx';
import { Invoice, Client, Car } from '../../types.ts';

const statusStyles: { [key: string]: { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } } = {
    draft: { label: 'Bozza', color: 'default' },
    sent: { label: 'Inviata', color: 'info' },
    paid: { label: 'Pagata', color: 'success' },
    overdue: { label: 'Scaduta', color: 'warning' },
    cancelled: { label: 'Annullata', color: 'error' }
};


const InvoicesView: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleInvoiceCreated = () => {
        setIsModalOpen(false);
        mechanicStore.fetchInvoices();
        mechanicStore.fetchQuotes(); // Quotes might have been updated to 'invoiced'
        mechanicStore.fetchDashboardStats();
    };

    const columns: GridColDef<Invoice>[] = [
        { field: 'invoiceNumber', headerName: 'Numero', width: 150 },
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
            field: 'invoiceDate', 
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
        // TODO: Add actions column
    ];
    
    return (
        <Paper variant="outlined">
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Fatture</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}>
                    Nuova Fattura
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
                        sorting: {
                            sortModel: [{ field: 'invoiceDate', sort: 'desc' }],
                        },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>

            <CreateInvoiceModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onInvoiceCreated={handleInvoiceCreated}
            />
        </Paper>
    );
});

export default InvoicesView;
