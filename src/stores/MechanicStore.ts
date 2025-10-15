import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './RootStore.ts';
import { apiClient } from '../ApiClient.ts';
import { Client, Quote, Invoice, MechanicDashboardStats, InventoryItem, Car, MaintenanceRecord } from '../types.ts';

const initialDashboardStats: MechanicDashboardStats = {
    clientCount: 0,
    totalRevenue: 0,
    pendingQuotes: 0,
    overdueInvoices: 0,
    monthlyRevenue: [],
};

export class MechanicStore {
  rootStore: RootStore;
  clients: Client[] = [];
  quotes: Quote[] = [];
  invoices: Invoice[] = [];
  inventory: InventoryItem[] = [];
  dashboardStats: MechanicDashboardStats = initialDashboardStats;

  selectedClient: Client | null = null;
  selectedCar: Car | null = null;
  isLoadingClientDetails: boolean = false;

  isLoadingClients: boolean = false;
  isLoadingQuotes: boolean = false;
  isLoadingInvoices: boolean = false;
  isLoadingInventory: boolean = false;
  isLoadingStats: boolean = false;
  
  error: string | null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  // Unified fetch for initial load
  fetchAllData = async () => {
      this.fetchClients();
      this.fetchQuotes();
      this.fetchInvoices();
      this.fetchDashboardStats();
      this.fetchInventory();
  }

  fetchClients = async () => {
    this.isLoadingClients = true;
    this.error = null;
    try {
      const clientsData = await apiClient.getMyClients();
      runInAction(() => {
        this.clients = clientsData;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Impossibile caricare i dati dei clienti.";
      });
    } finally {
      runInAction(() => {
        this.isLoadingClients = false;
      });
    }
  };

  selectClient = async (clientId: number) => {
    this.isLoadingClientDetails = true;
    this.error = null;
    try {
      const clientDetails = await apiClient.getClientDetails(clientId);
      runInAction(() => {
        this.selectedClient = clientDetails;
         if (this.selectedCar) {
            this.selectedCar = clientDetails.cars?.find(c => c.id === this.selectedCar!.id) || null;
        }
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Impossibile caricare i dettagli del cliente.";
        this.selectedClient = null; // Reset on error
      });
    } finally {
      runInAction(() => {
        this.isLoadingClientDetails = false;
      });
    }
  };

  unselectClient = () => {
    this.selectedClient = null;
    this.selectedCar = null;
  };

  selectCar = (car: Car) => {
    this.selectedCar = car;
  };

  unselectCar = () => {
    this.selectedCar = null;
  };
  
  addCarToClient = async (carData: { make: string; model: string; year: string; mileage: string; licensePlate?: string; }) => {
    if (!this.selectedClient) return;
    this.error = null;
    try {
      await apiClient.addCarToClient(this.selectedClient.id, carData);
      // Refresh client data
      await this.selectClient(this.selectedClient.id);
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Impossibile aggiungere il veicolo.";
      });
      throw err; // re-throw to be caught in modal
    }
  };

  addMaintenanceRecord = async (carId: string, recordData: Omit<MaintenanceRecord, 'id' | 'carId'>) => {
    if (!this.selectedClient) return;
    try {
        await apiClient.addMaintenanceRecordToCar(carId, recordData);
        await this.selectClient(this.selectedClient.id);
    } catch (err: any) {
        runInAction(() => {
            this.error = err.message || "Impossibile aggiungere il record di manutenzione.";
        });
        throw err;
    }
  };

  deleteMaintenanceRecord = async (recordId: string) => {
      if (!this.selectedClient) return;
      try {
          await apiClient.deleteMaintenanceRecord(recordId);
          await this.selectClient(this.selectedClient.id);
      } catch (err: any) {
          runInAction(() => {
              this.error = err.message || "Impossibile eliminare il record di manutenzione.";
          });
          throw err;
      }
  };
  
  fetchDashboardStats = async () => {
      this.isLoadingStats = true;
      try {
          const stats = await apiClient.getMechanicDashboardStats();
          runInAction(() => {
              this.dashboardStats = stats;
          });
      } catch (err: any) {
          runInAction(() => {
              this.error = err.message || "Impossibile caricare le statistiche.";
          });
      } finally {
          runInAction(() => {
              this.isLoadingStats = false;
          });
      }
  }

  fetchQuotes = async () => {
    this.isLoadingQuotes = true;
    try {
      const quotes = await apiClient.getQuotes();
      runInAction(() => {
        this.quotes = quotes;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Impossibile caricare i preventivi.";
      });
    } finally {
      runInAction(() => {
        this.isLoadingQuotes = false;
      });
    }
  }

  fetchInvoices = async () => {
    this.isLoadingInvoices = true;
    try {
      const invoices = await apiClient.getInvoices();
      runInAction(() => {
        this.invoices = invoices;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Impossibile caricare le fatture.";
      });
    } finally {
      runInAction(() => {
        this.isLoadingInvoices = false;
      });
    }
  }

  // --- Inventory Actions ---
  fetchInventory = async () => {
    this.isLoadingInventory = true;
    this.error = null;
    try {
        const items = await apiClient.getInventoryItems();
        runInAction(() => {
            this.inventory = items;
        });
    } catch (err: any) {
        runInAction(() => {
            this.error = err.message || "Impossibile caricare l'inventario.";
        });
    } finally {
        runInAction(() => {
            this.isLoadingInventory = false;
        });
    }
  };

  addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'mechanicId'>) => {
      await apiClient.createInventoryItem(itemData);
      this.fetchInventory(); // Refresh list
  };

  updateInventoryItem = async (itemId: number, itemData: Partial<InventoryItem>) => {
      await apiClient.updateInventoryItem(itemId, itemData);
      this.fetchInventory(); // Refresh list
  };

  deleteInventoryItem = async (itemId: number) => {
      await apiClient.deleteInventoryItem(itemId);
      this.fetchInventory(); // Refresh list
  };
}