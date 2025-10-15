import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Tabs, Tab, CircularProgress } from '@mui/material';
import { PersonAdd, People, Assessment, Receipt, RequestQuote, Inventory2 } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import Header from '../Header.tsx';
import { useStores } from '../../stores/RootStore.ts';
import CreateClientModal from './CreateClientModal.tsx';
import ClientList from './ClientList.tsx';
import ClientDetailView from './ClientDetailView.tsx';
import MechanicDashboard from './MechanicDashboard.tsx';
import QuotesView from './QuotesView.tsx';
import InvoicesView from './InvoicesView.tsx';
import InventoryView from './InventoryView.tsx';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mechanic-tabpanel-${index}`}
      aria-labelledby={`mechanic-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MechanicApp: React.FC = observer(() => {
    const { mechanicStore } = useStores();
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        // Carica tutti i dati necessari quando il componente viene montato
        mechanicStore.fetchAllData();
    }, [mechanicStore]);

    useEffect(() => {
      // Quando si torna alla lista clienti (deselezionando un cliente),
      // assicurati che il tab "Clienti" sia attivo.
      if (!mechanicStore.selectedClient && activeTab !== 1) {
          // This logic might be too aggressive, let's see.
          // Let's disable for now to avoid unwanted tab switching.
      }
    }, [mechanicStore.selectedClient, activeTab]);

    const handleClientCreated = () => {
        setIsClientModalOpen(false);
        mechanicStore.fetchClients(); // Ricarica solo i clienti dopo la creazione
        mechanicStore.fetchDashboardStats(); // Aggiorna anche le statistiche
        setActiveTab(1); // Switch to clients tab after creation
    };
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        // Deseleziona il cliente se si cambia tab
        if (newValue !== 1 && mechanicStore.selectedClient) {
            mechanicStore.unselectClient();
        }
    };

    const renderClientTabContent = () => {
      if (mechanicStore.isLoadingClients || mechanicStore.isLoadingClientDetails) {
        return <CircularProgress sx={{ display: 'block', margin: '40px auto' }} />;
      }
      if (mechanicStore.selectedClient) {
        return <ClientDetailView />;
      }
      return <ClientList />;
    }

    return (
        <>
            <Header />
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4">
                        Gestionale Officina
                    </Typography>
                     <Button 
                        variant="contained" 
                        startIcon={<PersonAdd />}
                        onClick={() => setIsClientModalOpen(true)}
                    >
                        Nuovo Cliente
                    </Button>
                </Box>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="mechanic dashboard tabs" variant="scrollable" scrollButtons="auto">
                        <Tab icon={<Assessment />} iconPosition="start" label="Dashboard" id="mechanic-tab-0" />
                        <Tab icon={<People />} iconPosition="start" label="Clienti" id="mechanic-tab-1" />
                        <Tab icon={<RequestQuote />} iconPosition="start" label="Preventivi" id="mechanic-tab-2" />
                        <Tab icon={<Receipt />} iconPosition="start" label="Fatture" id="mechanic-tab-3" />
                        <Tab icon={<Inventory2 />} iconPosition="start" label="Inventario" id="mechanic-tab-4" />
                    </Tabs>
                </Box>
                
                
                <TabPanel value={activeTab} index={0}>
                    {mechanicStore.isLoadingStats ? <CircularProgress sx={{ display: 'block', margin: '40px auto' }} /> : <MechanicDashboard />}
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                    {renderClientTabContent()}
                </TabPanel>
                <TabPanel value={activeTab} index={2}>
                    <QuotesView />
                </TabPanel>
                <TabPanel value={activeTab} index={3}>
                    <InvoicesView />
                </TabPanel>
                 <TabPanel value={activeTab} index={4}>
                    <InventoryView />
                </TabPanel>

            </Container>
            
            <CreateClientModal
                open={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onClientCreated={handleClientCreated}
            />
        </>
    );
});

export default MechanicApp;