import { GoogleGenAI, Type } from '@google/genai';
import {
    MaintenanceRecord,
    Car,
    AnnualCostEstimate,
    ResourceLinks,
    User,
    Client,
    Quote,
    Invoice,
    MechanicDashboardStats,
    InventoryItem,
    AutoDocMakerOption,
    AutoDocMakersResponse,
    AutoDocModelOption,
    AutoDocModelsResponse,
    AutoDocVehicleOption,
    AutoDocVehiclesResponse,
} from './types.ts';

// Safely access the API key. If `import.meta.env` is undefined or the key is missing,
// geminiApiKey will be undefined.
const geminiApiKey = import.meta.env?.VITE_GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

if (!geminiApiKey) {
    console.warn("VITE_GEMINI_API_KEY non è definita. Le funzionalità AI non saranno disponibili.");
}

class ApiClient {
    private token: string | null = null;
    // Use the requested fallback URL and safe access.
    private baseUrl: string = import.meta.env?.VITE_API_BASE_URL || 'https://mygarage.tnl.one/api/v1';

    setToken(token: string | null) {
        this.token = token;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'An API error occurred');
        }

        return response.json();
    }

    // --- Auth ---
    async login(email: string, password: string): Promise<{ token: string; user: User }> {
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

    // --- Mechanic ---
    async getDashboardStats(): Promise<MechanicDashboardStats> {
        return this.request('/mechanic/stats');
    }
    
    async getClients(): Promise<Client[]> {
        return this.request('/mechanic/clients');
    }

    async getClientById(id: number): Promise<Client> {
        return this.request(`/mechanic/clients/${id}`);
    }

    async createClient(clientData: Partial<Client> & { password?: string }): Promise<Client> {
        return this.request('/mechanic/clients', {
            method: 'POST',
            body: JSON.stringify(clientData),
        });
    }

    async addCarToClient(clientId: number, carData: any): Promise<Car> {
        return this.request(`/mechanic/clients/${clientId}/cars`, {
            method: 'POST',
            body: JSON.stringify(carData),
        });
    }
    
    async addMaintenanceRecord(carId: string, record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
        return this.request(`/mechanic/cars/${carId}/maintenance`, {
            method: 'POST',
            body: JSON.stringify(record),
        });
    }
    
    async deleteMaintenanceRecord(recordId: string): Promise<void> {
        return this.request(`/mechanic/maintenance/${recordId}`, {
            method: 'DELETE',
        });
    }

    async getQuotes(): Promise<Quote[]> {
        return this.request('/mechanic/quotes');
    }

    async createQuote(quoteData: Partial<Quote>): Promise<Quote> {
        return this.request('/mechanic/quotes', {
            method: 'POST',
            body: JSON.stringify(quoteData),
        });
    }

    async deleteQuote(quoteId: number): Promise<void> {
        await this.request(`/mechanic/quotes/${quoteId}`, {
            method: 'DELETE',
        });
    }

    async getInvoices(): Promise<Invoice[]> {
        return this.request('/mechanic/invoices');
    }

    async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
        return this.request('/mechanic/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData),
        });
    }

    async deleteInvoice(invoiceId: number): Promise<void> {
        await this.request(`/mechanic/invoices/${invoiceId}`, {
            method: 'DELETE',
        });
    }
    
    async getInventory(): Promise<InventoryItem[]> {
        return this.request('/mechanic/inventory');
    }

    async addInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
        return this.request('/mechanic/inventory', {
            method: 'POST',
            body: JSON.stringify(item),
        });
    }

    async updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem> {
        return this.request(`/mechanic/inventory/${id}`, {
            method: 'PUT',
            body: JSON.stringify(item),
        });
    }

    async deleteInventoryItem(id: number): Promise<void> {
        return this.request(`/mechanic/inventory/${id}`, {
            method: 'DELETE',
        });
    }

    // --- Vehicle Data (from backend proxy) ---
    async fetchMakes(): Promise<AutoDocMakerOption[]> {
       return this.request('/vehicles/makes');
    }
    async fetchModels(makerId: number): Promise<AutoDocModelOption[]> {
        return this.request(`/vehicles/models/${makerId}`);
    }
    async fetchVehicles(modelId: number): Promise<AutoDocVehicleOption[]> {
        return this.request(`/vehicles/vehicles/${modelId}`);
    }
}

export const apiClient = new ApiClient();

// --- Gemini API Service ---
// Note: This part is kept separate to be used in anonymous mode without authentication.
export const geminiApi = {
    async fetchMaintenanceSchedule(make: string, model: string, year: number, currentMileage: number): Promise<MaintenanceRecord[]> {
        if (!ai) throw new Error("Le funzionalità AI non sono disponibili: la chiave API non è configurata.");
        
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
            contents: [{ parts: [{ text: prompt }] }],
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
    },
    async fetchMaintenanceSimulation(car: Car, targetMileage: number): Promise<{ records: MaintenanceRecord[], annualCosts: AnnualCostEstimate }> {
        if (!ai) throw new Error("Le funzionalità AI non sono disponibili: la chiave API non è configurata.");
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
            contents: [{ parts: [{ text: prompt }] }],
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
        if (!ai) throw new Error("Le funzionalità AI non sono disponibili: la chiave API non è configurata.");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: `Find resources for this maintenance task: "${record.description}" on a ${car.year} ${car.make} ${car.model}. Provide a YouTube tutorial link and a link to buy parts (e.g., from AutoDoc or a similar site). Respond as a JSON object with keys "youtube" and "parts_link".` }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        youtube: { type: Type.STRING },
                        parts_link: { type: Type.STRING }
                    },
                    required: ['youtube', 'parts_link']
                }
            }
        });
        return JSON.parse(response.text.trim());
    }
};