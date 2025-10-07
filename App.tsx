import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CssBaseline,
  ThemeProvider,
  Container,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';

import { getTheme } from './theme.ts';
import { Car, MaintenanceRecord, KnownIssue, SimulationResultData } from './types.ts';
import { geminiApi } from './api.ts';
import { getCarsFromDB, saveCarsToDB } from './db.ts';

import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import CarDetail from './components/CarDetail.tsx';
import AddCarModal from './components/AddCarModal.tsx';
import AddMaintenanceModal from './components/AddMaintenanceModal.tsx';
import AddIssueModal from './components/AddIssueModal.tsx';
import SimulationSetupModal from './components/SimulationSetupModal.tsx';
import SimulationResultModal from './components/SimulationResultModal.tsx';


function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<false | 'addCar' | 'addMaintenance' | 'addIssue' | 'simulationSetup' | 'simulationResult'>(false);
  const [maintenanceModalData, setMaintenanceModalData] = useState<{ defaultDescription?: string }>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [simulationResult, setSimulationResult] = useState<SimulationResultData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('themeMode') as 'light' | 'dark') || 'dark';
  });
  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    return localStorage.getItem('primaryColor') || (themeMode === 'dark' ? '#90caf9' : '#1976d2');
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    // Imposta un colore primario di default quando il tema cambia, se non è già stato personalizzato
    if (localStorage.getItem('primaryColor') === null) {
        setPrimaryColor(themeMode === 'dark' ? '#90caf9' : '#1976d2');
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  const theme = useMemo(() => getTheme(themeMode, primaryColor), [themeMode, primaryColor]);


  // Load cars from IndexedDB on initial render
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            const storedCars = await getCarsFromDB();
            if (storedCars) {
                setCars(storedCars);
            }
        } catch (err) {
            setError("Impossibile caricare i dati salvati dal database.");
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    };
    loadData();
  }, []);

  // Save cars to IndexedDB whenever they change
  useEffect(() => {
    if (isInitialLoad) {
        return; // Don't save on the very first render before data is loaded
    }
    const saveData = async () => {
        try {
            await saveCarsToDB(cars);
        } catch (err) {
            setError("Impossibile salvare i dati nel database del browser.");
        }
    };
    saveData();
  }, [cars, isInitialLoad]);


  // --- DATA HANDLING ---
  const handleExport = () => {
    if (cars.length === 0) {
        setError("Nessuna auto da esportare.");
        return;
    }
    const dataStr = JSON.stringify(cars, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'manutenzione_auto.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedCars = JSON.parse(text);
        // Basic validation could be improved
        if (Array.isArray(importedCars)) {
          setCars(importedCars);
          setError(null);
        } else {
          throw new Error("Il file JSON deve contenere un array di auto.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Errore nell'importazione del file: ${errorMessage}.`);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };
  

  const handleAddCar = async (carData: { make: string; model: string; year: string; mileage: string }) => {
    setLoading(true);
    setError(null);
    setModalOpen(false);
    
    const year = parseInt(carData.year, 10);
    const mileage = parseInt(carData.mileage, 10);

    const initialRecord: MaintenanceRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        mileage: mileage,
        description: 'Veicolo aggiunto al sistema',
        cost: 0,
        notes: 'Chilometraggio iniziale al momento dell\'aggiunta.',
        isRecommendation: false,
    };

    let recommendedMaintenance: MaintenanceRecord[] = [];
    try {
        recommendedMaintenance = await geminiApi.fetchMaintenanceSchedule(carData.make, carData.model, year, mileage);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Impossibile recuperare il piano di manutenzione da Gemini: ${errorMessage}`);
    } finally {
        const allMaintenance = [initialRecord, ...recommendedMaintenance];
        const sortedMaintenance = allMaintenance.sort((a, b) => b.mileage - a.mileage);

        const newCar: Car = {
          id: crypto.randomUUID(),
          make: carData.make,
          model: carData.model,
          year,
          maintenance: sortedMaintenance,
          knownIssues: [],
        };
    
        setCars(prevCars => [...prevCars, newCar]);
        setLoading(false);
    }
  };
  
  const handleAddMaintenance = (newRecord: Omit<MaintenanceRecord, 'id'>) => {
      if (!selectedCar) return;

      const recordWithId: MaintenanceRecord = { ...newRecord, id: crypto.randomUUID() };

      const updatedCars = cars.map(car =>
          car.id === selectedCar.id
              ? { ...car, maintenance: [...car.maintenance, recordWithId].sort((a,b) => b.mileage - a.mileage) }
              : car
      );
      setCars(updatedCars);
      // Update the selected car instance to reflect the change immediately
      setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
      setModalOpen(false);
  };
  
  const handleCarSelect = (car: Car) => {
      setSelectedCar(car);
  };

  const handleBackToDashboard = () => {
      setSelectedCar(null);
  }

  // --- ISSUE HANDLERS ---
  const handleAddIssue = (newIssue: { description: string }) => {
    if (!selectedCar) return;

    const issueWithId: KnownIssue = {
        ...newIssue,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString().split('T')[0],
        isResolved: false
    };

    const updatedCars = cars.map(car =>
        car.id === selectedCar.id
            ? { ...car, knownIssues: [...(car.knownIssues || []), issueWithId] }
            : car
    );
    setCars(updatedCars);
    setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
    setModalOpen(false);
  };

  const handleToggleIssue = (issueId: string) => {
      if (!selectedCar) return;
      const updatedCars = cars.map(car => {
          if (car.id === selectedCar.id) {
              const updatedIssues = (car.knownIssues || []).map(issue => 
                  issue.id === issueId ? { ...issue, isResolved: !issue.isResolved } : issue
              );
              return { ...car, knownIssues: updatedIssues };
          }
          return car;
      });
      setCars(updatedCars);
      setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
  };

  const handleDeleteIssue = (issueId: string) => {
      if (!selectedCar) return;
      if (!window.confirm("Sei sicuro di voler eliminare questo problema?")) return;

      const updatedCars = cars.map(car => {
          if (car.id === selectedCar.id) {
              const updatedIssues = (car.knownIssues || []).filter(issue => issue.id !== issueId);
              return { ...car, knownIssues: updatedIssues };
          }
          return car;
      });
      setCars(updatedCars);
      setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
  };

  const openMaintenanceModal = (defaultDescription?: string) => {
      setMaintenanceModalData({ defaultDescription });
      setModalOpen('addMaintenance');
  }

    // --- SIMULATION HANDLERS ---
  const handleGenerateSimulation = async (car: Car, targetMileage: number) => {
    setModalOpen(false); // Chiude la modale di setup subito
    setIsSimulating(true);
    setError(null);
    try {
        const { records, annualCosts } = await geminiApi.fetchMaintenanceSimulation(car, targetMileage);
        setSimulationResult({ car, records, annualCosts, targetMileage });
        setModalOpen('simulationResult');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Errore durante la generazione della simulazione: ${errorMessage}`);
    } finally {
        setIsSimulating(false);
    }
  };

  const handleAddSimulatedCar = (result: SimulationResultData) => {
    const carToAdd = result.car;

    const initialMileage = carToAdd.maintenance[0].mileage;

    const initialRecord: MaintenanceRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        mileage: initialMileage,
        description: 'Veicolo aggiunto al sistema',
        cost: 0,
        notes: 'Aggiunto dopo la simulazione.',
        isRecommendation: false,
    };
    
    const recommendedRecords: MaintenanceRecord[] = result.records.map(r => ({
        id: r.id,
        date: 'N/A',
        mileage: r.mileage,
        description: r.description,
        cost: 0, // Le raccomandazioni non hanno un costo finché non vengono completate
        isRecommendation: true,
    }));
    
    const finalCar: Car = {
        ...carToAdd,
        maintenance: [initialRecord, ...recommendedRecords].sort((a,b) => b.mileage - a.mileage),
        knownIssues: [],
    };

    setCars(prevCars => [...prevCars, finalCar]);
    setModalOpen(false);
    setSimulationResult(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header
        onImportClick={handleImportClick}
        onExport={handleExport}
        onAddCarClick={() => setModalOpen('addCar')}
        onSimulateClick={() => setModalOpen('simulationSetup')}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        primaryColor={primaryColor}
        setPrimaryColor={setPrimaryColor}
      />
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" onClose={() => setError(null)} sx={{mb: 2}}>{error}</Alert>}
        
        {(loading || isSimulating) && <CircularProgress sx={{ display: 'block', margin: '40px auto' }} />}
        
        {!loading && !isSimulating && (
            selectedCar ? (
                <CarDetail 
                    car={selectedCar} 
                    onBack={handleBackToDashboard}
                    onLogMaintenanceForTask={openMaintenanceModal}
                    onAddIssueClick={() => setModalOpen('addIssue')}
                    onToggleIssue={handleToggleIssue}
                    onDeleteIssue={handleDeleteIssue}
                />
            ) : (
                <Dashboard 
                    cars={cars} 
                    onCarSelect={handleCarSelect} 
                />
            )
        )}

        {!loading && !isSimulating && cars.length === 0 && !selectedCar && (
          <Typography variant="h6" align="center" sx={{ mt: 5 }}>
            Nessuna auto presente. Aggiungi la tua prima auto per iniziare!
          </Typography>
        )}
      </Container>
      
      <AddCarModal 
        open={modalOpen === 'addCar'}
        onClose={() => setModalOpen(false)}
        onAddCar={handleAddCar}
        setError={setError}
      />
      
      <AddMaintenanceModal 
        open={modalOpen === 'addMaintenance'}
        onClose={() => setModalOpen(false)}
        onAddMaintenance={handleAddMaintenance}
        defaultDescription={maintenanceModalData.defaultDescription}
      />

      <AddIssueModal
        open={modalOpen === 'addIssue'}
        onClose={() => setModalOpen(false)}
        onAddIssue={handleAddIssue}
      />

      <SimulationSetupModal
        open={modalOpen === 'simulationSetup'}
        onClose={() => setModalOpen(false)}
        onGenerate={handleGenerateSimulation}
        isSimulating={isSimulating}
      />

      <SimulationResultModal
        open={modalOpen === 'simulationResult'}
        onClose={() => {
            setModalOpen(false);
            setSimulationResult(null);
        }}
        result={simulationResult}
        onAddCar={handleAddSimulatedCar}
      />

    </ThemeProvider>
  );
}

export default App;
