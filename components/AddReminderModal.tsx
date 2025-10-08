import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack } from '@mui/material';
import { modalStyle } from '../theme.ts';
import { AnnualReminder } from '../types.ts';

interface AddReminderModalProps {
    open: boolean;
    onClose: () => void;
    onAddReminder: (reminder: Omit<AnnualReminder, 'id' | 'paymentHistory'>) => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({ open, onClose, onAddReminder }) => {
    const [description, setDescription] = useState('');
    const [nextDueDate, setNextDueDate] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!description.trim() || !nextDueDate || !amount) return;
        onAddReminder({ 
            description,
            nextDueDate,
            amount: parseFloat(amount)
        });
        handleClose();
    };
    
    const handleClose = () => {
        setDescription('');
        setNextDueDate('');
        setAmount('');
        onClose();
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">Aggiungi Scadenza Annuale</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField 
                        name="description" 
                        label="Descrizione (es. Assicurazione RCA)" 
                        fullWidth 
                        required 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        autoFocus
                    />
                    <TextField 
                        name="nextDueDate" 
                        label="Prossima Scadenza" 
                        type="date"
                        fullWidth 
                        required 
                        value={nextDueDate}
                        onChange={(e) => setNextDueDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField 
                        name="amount" 
                        label="Importo (€)" 
                        type="number"
                        inputProps={{ step: "0.01" }}
                        fullWidth 
                        required 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 2 }}>Aggiungi Scadenza</Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default AddReminderModal;