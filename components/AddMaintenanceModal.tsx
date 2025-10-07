import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { modalStyle } from '../theme.ts';
import { MaintenanceRecord } from '../types.ts';

interface AddMaintenanceModalProps {
    open: boolean;
    onClose: () => void;
    onAddMaintenance: (record: Omit<MaintenanceRecord, 'id'>) => void;
    defaultDescription?: string;
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ open, onClose, onAddMaintenance, defaultDescription }) => {
    
    const [description, setDescription] = useState(defaultDescription || '');
    
    useEffect(() => {
        if (open) {
            setDescription(defaultDescription || '');
        }
    }, [open, defaultDescription]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newRecord: Omit<MaintenanceRecord, 'id'> = {
            date: formData.get('date') as string,
            mileage: parseInt(formData.get('mileage') as string, 10),
            description: description,
            cost: parseFloat(formData.get('cost') as string),
            notes: formData.get('notes') as string,
        };
        onAddMaintenance(newRecord);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">Aggiungi Intervento di Manutenzione</Typography>
                <TextField 
                    name="description" 
                    label="Descrizione" 
                    fullWidth margin="normal" 
                    required 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    InputProps={{
                        readOnly: !!defaultDescription,
                    }}
                    // Use shrink to ensure label is always floated, especially when value is set programmatically
                    InputLabelProps={{ shrink: true }}
                />
                <TextField name="date" label="Data" type="date" fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
                <TextField name="mileage" label="Chilometraggio (km)" type="number" fullWidth margin="normal" required />
                <TextField name="cost" label="Costo (€)" type="number" step="0.01" fullWidth margin="normal" required />
                <TextField name="notes" label="Note" fullWidth margin="normal" multiline rows={2} />
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>Aggiungi Intervento</Button>
            </Box>
        </Modal>
    );
};

export default AddMaintenanceModal;