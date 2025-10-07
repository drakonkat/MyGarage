import { createTheme } from '@mui/material';

export const getTheme = (mode: 'light' | 'dark', primaryColor?: string) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: primaryColor || '#1976d2', // Colore primario di default per il tema chiaro
          },
          secondary: {
            main: '#dc004e', // Colore secondario di default per il tema chiaro
          },
          background: {
            default: '#f4f6f8',
            paper: '#ffffff',
          },
        }
      : {
          primary: {
            main: primaryColor || '#90caf9', // Colore primario di default per il tema scuro
          },
          secondary: {
            main: '#f48fb1', // Colore secondario di default per il tema scuro
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        }),
  },
});


export const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};
