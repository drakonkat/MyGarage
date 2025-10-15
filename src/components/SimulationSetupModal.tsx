import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Autocomplete,
    CircularProgress,
    Stack,
    Alert
} from '@mui/material';
import { modalStyle } from '../theme.ts';
import { Car, AutoDocMakerOption, AutoDocModelOption, AutoDocVehicleOption } from '../types.ts';
// Fix: Updated import from `externalApi` to `apiClient` to reflect the new API structure.
import { apiClient } from '../ApiClient.ts';

interface SimulationSetupModalProps {
    open: boolean;
    onClose: () => void;
    onGenerate: (car: Car, targetMileage: number) => void;
    isSimulating: boolean;
}

const SimulationSetupModal: React.FC<SimulationSetupModalProps> = ({ open, onClose, onGenerate, isSimulating }) => {
    // State for API-driven fields
    const [carMakes, setCarMakes] = useState<AutoDocMakerOption[]>([]);
    const [carModels, setCarModels] = useState<AutoDocModelOption[]>([]);
    const [carVehicles, setCarVehicles] = useState<AutoDocVehicleOption[]>([]);
    
    const [selectedMake, setSelectedMake] = useState<AutoDocMakerOption | null>(null);
    const [selectedModel, setSelectedModel] = useState<AutoDocModelOption | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<AutoDocVehicleOption | null>(null);

    // State for user input
    const [selectedYear, setSelectedYear] = useState('');
    const [currentMileage, setCurrentMileage] = useState('');
    const [targetMileage, setTargetMileage] = useState('');
    
    // UI State
    const [isMakesLoading, setIsMakesLoading] = useState(false);
    const [isModelsLoading, setIsModelsLoading] = useState(false);
    const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch makes on modal open
    useEffect(() => {
        if (open && carMakes.length === 0) {
            const loadMakes = async () => {
                setIsMakesLoading(true);
                setError(null);
                try {
                    // Fix: Replaced `externalApi` with `apiClient` to align with the current API client structure.
                    const makes = await apiClient.fetchMakes();
                    setCarMakes(makes);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    setError(`Impossibile caricare le marche delle auto: ${errorMessage}`);
                } finally {
                    setIsMakesLoading(false);
                }
            };
            loadMakes();
        }
    }, [open, carMakes.length]);

    const handleMakeChange = async (_event: React.SyntheticEvent, newValue: AutoDocMakerOption | null) => {
        setSelectedMake(newValue);
        setSelectedModel(null);
        setCarModels([]);
        setSelectedVehicle(null);
        setCarVehicles([]);
        
        if (!newValue) return;

        setIsModelsLoading(true);
        setError(null);
        try {
            // Fix: Replaced `externalApi` with `apiClient` to align with the current API client structure.
            const models = await apiClient.fetchModels(newValue.id);
            setCarModels(models);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Impossibile caricare i modelli per ${newValue.name}: ${errorMessage}`);
        } finally {
            setIsModelsLoading(false);
        }
    };
    
    const handleModelChange = async (_event: React.SyntheticEvent, newValue: AutoDocModelOption | null) => {
        setSelectedModel(newValue);
        setSelectedVehicle(null);
        setCarVehicles([]);
        
        if (!newValue) return;

        setIsVehiclesLoading(true);
        setError(null);
        try {
            // Fix: Replaced `externalApi` with `apiClient` to align with the current API client structure.
            const vehicles = await apiClient.fetchVehicles(newValue.id);
            setCarVehicles(vehicles);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Impossibile caricare le motorizzazioni per ${newValue.name}: ${errorMessage}`);
        } finally {
            setIsVehiclesLoading(false);
        }
    };

    const resetForm = () => {
        // We don't reset carMakes to avoid refetching if the user re-opens the modal
        setCarModels([]);
        setCarVehicles([]);
        setSelectedMake(null);
        setSelectedModel(null);
        setSelectedVehicle(null);
        setSelectedYear('');
        setCurrentMileage('');
        setTargetMileage('');
        setError(null);
    };

    const handleSubmit = () => {
        const current = parseInt(currentMileage, 10);
        const target = parseInt(targetMileage, 10);
        const year = parseInt(selectedYear, 10);
        
        if (!selectedMake || !selectedModel || !selectedVehicle || !selectedYear || !currentMileage || !targetMileage) {
            setError("Per favore, compila tutti i campi.");
            return;
        }
        if (isNaN(target) || target <= current) {
            setError(`Il chilometraggio di destinazione deve essere un numero maggiore di quello attuale (${current.toLocaleString()} km).`);
            return;
        }
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
            setError("Per favore, inserisci un anno valido.");
            return;
        }

        setError(null);

        const simulatedCar: Car = {
            id: crypto.randomUUID(),
            make: selectedMake.name,
            model: `${selectedModel.name} ${selectedVehicle.name}`,
            year: year,
            maintenance: [{
                id: 'temp-initial',
                date: new Date().toISOString(),
                mileage: current,
                description: 'Chilometraggio iniziale per simulazione',
                cost: 0,
            }],
        };
        
        onGenerate(simulatedCar, target);
    };

    const handleClose = () => {
        if (isSimulating) return;
        resetForm();
        onClose();
    };

    const isSubmitDisabled = !selectedMake || !selectedModel || !selectedVehicle || !selectedYear || !currentMileage || !targetMileage || isSimulating;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2">Crea Simulazione Manutenzione</Typography>
                
                <Stack spacing={2} sx={{mt: 2}}>
                    <Autocomplete
                        options={carMakes}
                        loading={isMakesLoading}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={handleMakeChange}
                        disabled={isSimulating}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleziona Marca"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isMakesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <Autocomplete
                        disabled={!selectedMake || isModelsLoading || isSimulating}
                        options={carModels}
                        loading={isModelsLoading}
                        value={selectedModel}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={handleModelChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleziona Modello"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isModelsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <Autocomplete
                        disabled={!selectedModel || isVehiclesLoading || isSimulating}
                        options={carVehicles}
                        loading={isVehiclesLoading}
                        value={selectedVehicle}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(_event, newValue) => setSelectedVehicle(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleziona Motorizzazione"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isVehiclesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <TextField
                        label="Anno"
                        type="number"
                        fullWidth
                        required
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        disabled={isSimulating}
                    />
                     <TextField
                        label="Chilometraggio attuale (km)"
                        type="number"
                        fullWidth
                        required
                        value={currentMileage}
                        onChange={(e) => setCurrentMileage(e.target.value)}
                        disabled={isSimulating}
                    />
                     <TextField
                        label="Chilometraggio di destinazione (km)"
                        type="number"
                        fullWidth
                        required
                        value={targetMileage}
                        onChange={(e) => setTargetMileage(e.target.value)}
                        disabled={isSimulating}
                    />

                    {error && <Alert severity="error">{error}</Alert>}

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ mt: 2 }}
                        disabled={isSubmitDisabled}
                    >
                        {isSimulating ? <CircularProgress size={24} /> : "Genera Simulazione"}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default SimulationSetupModal;
