import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, Alert, Stack, Collapse } from '@mui/material';
import { apiClient } from '../../ApiClient.ts';

interface CreateClientModalProps {
    open: boolean;
    onClose: () => void;
    onClientCreated: () => void;
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
  maxHeight: '90vh',
  overflowY: 'auto',
};

const CreateClientModal: React.FC<CreateClientModalProps> = ({ open, onClose, onClientCreated }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setPhone('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setLoading(false);
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (email && password !== confirmPassword) {
            setError("Le password non corrispondono.");
            return;
        }

        if (email && password.length < 6) {
            setError("La password deve essere di almeno 6 caratteri per creare un account.");
            return;
        }

        setLoading(true);
        try {
            const clientData: any = { firstName, lastName, phone };
            if (email) {
                clientData.email = email;
                clientData.password = password;
            }

            await apiClient.createClient(clientData);
            onClientCreated();
        } catch (err: any) {
            setError(err.message || "Errore nella creazione del cliente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyleSx} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">Crea Nuovo Cliente</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Inserisci i dati del cliente. L'email è opzionale: compilala solo se vuoi creare un account per il portale cliente.
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Nome"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        fullWidth
                        required
                        autoFocus
                    />
                    <TextField
                        label="Cognome"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        fullWidth
                        required
                    />
                     <TextField
                        label="Telefono"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Email (Opzionale)"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />
                    <Collapse in={!!email} timeout="auto" unmountOnExit>
                         <Stack spacing={2} sx={{mt: 2}}>
                             <TextField
                                label="Password per il cliente"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                required={!!email}
                            />
                            <TextField
                                label="Conferma Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                                required={!!email}
                            />
                        </Stack>
                    </Collapse>
                    
                    {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
                    
                    <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
                        {loading ? <CircularProgress size={24} /> : 'Crea Cliente'}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default CreateClientModal;