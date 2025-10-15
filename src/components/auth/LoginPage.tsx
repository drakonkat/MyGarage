import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import AuthHeader from './AuthHeader.tsx';

const LoginPage: React.FC = observer(() => {
  const { userStore, viewStore } = useStores();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    userStore.error = null;
    try {
      await userStore.login(email, password);
      // La navigazione avviene all'interno dello store in caso di successo
    } catch (error) {
      // L'errore viene già impostato nello store
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
            Accedi
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {userStore.error && <Alert severity="error" sx={{width: '100%', mt: 1}}>{userStore.error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Accedi'}
            </Button>
             <Button
              fullWidth
              variant="text"
              onClick={() => viewStore.setView('signup')}
            >
              Non hai un account? Registrati
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
});

export default LoginPage;