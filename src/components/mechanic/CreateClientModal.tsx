import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, Alert, Stack } from '@mui/material';
import { apiClient } from '../../ApiClient.ts';

interface CreateClientModalProps {
    open: boolean;
    onClose: () => void;
    onClientCreated: () => void;
    initialEmail: string;
}

const modalStyleSx = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 450 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const CreateClientModal: React.FC<CreateClientModalProps> = ({ open, onClose, onClientCreated, initialEmail }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Le password non corrispondono.");
            return;
        }

        if (password.length < 6) {
            setError("La password deve essere di almeno 6 caratteri.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.createClient(initialEmail, password);
            onClientCreated();
        } catch (err: any) {
            setError(err.message || "Errore nella creazione del cliente.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setLoading(false);
        onClose();
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyleSx} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">Crea Nuovo Cliente</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    L'utente non esiste nel sistema. Creagli un account. Potrà accedere con questa email e password per vedere i lavori sulla sua auto.
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Email Cliente"
                        value={initialEmail}
                        fullWidth
                        disabled
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Password Temporanea"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        required
                        autoFocus
                    />
                    <TextField
                        label="Conferma Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        required
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
                        {loading ? <CircularProgress size={24} /> : 'Crea e Aggiungi Cliente'}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default CreateClientModal;
