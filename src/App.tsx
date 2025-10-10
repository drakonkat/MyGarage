import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { RootStoreProvider, useStores } from './stores/RootStore.ts';
import { getTheme } from '../theme.ts';

import LandingPage from './components/LandingPage.tsx';
import LoginPage from './components/auth/LoginPage.tsx';
import SignupPage from './components/auth/SignupPage.tsx';
import AnonymousApp from './components/AnonymousApp.tsx';
import PersonalApp from './components/PersonalApp.tsx';
import MechanicApp from './components/mechanic/MechanicApp.tsx';


const ThemedApp = observer(() => {
  const { userStore, viewStore } = useStores();

  useEffect(() => {
    userStore.initialize();
  }, [userStore]);

  // TODO: Integrare lo stato del tema (light/dark/colore) con MobX per la persistenza.
  const theme = getTheme('dark');

  if (userStore.isInitializing) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  const renderContent = () => {
    switch (viewStore.currentView) {
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'anonymous_dashboard':
        return <AnonymousApp />;
      case 'personal_dashboard':
        return <PersonalApp />;
      case 'mechanic_dashboard':
        return <MechanicApp />;
      case 'landing':
      default:
        return <LandingPage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {renderContent()}
    </ThemeProvider>
  );
});

function App() {
  return (
    <RootStoreProvider>
      <ThemedApp />
    </RootStoreProvider>
  );
}

export default App;
