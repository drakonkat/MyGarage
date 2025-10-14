import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Autocomplete,
    CircularProgress,
    FormControlLabel,
    Switch,
    Stack
} from '@mui/material';
import { modalStyle } from '../theme.ts';
import { AutoDocMakerOption, AutoDocModelOption, AutoDocVehicleOption } from '../types.ts';
import { externalApi } from '../ApiClient.ts';

interface AddCarModalProps {
    open: boolean;
    onClose: () => void;
    onAddCar: (carData: { make: string; model: string; year: string; mileage: string }) => void;
    setError: (message: string | null) => void;
}

const AddCarModal: React.FC<AddCarModalProps> = ({ open, onClose, onAddCar, setError }) => {
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
    const [selectedYear, setSelectedYear] = useState('');
    const [currentMileage, setCurrentMileage] = useState('');
    
    const [isMakesLoading, setIsMakesLoading] = useState(false);
    const [isModelsLoading, setIsModelsLoading] = useState(false);
    const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && !isManual && carMakes.length === 0) {
            const loadMakes = async () => {
                setIsMakesLoading(true);
                setError(null);
                try {
                    const makes = await externalApi.fetchMakes();
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
    }, [open, isManual, setError, carMakes.length]);
    
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
            const models = await externalApi.fetchModels(newValue.id);
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
            const vehicles = await externalApi.fetchVehicles(newValue.id);
            setCarVehicles(vehicles);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Impossibile caricare le motorizzazioni per ${newValue.name}: ${errorMessage}`);
        } finally {
            setIsVehiclesLoading(false);
        }
    };

    const resetForm = () => {
        setIsManual(false);
        setCarMakes([]);
        setCarModels([]);
        setCarVehicles([]);
        setSelectedMake(null);
        setSelectedModel(null);
        setSelectedVehicle(null);
        setManualMake('');
        setManualModel('');
        setSelectedYear('');
        setCurrentMileage('');
        setError(null);
    }

    const handleClose = () => {
        resetForm();
        onClose();
    }

    const handleSubmit = async () => {
        const carData = {
            make: isManual ? manualMake : selectedMake!.name,
            model: isManual ? manualModel : `${selectedModel!.name} ${selectedVehicle!.name}`,
            year: selectedYear,
            mileage: currentMileage,
        };
        setIsSubmitting(true);
        await onAddCar(carData);
        setIsSubmitting(false);
        handleClose();
    };

    const isSubmitDisabled = isManual
        ? !manualMake || !manualModel || !selectedYear || !currentMileage || isSubmitting
        : !selectedMake || !selectedModel || !selectedVehicle || !selectedYear || !currentMileage || isSubmitting;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2">Aggiungi una Nuova Auto</Typography>
                
                <FormControlLabel
                    control={<Switch checked={isManual} onChange={(e) => setIsManual(e.target.checked)} />}
                    label="Inserisci manualmente"
                    sx={{ mb: 1 }}
                />

                <Stack spacing={2} sx={{mt: 1}}>
                    {isManual ? (
                        <>
                            <TextField 
                                label="Marca (es. DeLorean)" 
                                value={manualMake}
                                onChange={(e) => setManualMake(e.target.value)}
                                fullWidth
                            />
                            <TextField 
                                label="Modello (es. DMC-12)" 
                                value={manualModel}
                                onChange={(e) => setManualModel(e.target.value)}
                                fullWidth
                            />
                        </>
                    ) : (
                        <>
                            <Autocomplete
                                options={carMakes}
                                loading={isMakesLoading}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={handleMakeChange}
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
                                disabled={!selectedMake || isModelsLoading}
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
                                disabled={!selectedModel || isVehiclesLoading}
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
                        </>
                    )}
                    
                    <TextField
                        label="Anno"
                        type="number"
                        fullWidth
                        required
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    />
                     <TextField
                        label="Chilometraggio attuale (km)"
                        type="number"
                        fullWidth
                        required
                        value={currentMileage}
                        onChange={(e) => setCurrentMileage(e.target.value)}
                    />
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ mt: 2 }}
                        disabled={isSubmitDisabled}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : "Aggiungi Auto"}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default AddCarModal;