import React, { useState, useEffect } from 'react';
import {
    Modal, Box, Typography, TextField, Button, CircularProgress, Alert, Stack,
    Autocomplete, FormControlLabel, Switch, InputAdornment, IconButton
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore.ts';
import { AutoDocMakerOption, AutoDocModelOption, AutoDocVehicleOption } from '../../types.ts';
import { apiClient } from '../../ApiClient.ts';

interface AddCarToClientModalProps {
    open: boolean;
    onClose: () => void;
    onCarAdded: () => void;
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

const AddCarToClientModal: React.FC<AddCarToClientModalProps> = observer(({ open, onClose, onCarAdded }) => {
    const { mechanicStore } = useStores();
    const [isManual, setIsManual] = useState(false);

    // State for API-driven fields
    const [carMakes, setCarMakes] = useState<AutoDocMakerOption[]>([]);
    const [carModels, setCarModels] = useState<AutoDocModelOption[]>([]);
    const [carVehicles, setCarVehicles] = useState<AutoDocVehicleOption[]>([]);
    
    const [selectedMake, setSelectedMake] = useState<AutoDocMakerOption | null>(null);
    const [selectedModel, setSelectedModel] = useState<AutoDocModelOption | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<AutoDocVehicleOption | null>(null);
    
    // State for manual fields
    const [manualMake, setManualMake] = useState('');
    const [manualModel, setManualModel] = useState('');

    // Common state
    const [licensePlate, setLicensePlate] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [currentMileage, setCurrentMileage] = useState('');
    
    const [isMakesLoading, setIsMakesLoading] = useState(false);
    const [isModelsLoading, setIsModelsLoading] = useState(false);
    const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
    const [isSearchingByPlate, setIsSearchingByPlate] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && !isManual && carMakes.length === 0) {
            const loadMakes = async () => {
                setIsMakesLoading(true);
                setError(null);
                try {
                    const makes = await apiClient.fetchMakes();
                    setCarMakes(makes);
                } catch (err: any) {
                    setError(`Impossibile caricare le marche: ${err.message}`);
                } finally {
                    setIsMakesLoading(false);
                }
            };
            loadMakes();
        }
    }, [open, isManual, carMakes.length]);

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
            const models = await apiClient.fetchModels(newValue.id);
            setCarModels(models);
        } catch (err: any) {
            setError(`Impossibile caricare i modelli: ${err.message}`);
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
            const vehicles = await apiClient.fetchVehicles(newValue.id);
            setCarVehicles(vehicles);
        } catch (err: any) {
            setError(`Impossibile caricare le motorizzazioni: ${err.message}`);
        } finally {
            setIsVehiclesLoading(false);
        }
    };

    const handlePlateSearch = async () => {
        if (!licensePlate.trim()) {
            setError("Inserisci una targa da cercare.");
            return;
        }
        setIsSearchingByPlate(true);
        setError(null);
        try {
            const result = await apiClient.searchByPlate(licensePlate);
            if (result && result.tree && Array.isArray(result.tree) && result.tree.length >= 3) {
                const [makerId, modelId, vehicleId] = result.tree;

                let currentMakes = carMakes;
                if (currentMakes.length === 0) {
                    setIsMakesLoading(true);
                    currentMakes = await apiClient.fetchMakes();
                    setCarMakes(currentMakes);
                    setIsMakesLoading(false);
                }
                const foundMake = currentMakes.find(m => m.id === makerId);
                if (!foundMake) throw new Error("Marca non trovata.");
                setSelectedMake(foundMake);
                
                setIsModelsLoading(true);
                const models = await apiClient.fetchModels(makerId);
                setCarModels(models);
                const foundModel = models.find(m => m.id === modelId);
                setIsModelsLoading(false);
                if (!foundModel) throw new Error("Modello non trovato.");
                setSelectedModel(foundModel);

                setIsVehiclesLoading(true);
                const vehicles = await apiClient.fetchVehicles(modelId);
                setCarVehicles(vehicles);
                const foundVehicle = vehicles.find(v => v.id === vehicleId);
                setIsVehiclesLoading(false);
                if (!foundVehicle) throw new Error("Motorizzazione non trovata.");
                setSelectedVehicle(foundVehicle);
                
                setIsManual(false);

            } else {
                throw new Error("Targa non trovata o risposta API non valida.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Ricerca fallita: ${errorMessage}. Prova a inserire i dati manualmente.`);
        } finally {
            setIsSearchingByPlate(false);
        }
    };

    const resetForm = () => {
        setIsManual(false);
        setCarModels([]);
        setCarVehicles([]);
        setSelectedMake(null);
        setSelectedModel(null);
        setSelectedVehicle(null);
        setManualMake('');
        setManualModel('');
        setLicensePlate('');
        setSelectedYear('');
        setCurrentMileage('');
        setError(null);
        setLoading(false);
    };

    const handleClose = () => { if (!loading) { resetForm(); onClose(); } };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const carData = {
            make: isManual ? manualMake : selectedMake!.name,
            model: isManual ? manualModel : `${selectedModel!.name} ${selectedVehicle!.name}`,
            year: selectedYear,
            mileage: currentMileage,
            licensePlate,
        };

        try {
            await mechanicStore.addCarToClient(carData);
            onCarAdded();
        } catch (err: any) {
            setError(err.message || "Errore sconosciuto.");
        } finally {
            setLoading(false);
        }
    };

    const isSubmitDisabled = isManual
        ? !manualMake || !manualModel || !selectedYear || !currentMileage || loading
        : !selectedMake || !selectedModel || !selectedVehicle || !selectedYear || !currentMileage || loading;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyleSx} component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" component="h2">
                    Aggiungi Veicolo a {mechanicStore.selectedClient?.firstName} {mechanicStore.selectedClient?.lastName}
                </Typography>
                 <FormControlLabel
                    control={<Switch checked={isManual} onChange={(e) => setIsManual(e.target.checked)} />}
                    label="Inserisci manualmente"
                    sx={{ my: 1 }}
                />
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Targa"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                        fullWidth
                        inputProps={{ style: { textTransform: 'uppercase' }}}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handlePlateSearch} disabled={isSearchingByPlate || isManual} edge="end">
                                        {isSearchingByPlate ? <CircularProgress size={20} /> : <Search />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    {isManual ? (
                        <>
                            <TextField label="Marca" value={manualMake} onChange={(e) => setManualMake(e.target.value)} required fullWidth />
                            <TextField label="Modello" value={manualModel} onChange={(e) => setManualModel(e.target.value)} required fullWidth />
                        </>
                    ) : (
                        <>
                            <Autocomplete
                                options={carMakes}
                                loading={isMakesLoading}
                                value={selectedMake}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={handleMakeChange}
                                renderInput={(params) => <TextField {...params} label="Seleziona Marca" InputProps={{...params.InputProps, endAdornment: <>{isMakesLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>}} />}
                            />
                            <Autocomplete
                                disabled={!selectedMake || isModelsLoading}
                                options={carModels}
                                loading={isModelsLoading}
                                value={selectedModel}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={handleModelChange}
                                renderInput={(params) => <TextField {...params} label="Seleziona Modello" InputProps={{...params.InputProps, endAdornment: <>{isModelsLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>}} />}
                            />
                            <Autocomplete
                                disabled={!selectedModel || isVehiclesLoading}
                                options={carVehicles}
                                loading={isVehiclesLoading}
                                value={selectedVehicle}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={(_event, newValue) => setSelectedVehicle(newValue)}
                                renderInput={(params) => <TextField {...params} label="Seleziona Motorizzazione" InputProps={{...params.InputProps, endAdornment: <>{isVehiclesLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>}} />}
                            />
                        </>
                    )}
                    <TextField label="Anno" type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} required fullWidth />
                    <TextField label="Chilometraggio (km)" type="number" value={currentMileage} onChange={(e) => setCurrentMileage(e.target.value)} required fullWidth />
                    
                    {error && <Alert severity="error">{error}</Alert>}

                    <Button type="submit" variant="contained" disabled={isSubmitDisabled} sx={{ mt: 2 }}>
                        {loading ? <CircularProgress size={24} /> : 'Aggiungi Veicolo'}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
});

export default AddCarToClientModal;