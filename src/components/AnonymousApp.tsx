import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Container,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';

import { Car, MaintenanceRecord, KnownIssue, SimulationResultData, Reminder } from '../types.ts';
import { geminiApi } from '../ApiClient.ts';
import { getCarsFromDB, saveCarsToDB } from '../db.ts';

import Header from './Header.tsx';
import Dashboard from './Dashboard.tsx';
import CarDetail from './CarDetail.tsx';
import AddCarModal from './AddCarModal.tsx';
import AddMaintenanceModal from './AddMaintenanceModal.tsx';
import AddIssueModal from './AddIssueModal.tsx';
import AddReminderModal from './AddReminderModal.tsx';
import SimulationSetupModal from './SimulationSetupModal.tsx';
import SimulationResultModal from './SimulationResultModal.tsx';


function AnonymousApp() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<false | 'addCar' | 'addMaintenance' | 'addIssue' | 'simulationSetup' | 'simulationResult' | 'addReminder'>(false);
  const [maintenanceModalData, setMaintenanceModalData] = useState<{ defaultDescription?: string }>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [simulationResult, setSimulationResult] = useState<SimulationResultData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    event.target.value = '';
  };
  
  const fetchAndApplyRecommendations = async (carId: string, make: string, model: string, year: number, mileage: number) => {
    try {
        const recommendedMaintenance = await geminiApi.fetchMaintenanceSchedule(make, model, year, mileage);
        
        setCars(prevCars => {
            return prevCars.map(car => {
                if (car.id === carId) {
                    const allMaintenance = [...car.maintenance, ...recommendedMaintenance];
                    const sortedMaintenance = allMaintenance.sort((a, b) => b.mileage - a.mileage);
                    return { ...car, maintenance: sortedMaintenance };
                }
                return car;
            });
        });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Impossibile recuperare il piano di manutenzione per ${make} ${model}: ${errorMessage}`);
        setError(`Impossibile recuperare il piano di manutenzione per ${make} ${model}. Potrai comunque usare l'app normalmente.`);
    }
  };

  const handleAddCar = (carData: { make: string; model: string; year: string; mileage: string; licensePlate: string; }) => {
    setError(null);
    setModalOpen(false);
    
    const year = parseInt(carData.year, 10);
    const mileage = parseInt(carData.mileage, 10);
    const newCarId = crypto.randomUUID();

    const initialRecord: MaintenanceRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        mileage: mileage,
        description: 'Veicolo aggiunto al sistema',
        cost: 0,
        notes: 'Chilometraggio iniziale al momento dell\'aggiunta.',
        isRecommendation: false,
    };

    const newCar: Car = {
      id: newCarId,
      make: carData.make,
      model: carData.model,
      year,
      licensePlate: carData.licensePlate,
      maintenance: [initialRecord],
      knownIssues: [],
      reminders: [],
    };

    setCars(prevCars => [...prevCars, newCar]);
    
    fetchAndApplyRecommendations(newCarId, carData.make, carData.model, year, mileage);
  };
  
  const handleDeleteCar = (carId: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa auto e tutta la sua cronologia? L'azione è irreversibile.")) {
        return;
    }
    
    setCars(prevCars => prevCars.filter(car => car.id !== carId));

    if (selectedCar && selectedCar.id === carId) {
        setSelectedCar(null);
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
      setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
      setModalOpen(false);
  };
  
  const handleDeleteMaintenanceRecord = (recordId: string) => {
    if (!selectedCar) return;

    const updatedCars = cars.map(car => {
        if (car.id === selectedCar.id) {
            const updatedMaintenance = car.maintenance.filter(record => record.id !== recordId);
            return { ...car, maintenance: updatedMaintenance };
        }
        return car;
    });
    setCars(updatedCars);
    setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
  };
  
  const handleCarSelect = (car: Car) => {
      setSelectedCar(car);
  };

  const handleBackToDashboard = () => {
      setSelectedCar(null);
  }

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

  const handleAddReminder = (newReminderData: Omit<Reminder, 'id' | 'paymentHistory'>) => {
      if (!selectedCar) return;

      const reminderWithId: Reminder = { 
          ...newReminderData, 
          id: crypto.randomUUID(),
          paymentHistory: [] 
      };

      const updatedCars = cars.map(car =>
          car.id === selectedCar.id
              ? { ...car, reminders: [...(car.reminders || []), reminderWithId] }
              : car
      );
      setCars(updatedCars);
      setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
      setModalOpen(false);
  };

  const handlePayReminder = (reminderId: string, paymentAmount: number) => {
      if (!selectedCar) return;

      const updatedCars = cars.map(car => {
          if (car.id === selectedCar.id) {
              const updatedReminders = (car.reminders || []).map(reminder => {
                  if (reminder.id === reminderId) {
                      const nextDueDate = new Date(reminder.nextDueDate);
                      const frequency = reminder.frequency || 'annual';

                      switch (frequency) {
                          case 'monthly':
                              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                              break;
                          case 'biennial':
                              nextDueDate.setFullYear(nextDueDate.getFullYear() + 2);
                              break;
                          case 'annual':
                          default:
                              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                              break;
                      }

                      return { 
                          ...reminder,
                          nextDueDate: nextDueDate.toISOString().split('T')[0],
                          paymentHistory: [
                              ...(reminder.paymentHistory || []),
                              { date: new Date().toISOString().split('T')[0], amount: paymentAmount }
                          ]
                      };
                  }
                  return reminder;
              });
              return { ...car, reminders: updatedReminders };
          }
          return car;
      });

      setCars(updatedCars);
      setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
  };

  const handleDeleteReminder = (reminderId: string) => {
      if (!window.confirm("Sei sicuro di voler eliminare questa scadenza? Verrà eliminata anche la sua cronologia pagamenti.")) return;

      const updatedCars = cars.map(car => {
          if (car.id === selectedCar.id) {
              const updatedReminders = (car.reminders || []).filter(r => r.id !== reminderId);
              return { ...car, reminders: updatedReminders };
          }
          return car;
      });
      setCars(updatedCars);
      setSelectedCar(updatedCars.find(c => c.id === selectedCar.id) || null);
  };

  const handleGenerateSimulation = async (car: Car, targetMileage: number) => {
    setModalOpen(false);
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
        cost: 0,
        isRecommendation: true,
    }));
    
    const finalCar: Car = {
        ...carToAdd,
        maintenance: [initialRecord, ...recommendedRecords].sort((a,b) => b.mileage - a.mileage),
        knownIssues: [],
        reminders: [],
    };

    setCars(prevCars => [...prevCars, finalCar]);
    setModalOpen(false);
    setSimulationResult(null);
  };

  const filteredCars = useMemo(() => {
    if (!searchQuery) return cars;
    return cars.filter(car => 
      `${car.year} ${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cars, searchQuery]);

  return (
    <>
      <Header
        onImportClick={handleImportClick}
        onExport={handleExport}
        onAddCarClick={() => setModalOpen('addCar')}
        onSimulateClick={() => setModalOpen('simulationSetup')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
                    onAddReminderClick={() => setModalOpen('addReminder')}
                    onPayReminder={handlePayReminder}
                    onDeleteReminder={handleDeleteReminder}
                    onDeleteRecommendation={handleDeleteMaintenanceRecord}
                    onDeleteCar={handleDeleteCar}
                />
            ) : (
                <Dashboard 
                    cars={filteredCars} 
                    onCarSelect={handleCarSelect} 
                    onDeleteCar={handleDeleteCar}
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

      <AddReminderModal
        open={modalOpen === 'addReminder'}
        onClose={() => setModalOpen(false)}
        onAddReminder={handleAddReminder}
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
    </>
  );
}

export default AnonymousApp;