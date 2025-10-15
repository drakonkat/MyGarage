export interface MaintenanceRecord {
  id: string;
  date: string;
  mileage: number;
  description: string;
  cost: number;
  notes?: string;
  isRecommendation?: boolean;
  diyCost?: number;
}

export interface KnownIssue {
  id: string;
  description: string;
  dateAdded: string;
  isResolved: boolean;
}

export interface PaymentRecord {
  date: string;
  amount: number;
}

export interface Reminder {
  id: string;
  description: string;
  nextDueDate: string;
  amount: number;
  paymentHistory: PaymentRecord[];
  frequency: 'monthly' | 'annual' | 'biennial';
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  ownerId?: number; // L'ID del proprietario (User)
  maintenance: MaintenanceRecord[];
  knownIssues?: KnownIssue[];
  reminders?: Reminder[];
}

export interface ResourceLinks {
  youtube?: string;
  parts_link?: string;
}

// Tipi per l'API di Auto-Doc
export interface AutoDocMakerOption {
    id: number;
    name: string;
    euroReg: number;
}

export interface AutoDocMakerGroup {
    label: string;
    options: AutoDocMakerOption[];
}

export interface AutoDocMakersResponse {
    makers: AutoDocMakerGroup[];
}

export interface AutoDocModelOption {
    id: number;
    name: string;
}

export interface AutoDocModelGroup {
    label: string;
    options: AutoDocModelOption[];
}

export interface AutoDocModelsResponse {
    models: AutoDocModelGroup[];
}

export interface AutoDocVehicleOption {
    id: number;
    name: string;
    euroReg: number;
}

export interface AutoDocVehicleGroup {
    label: string;
    options: AutoDocVehicleOption[];
}

export interface AutoDocVehiclesResponse {
    vehicles: AutoDocVehicleGroup[];
}

// Tipi per la Simulazione
export interface AnnualCostEstimate {
  insuranceRange: [number, number];
  roadTaxRange: [number, number];
}

export interface SimulationResultData {
  car: Car;
  records: MaintenanceRecord[];
  annualCosts: AnnualCostEstimate;
  targetMileage: number;
}

// Tipi per l'Utente e il Cliente
export interface User {
  id: number;
  email: string;
  role: 'personal' | 'mechanic';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  createdAt: string;
  userAccount?: {
      id: number;
      cars?: Car[];
  };
  // Aggiungiamo le auto direttamente qui per i clienti senza account
  cars?: Car[];
}

// Tipi per Preventivi e Fatture
export interface DocumentItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: number;
  quoteNumber: string;
  clientId: number;
  carId: string;
  quoteDate: string;
  expiryDate?: string;

  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'invoiced';
  items: DocumentItem[];
  notes?: string;
  client?: Client;
  car?: Car;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  quoteId?: number;
  clientId: number;
  carId: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: DocumentItem[];
  notes?: string;
  client?: Client;
  car?: Car;
}

// Tipi per la Dashboard del Meccanico
export interface MonthlyRevenue {
    month: string;
    revenue: number;
}

export interface MechanicDashboardStats {
    clientCount: number;
    totalRevenue: number;
    pendingQuotes: number;
    overdueInvoices: number;
    monthlyRevenue: MonthlyRevenue[];
}