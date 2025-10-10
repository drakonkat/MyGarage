import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button,
  CircularProgress, Alert, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';

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
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
          <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
            <FormLabel component="legend">Tipo di account</FormLabel>
            <RadioGroup
              row
              aria-label="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'personal' | 'mechanic')}
            >
              <FormControlLabel value="personal" control={<Radio />} label="Personale" />
              <FormControlLabel value="mechanic" control={<Radio />} label="Officina" />
            </RadioGroup>
          </FormControl>
          
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
  );
});

export default SignupPage;
