import React, { Fragment, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    IconButton,
    ListItemIcon,
} from '@mui/material';
import { AddCircle, YouTube, ShoppingCart, ExpandMore, Delete, AttachMoney } from '@mui/icons-material';
import { Car, MaintenanceRecord, ResourceLinks, AnnualReminder } from '../types.ts';
import { geminiApi } from '../api.ts';

interface CarDetailProps {
    car: Car;
    onBack: () => void;
    onLogMaintenanceForTask: (description?: string) => void;
    onAddIssueClick: () => void;
    onToggleIssue: (issueId: string) => void;
    onDeleteIssue: (issueId: string) => void;
    onAddReminderClick: () => void;
    onPayReminder: (reminderId: string, amount: number) => void;
    onDeleteReminder: (reminderId: string) => void;
    onDeleteRecommendation: (recordId: string) => void;
}

const CarDetail: React.FC<CarDetailProps> = ({ 
    car, onBack, onLogMaintenanceForTask, 
    onAddIssueClick, onToggleIssue, onDeleteIssue,
    onAddReminderClick, onPayReminder, onDeleteReminder,
    onDeleteRecommendation
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resourceLinks, setResourceLinks] = useState<ResourceLinks | null>(null);
    const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
    const [expandedReminder, setExpandedReminder] = useState<string | false>(false);

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedReminder(isExpanded ? panel : false);
    };

    const fetchAndSetResources = async (record: MaintenanceRecord) => {
        setLoading(true);
        setError(null);
        setResourceLinks(null);
        setActiveRecordId(record.id);
        try {
            const links = await geminiApi.fetchResources(car, record);
            setResourceLinks(links);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Impossibile recuperare le risorse da Gemini: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };
    
    // FIX: The errors on lines 104 and 105 ("Property 'find' does not exist on type 'unknown'")
    // are caused by TypeScript inferring the `records` variable as `unknown[]`.
    // This happens because the initial value of this `reduce` is an empty object `{}`,
    // so we cast it to the correct type `Record<string, MaintenanceRecord[]>` to ensure
    // type safety downstream.
    const maintenanceGroups = (car.maintenance || []).reduce((acc, record) => {
        const key = record.description;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(record);
        return acc;
    }, {} as Record<string, MaintenanceRecord[]>);


    return (
        <Box sx={{ mt: 3 }}>
            <Button onClick={() => { onBack(); setResourceLinks(null); }}>
                &larr; Torna alla Dashboard
            </Button>
            <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                {car.year} {car.make} {car.model}
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => onLogMaintenanceForTask()}
                sx={{ mb: 2 }}
            >
                Aggiungi Intervento Manuale
            </Button>

            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
            
            {resourceLinks && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography>Risorse per: <strong>{car.maintenance.find(r => r.id === activeRecordId)?.description}</strong></Typography>
                    {resourceLinks.youtube && <Button href={resourceLinks.youtube} target="_blank" startIcon={<YouTube />}>Guarda Tutorial</Button>}
                    {resourceLinks.parts_link && <Button href={resourceLinks.parts_link} target="_blank" startIcon={<ShoppingCart />}>Compra Ricambi</Button>}
                </Alert>
            )}

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Scadenze Annuali
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<AddCircle />}
                    onClick={onAddReminderClick}
                    sx={{ mb: 2 }}
                >
                    Aggiungi Scadenza
                </Button>
                <List>
                    {(car.annualReminders || []).length === 0 && <ListItem><ListItemText primary="Nessuna scadenza annuale registrata." /></ListItem>}
                    {(car.annualReminders || [])
                        .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
                        .map(reminder => {
                            const isOverdue = new Date(reminder.nextDueDate) < new Date();
                            return (
                                <Card key={reminder.id} sx={{ mb: 2, bgcolor: 'background.paper' }}>
                                    <ListItem
                                        secondaryAction={
                                            <>
                                                <IconButton edge="end" aria-label="pay" onClick={() => onPayReminder(reminder.id, reminder.amount)} title="Segna come pagato e sposta al prossimo anno">
                                                    <AttachMoney color="success" />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="delete" onClick={() => onDeleteReminder(reminder.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </>
                                        }
                                    >
                                        <ListItemText 
                                            primary={reminder.description} 
                                            secondary={`Prossima scadenza: ${new Date(reminder.nextDueDate).toLocaleDateString()} - Importo: €${reminder.amount.toFixed(2)}`}
                                            sx={{ color: isOverdue ? 'error.main' : 'text.primary' }}
                                        />
                                    </ListItem>
                                    {(reminder.paymentHistory || []).length > 0 && (
                                        <Accordion
                                            expanded={expandedReminder === reminder.id}
                                            onChange={handleAccordionChange(reminder.id)}
                                            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                                        >
                                            <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: '32px', '.MuiAccordionSummary-content': { margin: '8px 0' } }}>
                                                <Typography variant="body2" color="text.secondary">Cronologia Pagamenti</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <List dense>
                                                    {(reminder.paymentHistory)
                                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                        .map((payment, index) => (
                                                        <ListItem key={index}>
                                                            <ListItemText primary={`Pagato il ${new Date(payment.date).toLocaleDateString()}`} secondary={`Importo: €${payment.amount.toFixed(2)}`} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </AccordionDetails>
                                        </Accordion>
                                    )}
                                </Card>
                            );
                    })}
                </List>
            </Box>

             <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Problemi Conosciuti
                </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: '70ch' }}>
                    Annota qui problemi specifici del tuo veicolo, come un rumore anomalo o un difetto noto, per tenerli monitorati.
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<AddCircle />}
                    onClick={onAddIssueClick}
                    sx={{ mb: 2 }}
                >
                    Aggiungi Problema
                </Button>
                <List>
                    {(car.knownIssues || []).length === 0 && <ListItem><ListItemText primary="Nessun problema conosciuto registrato." /></ListItem>}
                    {(car.knownIssues || []).map(issue => (
                        <ListItem
                            key={issue.id}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => onDeleteIssue(issue.id)}>
                                    <Delete />
                                </IconButton>
                            }
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={issue.isResolved}
                                    tabIndex={-1}
                                    disableRipple
                                    onChange={() => onToggleIssue(issue.id)}
                                />
                            </ListItemIcon>
                            <ListItemText 
                                primary={issue.description} 
                                secondary={`Aggiunto il: ${issue.dateAdded}`}
                                sx={{ textDecoration: issue.isResolved ? 'line-through' : 'none', color: issue.isResolved ? 'text.secondary' : 'text.primary' }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Piano di Manutenzione e Cronologia
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: '70ch' }}>
                    Questa è una lista di interventi di manutenzione suggeriti dall'IA o aggiunti da te. Puoi registrare quando li completi o rimuovere i suggerimenti se non sono pertinenti.
                </Typography>
                
                {Object.entries(maintenanceGroups).map(([description, records]) => {
                    if (description === 'Veicolo aggiunto al sistema') return null;

                    const recommendation = records.find(r => r.isRecommendation);
                    const history = records.filter(r => !r.isRecommendation).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    return (
                        <Card key={description} sx={{ mb: 2, bgcolor: 'background.paper' }}>
                            <CardContent>
                                <Typography variant="h6">{description}</Typography>
                                {recommendation && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography color="primary.light" sx={{ fontStyle: 'italic' }}>
                                            Prossimo intervento consigliato a: {recommendation.mileage.toLocaleString()} km
                                        </Typography>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => onDeleteRecommendation(recommendation.id)}
                                            title="Rimuovi suggerimento"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}

                                {history.length > 0 && (
                                    <Accordion sx={{ mt: 2, '&:before': { display: 'none' }, boxShadow: 'none', backgroundImage: 'none', bgcolor: 'transparent' }}>
                                        <AccordionSummary expandIcon={<ExpandMore />} sx={{p: 0}}>
                                            <Typography>Mostra cronologia ({history.length} interventi)</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ p: 0 }}>
                                            <List dense>
                                                {history.map(rec => (
                                                    <Fragment key={rec.id}>
                                                        <ListItem>
                                                            <ListItemText
                                                                primary={`${rec.date} a ${rec.mileage.toLocaleString()} km`}
                                                                secondary={`Costo: €${rec.cost.toFixed(2)} ${rec.notes ? ' - ' + rec.notes : ''}`}
                                                            />
                                                        </ListItem>
                                                         <Divider component="li" />
                                                    </Fragment>
                                                ))}
                                            </List>
                                        </AccordionDetails>
                                    </Accordion>
                                )}
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => onLogMaintenanceForTask(description)}>Registra Intervento Completato</Button>
                                {loading && activeRecordId === records[0].id ? 
                                    <CircularProgress size={24} sx={{ml: 1}}/> :
                                    <Button size="small" onClick={() => fetchAndSetResources({ ...records[0], description })}>Trova Risorse</Button>
                                }
                            </CardActions>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
};

export default CarDetail;