import React, { useState, useEffect, useMemo } from 'react';
import {
    Modal, Box, Typography, TextField, Button, CircularProgress, Alert, Stack, Autocomplete, IconButton, Tooltip
} from '@mui/material';
import { useStores } from '../../stores/RootStore.ts';
import { observer } from 'mobx-react-lite';
import { Client, Car, DocumentItem } from '../../types.ts';
import { apiClient } from '../../ApiClient.ts';
import { Delete } from '@mui/icons-material';

const modalStyleSx = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: 600 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

interface CreateQuoteModalProps {
    open: boolean;
    onClose: () => void;
    onQuoteCreated: () => void;
}

const CreateQuoteModal: React.FC<CreateQuoteModalProps> = observer(({ open, onClose, onQuoteCreated }) => {
    const { mechanicStore } = useStores();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<DocumentItem[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableCars = useMemo(() => {
        return selectedClient?.cars || [];
    }, [selectedClient]);

    const resetForm = () => {
        setSelectedClient(null);
        setSelectedCar(null);
        setQuoteDate(new Date().toISOString().split('T')[0]);
        setItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
        setError(null);
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleItemChange = (index: number, field: keyof DocumentItem, value: string | number) => {
        const newItems = [...items];
        const item = { ...newItems[index] };
        (item[field] as any) = value;
        
        if (field === 'quantity' || field === 'unitPrice') {
            item.total = item.quantity * item.unitPrice;
        }
        
        newItems[index] = item;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };
    
    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!selectedClient || !selectedCar) {
            setError("Cliente e veicolo sono obbligatori.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.createQuote({
                clientId: selectedClient.id,
                carId: selectedCar.id,
                quoteDate,
                items,
                totalAmount,
            });
            onQuoteCreated();
        } catch (err: any) {
            setError(err.message || "Errore nella creazione del preventivo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyleSx} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">Crea Nuovo Preventivo</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <Autocomplete
                        options={mechanicStore.clients}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                        value={selectedClient}
                        onChange={(e, newValue) => {
                            setSelectedClient(newValue);
                            setSelectedCar(null); // Resetta l'auto quando cambia il cliente
                        }}
                        renderInput={(params) => <TextField {...params} label="Seleziona Cliente" required />}
                    />
                     <Autocomplete
                        options={availableCars}
                        getOptionLabel={(option) => `${option.year} ${option.make} ${option.model} (${option.licensePlate || 'N/D'})`}
                        value={selectedCar}
                        onChange={(e, newValue) => setSelectedCar(newValue)}
                        disabled={!selectedClient}
                        renderInput={(params) => <TextField {...params} label="Seleziona Veicolo" required />}
                    />
                    <TextField
                        label="Data Preventivo"
                        type="date"
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                    />

                    <Typography variant="subtitle1" sx={{pt: 1}}>Dettagli</Typography>
                     {items.map((item, index) => (
                        <Stack direction="row" spacing={1} key={index} alignItems="center">
                           <TextField label="Descrizione" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} required fullWidth/>
                           <TextField label="Qtà" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))} required sx={{width: 100}}/>
                           <TextField label="Prezzo Unit." type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} required sx={{width: 120}}/>
                           <Tooltip title="Rimuovi riga">
                                <span>
                                    <IconButton onClick={() => removeItem(index)} disabled={items.length === 1}>
                                        <Delete />
                                    </IconButton>
                                </span>
                           </Tooltip>
                        </Stack>
                    ))}
                    <Button onClick={addItem}>Aggiungi Riga</Button>

                    <Typography variant="h6" align="right">Totale: €{totalAmount.toFixed(2)}</Typography>

                    {error && <Alert severity="error">{error}</Alert>}
                    
                    <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
                        {loading ? <CircularProgress size={24} /> : 'Crea Preventivo'}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
});

export default CreateQuoteModal;