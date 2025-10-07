import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { modalStyle } from '../theme.ts';

interface AddIssueModalProps {
    open: boolean;
    onClose: () => void;
    onAddIssue: (issue: { description: string }) => void;
}

const AddIssueModal: React.FC<AddIssueModalProps> = ({ open, onClose, onAddIssue }) => {
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!description.trim()) return;
        onAddIssue({ description });
        setDescription(''); // Reset for next time
        onClose();
    };
    
    const handleClose = () => {
        setDescription('');
        onClose();
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">Aggiungi Problema Conosciuto</Typography>
                <TextField 
                    name="description" 
                    label="Descrizione del problema" 
                    fullWidth 
                    margin="normal" 
                    required 
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    autoFocus
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>Aggiungi Problema</Button>
            </Box>
        </Modal>
    );
};

export default AddIssueModal;