import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './RootStore.ts';
import { apiClient } from '../ApiClient.ts';
import { Client, Quote, Invoice, InventoryItem, Car, MechanicDashboardStats, MaintenanceRecord } from '../types.ts';

export class MechanicStore {
    rootStore: RootStore;

    // State properties
    clients: Client[] = [];
    quotes: Quote[] = [];
    invoices: Invoice[] = [];
    inventory: InventoryItem[] = [];
    dashboardStats: MechanicDashboardStats = {
        clientCount: 0,
        totalRevenue: 0,
        pendingQuotes: 0,
        overdueInvoices: 0,
        monthlyRevenue: [],
    };
    
    selectedClient: Client | null = null;
    selectedCar: Car | null = null;

    // UI state
    isLoadingClients = false;
    isLoadingClientDetails = false;
    isLoadingQuotes = false;
    isLoadingInvoices = false;
    isLoadingInventory = false;
    isLoadingStats = false;
    error: string | null = null;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;
    }

    // --- Actions ---

    // Combined fetch for initial load
    fetchAllData = () => {
        this.fetchClients();
        this.fetchQuotes();
        this.fetchInvoices();
        this.fetchInventory();
        this.fetchDashboardStats();
    }

    // Clients
    fetchClients = async () => {
        this.isLoadingClients = true;
        this.error = null;
        try {
            const clients = await apiClient.getClients();
            runInAction(() => {
                this.clients = clients;
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
            });
        } finally {
            runInAction(() => {
                this.isLoadingClients = false;
            });
        }
    }

    selectClient = async (clientId: number) => {
        this.isLoadingClientDetails = true;
        this.error = null;
        this.selectedCar = null; // Unselect car when selecting a new client
        try {
            const client = await apiClient.getClientById(clientId);
            runInAction(() => {
                this.selectedClient = client;
            });
        } catch (err: any) {
             runInAction(() => {
                this.error = err.message;
            });
        } finally {
             runInAction(() => {
                this.isLoadingClientDetails = false;
            });
        }
    }

    unselectClient = () => {
        this.selectedClient = null;
        this.selectedCar = null;
    }

    addCarToClient = async (carData: Partial<Car>) => {
        if (!this.selectedClient) throw new Error("No client selected");
        this.error = null;
        try {
            await apiClient.addCarToClient(this.selectedClient.id, carData);
            // Refresh client data to show the new car
            await this.selectClient(this.selectedClient.id);
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
            });
            throw err;
        }
    }
    
    // Cars
    selectCar = (car: Car) => {
        this.selectedCar = car;
    }
    
    unselectCar = () => {
        this.selectedCar = null;
    }
    
    addMaintenanceRecord = async (carId: string, record: Omit<MaintenanceRecord, 'id'>) => {
        if (!this.selectedCar || this.selectedCar.id !== carId) throw new Error("Car not selected or mismatch.");
        this.error = null;
        try {
            const newRecord = await apiClient.addMaintenanceRecord(carId, record);
             runInAction(() => {
                if(this.selectedCar) {
                    this.selectedCar.maintenance = [...(this.selectedCar.maintenance || []), newRecord];
                }
            });
        } catch (err: any) {
            runInAction(() => { this.error = err.message });
            throw err;
        }
    }
    
    deleteMaintenanceRecord = async (recordId: string) => {
        if (!this.selectedCar) throw new Error("Car not selected.");
        this.error = null;
        try {
            await apiClient.deleteMaintenanceRecord(recordId);
            runInAction(() => {
                if(this.selectedCar) {
                    this.selectedCar.maintenance = this.selectedCar.maintenance.filter(r => r.id !== recordId);
                }
            });
        } catch (err: any) {
            runInAction(() => { this.error = err.message });
            throw err;
        }
    }

    // Quotes
    fetchQuotes = async () => {
        this.isLoadingQuotes = true;
        this.error = null;
        try {
            const quotes = await apiClient.getQuotes();
            runInAction(() => { this.quotes = quotes; });
        } catch (err: any) {
            runInAction(() => { this.error = err.message; });
        } finally {
            runInAction(() => { this.isLoadingQuotes = false; });
        }
    }
    
    // Invoices
    fetchInvoices = async () => {
        this.isLoadingInvoices = true;
        this.error = null;
        try {
            const invoices = await apiClient.getInvoices();
            runInAction(() => { this.invoices = invoices; });
        } catch (err: any) {
            runInAction(() => { this.error = err.message; });
        } finally {
            runInAction(() => { this.isLoadingInvoices = false; });
        }
    }
    
    // Inventory
    fetchInventory = async () => {
        this.isLoadingInventory = true;
        this.error = null;
        try {
            const items = await apiClient.getInventory();
            runInAction(() => { this.inventory = items; });
        } catch (err: any) {
            runInAction(() => { this.error = err.message; });
        } finally {
            runInAction(() => { this.isLoadingInventory = false; });
        }
    }

    addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'mechanicId'>) => {
        try {
            const newItem = await apiClient.addInventoryItem(itemData);
            runInAction(() => {
                this.inventory.push(newItem);
            });
        } catch (err: any) {
             runInAction(() => { this.error = err.message; });
             throw err;
        }
    }

    updateInventoryItem = async (id: number, itemData: Partial<InventoryItem>) => {
        try {
            const updatedItem = await apiClient.updateInventoryItem(id, itemData);
            runInAction(() => {
                const index = this.inventory.findIndex(i => i.id === id);
                if (index !== -1) {
                    this.inventory[index] = updatedItem;
                }
            });
        } catch (err: any) {
             runInAction(() => { this.error = err.message; });
             throw err;
        }
    }

    deleteInventoryItem = async (id: number) => {
        try {
            await apiClient.deleteInventoryItem(id);
            runInAction(() => {
                this.inventory = this.inventory.filter(i => i.id !== id);
            });
        } catch (err: any) {
             runInAction(() => { this.error = err.message; });
             throw err;
        }
    }
    
    // Stats
    fetchDashboardStats = async () => {
        this.isLoadingStats = true;
        this.error = null;
        try {
            const stats = await apiClient.getDashboardStats();
            runInAction(() => { this.dashboardStats = stats; });
        } catch (err: any) {
            runInAction(() => { this.error = err.message; });
        } finally {
            runInAction(() => { this.isLoadingStats = false; });
        }
    }
}
