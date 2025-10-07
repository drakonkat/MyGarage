import React from 'react';
import {
    Modal,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
    Chip,
    Stack,
    Button,
} from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { modalStyle } from '../theme.ts';
import { SimulationResultData } from '../types.ts';

interface SimulationResultModalProps {
    open: boolean;
    onClose: () => void;
    result: SimulationResultData | null;
    onAddCar: (result: SimulationResultData) => void;
}

const SimulationResultModal: React.FC<SimulationResultModalProps> = ({ open, onClose, result, onAddCar }) => {
    if (!result) {
        return null;
    }

    const { car, records, annualCosts, targetMileage } = result;
    const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
    const totalDiyCost = records.reduce((sum, record) => sum + (record.diyCost || 0), 0);
    
    const handleAddCarClick = () => {
        onAddCar(result);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ ...modalStyle, width: 600, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 2, mr: -2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Risultati Simulazione
                    </Typography>
                    <Typography variant="subtitle1">
                        Veicolo: <strong>{car.year} {car.make} {car.model}</strong>
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        Simulazione fino a: <strong>{targetMileage.toLocaleString()} km</strong>
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                        <Paper elevation={3} sx={{ p: 2, flex: 1, bgcolor: 'secondary.main', color: 'secondary.contrastText', textAlign: 'center' }}>
                            <Typography variant="subtitle2">Costo Totale Stimato (con manodopera)</Typography>
                            <Typography variant="h5">€{totalCost.toFixed(2)}</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ p: 2, flex: 1, bgcolor: 'primary.main', color: 'primary.contrastText', textAlign: 'center' }}>
                            <Typography variant="subtitle2">Costo Stimato Fai-da-te (solo parti)</Typography>
                            <Typography variant="h5">€{totalDiyCost.toFixed(2)}</Typography>
                        </Paper>
                    </Stack>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                        Interventi Previsti
                    </Typography>
                    <List sx={{ maxHeight: '25vh', overflowY: 'auto' }}>
                        {records.length > 0 ? (
                            records
                            .sort((a,b) => a.mileage - b.mileage)
                            .map((record, index) => (
                                <React.Fragment key={record.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={record.description}
                                            secondary={`Previsto a circa ${record.mileage.toLocaleString()} km`}
                                        />
                                        <Stack direction="column" spacing={0.5} alignItems="flex-end">
                                            <Chip label={`Totale: €${record.cost.toFixed(2)}`} color="secondary" size="small" />
                                            {record.diyCost !== undefined && (
                                                <Chip label={`Fai-da-te: €${record.diyCost.toFixed(2)}`} color="primary" size="small" variant="outlined" />
                                            )}
                                        </Stack>
                                    </ListItem>
                                    {index < records.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="Nessun intervento di manutenzione ordinaria previsto nell'intervallo di chilometraggio specificato." />
                            </ListItem>
                        )}
                    </List>
                    
                    <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="h6" gutterBottom>Costi Annuali Ricorrenti (Stima)</Typography>
                        {annualCosts.insuranceRange && <Typography variant="body1">
                            <strong>Assicurazione:</strong> €{annualCosts.insuranceRange[0]} - €{annualCosts.insuranceRange[1]} all'anno
                        </Typography>}
                        {annualCosts.roadTaxRange && <Typography variant="body1">
                            <strong>Bollo Auto:</strong> €{annualCosts.roadTaxRange[0]} - €{annualCosts.roadTaxRange[1]} all'anno
                        </Typography>}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1}}>
                            *Questi costi sono stime indicative e possono variare notevolmente in base a fattori come la località, la classe di merito e le normative vigenti.
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ pt: 2, mt: 2, borderTop: 1, borderColor: 'divider' }}>
                     <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleOutline />}
                        onClick={handleAddCarClick}
                        fullWidth
                    >
                        Aggiungi al mio garage
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default SimulationResultModal;