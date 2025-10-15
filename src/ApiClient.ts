import { GoogleGenAI, Type } from '@google/genai';
import {
    MaintenanceRecord,
    ResourceLinks,
    Car,
    AutoDocMakerOption,
    AutoDocMakersResponse,
    AutoDocModelOption,
    AutoDocModelsResponse,
    AutoDocVehicleOption,
    AutoDocVehiclesResponse,
    AnnualCostEstimate,
    Client
} from './types.ts';

// --- Gemini AI Setup ---
// Inizializzazione condizionale per prevenire crash se la chiave API manca.
let ai: GoogleGenAI | null = null;
const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;

if (apiKey) {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Impossibile inizializzare GoogleGenAI. Le funzionalità IA useranno i dati di fallback.", e);
    }
} else {
    console.warn("VITE_GEMINI_API_KEY non è impostata. Le funzionalità IA useranno i dati di fallback.");
}

// --- Funzioni di Fallback ---

const getGenericMaintenanceSchedule = (currentMileage: number): MaintenanceRecord[] => {
    console.log("Nessuna API key trovata o errore API. Uso il piano di manutenzione generico.");
    const genericSchedule = [
        { description: 'Cambio olio e filtro', interval: 15000 },
        { description: 'Controllo pastiglie freni', interval: 30000 },
        { description: 'Sostituzione filtro aria', interval: 40000 },
        { description: 'Controllo e rotazione pneumatici', interval: 10000 },
    ];

    return genericSchedule.map(item => {
        // Calcola il prossimo chilometraggio per l'intervento.
        const nextMileage = (Math.floor(currentMileage / item.interval) + 1) * item.interval;
        return {
            id: crypto.randomUUID(),
            date: 'N/A',
            mileage: nextMileage,
            description: item.description,
            cost: 0,
            isRecommendation: true,
        };
    });
};

const getGenericSimulation = (car: Car, targetMileage: number): { records: MaintenanceRecord[], annualCosts: AnnualCostEstimate } => {
    console.log("Nessuna API key trovata o errore API. Uso la simulazione generica.");
    const currentMileage = car.maintenance.length > 0 ? Math.max(...car.maintenance.map(m => m.mileage)) : 0;

    const genericInterventions = [
        { description: 'Cambio olio e filtro', interval: 15000, cost: 150, diy: 70 },
        { description: 'Sostituzione pastiglie freni anteriori', interval: 60000, cost: 250, diy: 100 },
        { description: 'Sostituzione filtro aria', interval: 40000, cost: 80, diy: 30 },
        { description: 'Sostituzione set completo pneumatici', interval: 80000, cost: 500, diy: 400 },
        { description: 'Sostituzione cinghia di distribuzione', interval: 120000, cost: 700, diy: 300 },
    ];
    
    const records: MaintenanceRecord[] = [];
    genericInterventions.forEach(item => {
        let nextMileage = (Math.floor(currentMileage / item.interval) + 1) * item.interval;
        while (nextMileage <= targetMileage) {
            records.push({
                id: crypto.randomUUID(),
                date: 'Previsto',
                description: item.description,
                mileage: nextMileage,
                cost: item.cost,
                diyCost: item.diy,
            });
            nextMileage += item.interval;
        }
    });

    const annualCosts: AnnualCostEstimate = {
        insuranceRange: [300, 800],
        roadTaxRange: [150, 400],
    };

    return { records, annualCosts };
};


