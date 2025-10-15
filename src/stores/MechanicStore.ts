import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './RootStore.ts';
import { apiClient } from '../ApiClient.ts';
import { Client, Quote, Invoice, MechanicDashboardStats } from '../types.ts';

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
  dashboardStats: MechanicDashboardStats = initialDashboardStats;

  isLoadingClients: boolean = false;
  isLoadingQuotes: boolean = false;
  isLoadingInvoices: boolean = false;
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
}