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
    AnnualCostEstimate
} from './types.ts';

const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is not defined for legacy api.ts. AI features will not work.");
}

// --- Caching Layer ---
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore in millisecondi

interface CacheItem<T> {
    timestamp: number;
    data: T;
}

const cache = {
    get: <T>(key: string): T | null => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }
        try {
            const item: CacheItem<T> = JSON.parse(itemStr);
            const now = new Date().getTime();
            if (now - item.timestamp > CACHE_DURATION) {
                // Cache scaduta
                localStorage.removeItem(key);
                return null;
            }
            return item.data;
        } catch (e) {
            console.error(`Errore nel parsing della cache per la chiave ${key}`, e);
            // Cache corrotta, rimuovila
            localStorage.removeItem(key);
            return null;
        }
    },
    set: <T>(key: string, value: T): void => {
        try {
            const item: CacheItem<T> = {
                timestamp: new Date().getTime(),
                data: value
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            console.error(`Impossibile impostare la cache per la chiave ${key}`, e);
        }
    }
};


// --- API Service ---
export const externalApi = {
    async fetchMakes(): Promise<AutoDocMakerOption[]> {
        const cacheKey = 'autodoc-makes';
        const cachedMakes = cache.get<AutoDocMakerOption[]>(cacheKey);
        if (cachedMakes) {
            return cachedMakes;
        }

        const targetUrl = 'https://www.auto-doc.it/ajax/selector/vehicle';
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data: AutoDocMakersResponse = await response.json();
        
        const allMakes = data.makers.flatMap(group => group.options);

        const uniqueMakesMap = new Map<string, AutoDocMakerOption>();
        allMakes.forEach(make => {
            if (!uniqueMakesMap.has(make.name)) {
                uniqueMakesMap.set(make.name, make);
            }
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
        const allModels = data.models.flatMap(group => group.options);
        const sortedModels = allModels.sort((a, b) => a.name.localeCompare(b.name));

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
        const allVehicles = data.vehicles.flatMap(group => group.options);
        const sortedVehicles = allVehicles.sort((a, b) => a.name.localeCompare(b.name));

        cache.set(cacheKey, sortedVehicles);
        return sortedVehicles;
    },
};

// --- Gemini API Service ---
export const geminiApi = {
    async fetchMaintenanceSchedule(make: string, model: string, year: number, currentMileage: number): Promise<MaintenanceRecord[]> {
        if (!ai) throw new Error("Gemini AI not available: API key not configured.");
        
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
        return schedule.map(item => ({ ...item, id: crypto.randomUUID(), date: 'N/A', cost: 0, isRecommendation: true })) as MaintenanceRecord[];
    },
    async fetchMaintenanceSimulation(car: Car, targetMileage: number): Promise<{ records: MaintenanceRecord[], annualCosts: AnnualCostEstimate }> {
        if (!ai) throw new Error("Gemini AI not available: API key not configured.");
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
    },
    async fetchResources(car: Car, record: MaintenanceRecord): Promise<ResourceLinks> {
        if (!ai) throw new Error("Gemini AI not available: API key not configured.");
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
    }
};