import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Alert, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import { InventoryItem } from '../../types.ts';
import InventoryItemModal from './InventoryItemModal.tsx';

const InventoryView: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

    const handleAddItem = () => {
        setItemToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (id: number) => {
        if (window.confirm("Sei sicuro di voler eliminare questo articolo dall'inventario?")) {
            try {
                await mechanicStore.deleteInventoryItem(id);
            } catch (error: any) {
                // L'errore viene già gestito nello store, ma potremmo mostrare una notifica qui se necessario
                console.error(error.message);
            }
        }
    };
    
    const handleModalClose = () => {
        setIsModalOpen(false);
        setItemToEdit(null);
    }

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Nome Articolo', flex: 1.5, minWidth: 200 },
        { field: 'sku', headerName: 'SKU/Codice', flex: 1, minWidth: 120 },
        { field: 'quantity', headerName: 'Quantità', type: 'number', width: 100 },
        { 
            field: 'costPrice', 
            headerName: 'Costo (€)', 
            type: 'number', 
            width: 120,
            valueFormatter: ({ value }) => `€${value.toFixed(2)}`
        },
        { 
            field: 'sellingPrice', 
            headerName: 'Prezzo Vend. (€)', 
            type: 'number', 
            width: 150,
            valueFormatter: ({ value }) => value ? `€${value.toFixed(2)}` : '-'
        },
        { field: 'location', headerName: 'Posizione', flex: 1, minWidth: 120 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Azioni',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ row }) => [
                <Tooltip title="Modifica">
                    <IconButton
                        onClick={() => handleEditItem(row)}
                        aria-label="Modifica"
                    >
                        <Edit />
                    </IconButton>
                </Tooltip>,
                <Tooltip title="Elimina">
                     <IconButton
                        onClick={() => handleDeleteItem(row.id)}
                        aria-label="Elimina"
                        color="inherit"
                    >
                        <Delete />
                    </IconButton>
                </Tooltip>
            ],
        },
    ];

    return (
        <Paper variant="outlined">
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Inventario Magazzino</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddItem}>
                    Aggiungi Articolo
                </Button>
            </Box>
            {mechanicStore.error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{mechanicStore.error}</Alert>}
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={mechanicStore.inventory}
                    columns={columns}
                    loading={mechanicStore.isLoadingInventory}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Box>
            
            <InventoryItemModal
                open={isModalOpen}
                onClose={handleModalClose}
                itemToEdit={itemToEdit}
            />
        </Paper>
    );
});

export default InventoryView;