// --- Main API Client for Backend ---
class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor() {
        this.baseUrl = import.meta.env?.VITE_API_BASE_URL || '/api/v1';
    }

    setToken(token: string | null) {
        this.token = token;
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = new Headers(options.headers || {});
        headers.append('Content-Type', 'application/json');

        if (this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || 'An unknown API error occurred');
            }
            if (response.status === 204) {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${error}`);
            throw error;
        }
    }

    // --- Auth ---
    async login(email: string, password: string): Promise<any> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(email: string, password: string, role: 'personal' | 'mechanic'): Promise<any> {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, role }),
        });
    }

    // --- Personal User ---
    async getMyCars(): Promise<Car[]> {
        return this.request('/client/cars');
    }
    
    // ... Altri metodi per l'utente personale (addCar, addMaintenance, etc.)

    // --- Mechanic ---
    async getMyClients(): Promise<Client[]> {
        return this.request('/mechanic/clients');
    }

    async createClient(clientData: { 
        firstName: string; 
        lastName: string; 
        phone?: string; 
        email?: string; 
        password?: string 
    }): Promise<any> {
        return this.request('/mechanic/clients', {
            method: 'POST',
            body: JSON.stringify(clientData),
        });
    }
    // ... Altri metodi per il meccanico
}

export const apiClient = new ApiClient();


// --- External and Gemini APIs (kept separate for clarity) ---

const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
    timestamp: number;
    data: T;
}

const cache = {
    get: <T>(key: string): T | null => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        try {
            const item: CacheItem<T> = JSON.parse(itemStr);
            if (new Date().getTime() - item.timestamp > CACHE_DURATION) {
                localStorage.removeItem(key);
                return null;
            }
            return item.data;
        } catch (e) {
            localStorage.removeItem(key);
            return null;
        }
    },
    set: <T>(key: string, value: T): void => {
        try {
            const item: CacheItem<T> = { timestamp: new Date().getTime(), data: value };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            console.error(`Failed to set cache for key ${key}`, e);
        }
    }
};

export const externalApi = {
    async fetchMakes(): Promise<AutoDocMakerOption[]> {
        const cacheKey = 'autodoc-makes';
        const cachedMakes = cache.get<AutoDocMakerOption[]>(cacheKey);
        if (cachedMakes) return cachedMakes;

        const targetUrl = 'https://www.auto-doc.it/ajax/selector/vehicle';
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data: AutoDocMakersResponse = await response.json();
        
        const allMakes = data.makers.flatMap(group => group.options);
        const uniqueMakesMap = new Map<string, AutoDocMakerOption>();
        allMakes.forEach(make => {
            if (!uniqueMakesMap.has(make.name)) uniqueMakesMap.set(make.name, make);
        });
        const sortedMakes = [...uniqueMakesMap.values()].sort((a, b) => a.name.localeCompare(b.name));
        cache.set(cacheKey, sortedMakes);
        return sortedMakes;
    },
    async fetchModels(makerId: number): Promise<AutoDocModelOption[]> {
        const cacheKey = `autodoc-models-${makerId}`;
        const cachedModels = cache.get<AutoDocModelOption[]>(cacheKey);
        if (cachedModels) return cachedModels;

        const targetUrl = `https://www.auto-doc.it/ajax/selector/vehicle?maker=${makerId}&action=models`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Network response was not ok for fetching models');
        const data: AutoDocModelsResponse = await response.json();
        const sortedModels = data.models.flatMap(group => group.options).sort((a, b) => a.name.localeCompare(b.name));
        cache.set(cacheKey, sortedModels);
        return sortedModels;
    },
    async fetchVehicles(modelId: number): Promise<AutoDocVehicleOption[]> {
        const cacheKey = `autodoc-vehicles-${modelId}`;
        const cachedVehicles = cache.get<AutoDocVehicleOption[]>(cacheKey);
        if (cachedVehicles) return cachedVehicles;

        const targetUrl = `https://www.auto-doc.it/ajax/selector/vehicle?model=${modelId}&action=vehicles`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Network response was not ok for fetching vehicles');
        const data: AutoDocVehiclesResponse = await response.json();
        const sortedVehicles = data.vehicles.flatMap(group => group.options).sort((a, b) => a.name.localeCompare(b.name));
        cache.set(cacheKey, sortedVehicles);
        return sortedVehicles;
    },
};

