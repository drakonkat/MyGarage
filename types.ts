// Fix: Removed self-import of `MaintenanceRecord` which was causing a conflict.
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

export interface AnnualReminder {
  id: string;
  description: string;
  nextDueDate: string;
  amount: number;
  paymentHistory: PaymentRecord[];
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  maintenance: MaintenanceRecord[];
  knownIssues?: KnownIssue[];
  annualReminders?: AnnualReminder[];
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