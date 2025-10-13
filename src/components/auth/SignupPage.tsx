import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button,
  CircularProgress, Alert, Paper, List, ListItem, ListItemText,
  ListItemIcon, Collapse, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Person, Engineering, CheckCircleOutline } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import AuthHeader from './AuthHeader.tsx';

const featureContent = {
    personal: {
        title: 'Ideale per l\'utente privato',
        features: [
            'Salva i dati delle tue auto nel cloud, al sicuro.',
            'Accedi alla cronologia dei tuoi veicoli da qualsiasi dispositivo.',
            'Ricevi promemoria via email per le scadenze (Prossimamente!).'
        ]
    },
    mechanic: {
        title: 'La soluzione per l\'officina moderna',
        features: [
            'Gestisci i tuoi clienti e il loro intero parco auto.',
            'Crea e invia preventivi e fatture digitali in pochi click.',
            'Offri un portale dedicato ai tuoi clienti per fidelizzarli.'
        ]
    }
};

// Helper component per non ripetere il codice
const FeaturePaper: React.FC<{ content: { title: string; features: string[] } }> = ({ content }) => (
    <Paper variant="outlined" sx={{ p: 2, mt: 2, borderColor: 'primary.main', bgcolor: 'action.hover' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {content.title}
        </Typography>
        <List dense sx={{ py: 0, '& .MuiListItem-root': { p: 0 } }}>
            {content.features.map((text, index) => (
                <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleOutline fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={text} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                </ListItem>
            ))}
        </List>
    </Paper>
);

const SignupPage: React.FC = observer(() => {
  const { userStore, viewStore } = useStores();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'personal' | 'mechanic'>('personal');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFormError("Le password non corrispondono.");
      return;
    }
    setFormError(null);
    setLoading(true);
    userStore.error = null;
    try {
      await userStore.signup(email, password, role);
      // La navigazione avviene nello store
    } catch (error) {
      // L'errore viene gestito e mostrato dallo store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AuthHeader />
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Registrati
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Indirizzo Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Conferma Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="account-type-select-label">Scegli il tipo di account</InputLabel>
              <Select
                labelId="account-type-select-label"
                value={role}
                label="Scegli il tipo di account"
                onChange={(e) => setRole(e.target.value as 'personal' | 'mechanic')}
              >
                <MenuItem value="personal">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <ListItemText primary="Personale" />
                  </Box>
                </MenuItem>
                <MenuItem value="mechanic">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Engineering sx={{ mr: 1, color: 'text.secondary' }} />
                    <ListItemText primary="Officina" />
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ minHeight: '160px', mt: 1 }}>
                <Collapse in={role === 'personal'} timeout="auto" unmountOnExit>
                    <FeaturePaper content={featureContent.personal} />
                </Collapse>
                <Collapse in={role === 'mechanic'} timeout="auto" unmountOnExit>
                    <FeaturePaper content={featureContent.mechanic} />
                </Collapse>
            </Box>
            
            {(userStore.error || formError) && <Alert severity="error" sx={{width: '100%', mt: 2}}>{userStore.error || formError}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Registrati'}
            </Button>
             <Button
              fullWidth
              variant="text"
              onClick={() => viewStore.setView('login')}
            >
              Hai già un account? Accedi
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
});

export default SignupPage;