export const geminiApi = {
    async fetchMaintenanceSchedule(make: string, model: string, year: number, currentMileage: number): Promise<MaintenanceRecord[]> {
        if (!ai) {
            return getGenericMaintenanceSchedule(currentMileage);
        }
        try {
            const prompt = `Genera in italiano una lista base di 3-5 interventi di manutenzione chiave per una ${year} ${make} ${model} con un chilometraggio attuale di ${currentMileage} km.
Per ogni intervento, suggerisci il PROSSIMO chilometraggio a cui effettuarlo.
Rispondi solo con un array JSON di oggetti. Ogni oggetto deve avere:
- "description": una stringa con la descrizione dell'intervento (es. "Cambio olio e filtro").
- "mileage": un numero che rappresenta il chilometraggio a cui è consigliato il prossimo intervento.
Assicurati che il chilometraggio suggerito per ogni intervento sia superiore a quello attuale (${currentMileage} km).
Non includere interventi il cui chilometraggio è inferiore o uguale a quello attuale.
Il JSON deve essere formattato correttamente.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                mileage: { type: Type.NUMBER }
                            },
                            required: ["description", "mileage"]
                        }
                    }
                }
            });
            const schedule = JSON.parse(response.text.trim());
            return schedule.map((item: any) => ({ ...item, id: crypto.randomUUID(), date: 'N/A', cost: 0, isRecommendation: true })) as MaintenanceRecord[];
        } catch (error) {
            console.error("Chiamata API Gemini per il piano di manutenzione fallita. Uso il fallback.", error);
            return getGenericMaintenanceSchedule(currentMileage);
        }
    },
    async fetchMaintenanceSimulation(car: Car, targetMileage: number): Promise<{ records: MaintenanceRecord[], annualCosts: AnnualCostEstimate }> {
        if (!ai) {
            return getGenericSimulation(car, targetMileage);
        }
        try {
            const currentMileage = car.maintenance.length > 0 ? Math.max(...car.maintenance.map(m => m.mileage)) : 0;
            
            const prompt = `Genera in italiano una simulazione dei costi di manutenzione per una ${car.year} ${car.make} ${car.model}.
Il chilometraggio attuale è ${currentMileage} km e la simulazione deve arrivare fino a ${targetMileage} km.

Rispondi solo con un oggetto JSON che abbia la seguente struttura:
1.  Una chiave "interventi": un array di oggetti per la manutenzione ordinaria prevista nell'intervallo (tra ${currentMileage} km e ${targetMileage} km). Ogni oggetto deve avere:
    - "description": stringa con la descrizione dell'intervento (es. "Sostituzione pastiglie freni anteriori").
    - "mileage": numero che rappresenta il chilometraggio a cui è previsto l'intervento.
    - "costoTotaleStimato": numero che rappresenta il costo totale stimato in EUR (manodopera inclusa).
    - "costoPartiFaidate": numero che rappresenta il costo stimato in EUR per i soli pezzi di ricambio (per il fai-da-te).
2.  Una chiave "costiAnnali": un oggetto contenente una stima dei costi annuali ricorrenti. Deve avere:
    - "assicurazione": un array con due numeri [costo_minimo, costo_massimo] per la polizza assicurativa annuale.
    - "bollo": un array con due numeri [costo_minimo, costo_massimo] per la tassa di circolazione annuale (bollo).

Se non ci sono interventi di manutenzione previsti, la chiave "interventi" deve contenere un array vuoto.
Il JSON deve essere formattato correttamente.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            interventi: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING },
                                        mileage: { type: Type.NUMBER },
                                        costoTotaleStimato: { type: Type.NUMBER },
                                        costoPartiFaidate: { type: Type.NUMBER }
                                    },
                                    required: ["description", "mileage", "costoTotaleStimato", "costoPartiFaidate"]
                                }
                            },
                            costiAnnali: {
                                type: Type.OBJECT,
                                properties: {
                                    assicurazione: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                                    bollo: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                                },
                                required: ["assicurazione", "bollo"]
                            }
                        },
                        required: ["interventi", "costiAnnali"]
                    }
                }
            });
            const simulationData = JSON.parse(response.text.trim());

            const records: MaintenanceRecord[] = simulationData.interventi.map((item: any) => ({
                id: crypto.randomUUID(),
                date: 'Previsto',
                description: item.description,
                mileage: item.mileage,
                cost: item.costoTotaleStimato,
                diyCost: item.costoPartiFaidate,
            }));

            const annualCosts: AnnualCostEstimate = {
                insuranceRange: simulationData.costiAnnali.assicurazione,
                roadTaxRange: simulationData.costiAnnali.bollo
            };
        
            return { records, annualCosts };
        } catch (error) {
            console.error("Chiamata API Gemini per la simulazione fallita. Uso il fallback.", error);
            return getGenericSimulation(car, targetMileage);
        }
    },
    async fetchResources(car: Car, record: MaintenanceRecord): Promise<ResourceLinks> {
        if (!ai) {
            console.warn("API Gemini non inizializzata. Salto il recupero delle risorse.");
            return {};
        }
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Find resources for this maintenance task: "${record.description}" on a ${car.year} ${car.make} ${car.model}. Provide a YouTube tutorial link and a link to buy parts (e.g., from AutoDoc or a similar site). Respond as a JSON object with keys "youtube" and "parts_link".`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            youtube: { type: Type.STRING },
                            parts_link: { type: Type.STRING }
                        }
                    }
                }
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Chiamata API Gemini per le risorse fallita. Ritorno un oggetto vuoto.", error);
            return {};
        }
    }
};