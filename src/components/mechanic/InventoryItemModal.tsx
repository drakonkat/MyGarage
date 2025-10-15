import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, Alert, Stack } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import { InventoryItem } from '../../types.ts';

interface InventoryItemModalProps {
    open: boolean;
    onClose: () => void;
    itemToEdit: InventoryItem | null;
}

const modalStyleSx = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const InventoryItemModal: React.FC<InventoryItemModalProps> = observer(({ open, onClose, itemToEdit }) => {
    const { mechanicStore } = useStores();
    const [item, setItem] = useState<Partial<InventoryItem>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setItem(itemToEdit || { name: '', quantity: 0, costPrice: 0 });
        }
    }, [open, itemToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!item.name || item.costPrice === undefined || item.quantity === undefined) {
            setError("Nome, quantità e costo sono campi obbligatori.");
            return;
        }

        setLoading(true);
        try {
            if (itemToEdit) {
                // Update
                await mechanicStore.updateInventoryItem(itemToEdit.id, item);
            } else {
                // Create
                await mechanicStore.addInventoryItem(item as Omit<InventoryItem, 'id' | 'mechanicId'>);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || `Errore durante ${itemToEdit ? 'l\'aggiornamento' : 'la creazione'} dell'articolo.`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyleSx} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">
                    {itemToEdit ? 'Modifica Articolo' : 'Nuovo Articolo in Inventario'}
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                        name="name"
                        label="Nome Articolo"
                        value={item.name || ''}
                        onChange={handleChange}
                        required
                        fullWidth
                        autoFocus
                    />
                    <TextField
                        name="description"
                        label="Descrizione (Opzionale)"
                        value={item.description || ''}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        fullWidth
                    />
                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                        <TextField
                            name="sku"
                            label="SKU/Codice (Opzionale)"
                            value={item.sku || ''}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            name="quantity"
                            label="Quantità"
                            type="number"
                            value={item.quantity ?? ''}
                            onChange={handleNumberChange}
                            required
                            fullWidth
                        />
                    </Stack>
                     <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                        <TextField
                            name="costPrice"
                            label="Costo (€)"
                            type="number"
                            inputProps={{ step: "0.01" }}
                            value={item.costPrice ?? ''}
                            onChange={handleNumberChange}
                            required
                            fullWidth
                        />
                         <TextField
                            name="sellingPrice"
                            label="Prezzo Vendita (€) (Opz.)"
                            type="number"
                            inputProps={{ step: "0.01" }}
                            value={item.sellingPrice ?? ''}
                            onChange={handleNumberChange}
                            fullWidth
                        />
                    </Stack>
                     <TextField
                        name="location"
                        label="Posizione (es. Scaffale A-3)"
                        value={item.location || ''}
                        onChange={handleChange}
                        fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}

                    <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
                        {loading ? <CircularProgress size={24} /> : (itemToEdit ? 'Salva Modifiche' : 'Aggiungi Articolo')}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
});

export default InventoryItemModal;