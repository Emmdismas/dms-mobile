export type Language = 'sw' | 'en';

export type UserRole =
  | 'super_admin'
  | 'dealer'
  | 'owner'
  | 'branch_manager'
  | 'admin'
  | 'storekeeper'
  | 'sales_person';

export interface Dealer {
  id: string;
  code: string;
  secondaryCode?: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  city: string;
  region?: string;
  country: string;
  branchesCount: number;
  totalVehicles: number;
  totalSalesRevenueTZS: number;
  joinedDate: string;
  notes?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  dealerCode: string;
  dealerName: string;
  branchCode?: string;
  branchName?: string;
  branchLocation?: string;
  avatarUrl?: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  location: string;
  zone: string;
  region: string;
  phone: string;
  contactPerson: string;
  status: 'Active' | 'Inactive';
  totalUnitsInStock: number;
  mtdUnitsSold: number;
  mtdRevenueTZS: number;
  managerName?: string;
  dealerCode?: string;
  dealerName?: string;
}

export type VehicleType = '2W' | '3W';
export type UnitStatus = 'IN STOCK' | 'RESERVED' | 'TRANSFERRED' | 'SOLD' | 'DAMAGED' | 'RETURNED';

export interface VehicleJourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  branch: string;
  actor: string;
  type: 'received' | 'assigned' | 'transferred' | 'reserved' | 'sold' | 'service';
}

export interface VehicleUnit {
  id: string;
  chassisNumber: string;
  engineNumber: string;
  modelId: string;
  modelName: string;
  vehicleType: VehicleType;
  color: string;
  branchId: string;
  branchCode: string;
  branchName: string;
  status: UnitStatus;
  receivedDate: string;
  stockAgeDays: number;
  costPrice?: number;
  price: number;
  qrCodeUrl?: string;
  journey: VehicleJourneyEvent[];
  soldToCustomerName?: string;
  soldDate?: string;
  soldAmount?: number;
  deliveryType?: 'IMMEDIATE' | 'SCHEDULED';
  pickupDate?: string;
  deliveryStatus?: 'PENDING_PICKUP' | 'RELEASED';
  reservedCustomerName?: string;
  reservedCustomerPhone?: string;
  reservedDate?: string;
  releasedDate?: string;
  releasedBy?: string;
  dealerCode?: string;
  dealerName?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  nidaNumber: string;
  location: string;
  branchId: string;
  dealerCode?: string;
  dealerName?: string;
  totalPurchases: number;
  lastPurchaseDate: string;
}

export type PaymentMethod = 'CASH' | 'INSTALLMENT' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
export type PaymentStatus = 'PAID' | 'PARTIAL';

export interface SaleRecord {
  id: string;
  receiptNumber: string;
  date: string;
  unitId: string;
  chassisNumber: string;
  engineNumber: string;
  modelName: string;
  vehicleType: VehicleType;
  branchId: string;
  branchName: string;
  branchCode: string;
  dealerCode?: string;
  dealerName?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  salespersonName: string;
  amount: number;
  costPrice?: number;
  unitPrice?: number;
  amountPaid?: number;
  remainedAmount?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  notes?: string;
  deliveryType?: 'IMMEDIATE' | 'SCHEDULED';
  pickupDate?: string;
  deliveryStatus?: 'PENDING_PICKUP' | 'RELEASED';
  releasedDate?: string;
  releasedBy?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  unitIds: string[];
  chassisList: string[];
  modelName: string;
  vehicleType: VehicleType;
  status: 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  initiatedBy: string;
  notes?: string;
  dealerCode?: string;
  dealerName?: string;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  qty2W: number;
  qty3W: number;
  totalUnits: number;
  status: 'ORDERED' | 'IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  totalAmountTZS: number;
  dealerCode?: string;
  dealerName?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  branchName: string;
  dealerCode?: string;
  dealerName?: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  mtdSalesCount?: number;
  avatarUrl?: string;
}

export type ExpenseCategory =
  | 'USAFIRISHAJI'
  | 'KODI_LESENI'
  | 'UMEME_MAJI'
  | 'MISHAHARA_POSHO'
  | 'MATENGENEZO'
  | 'MAFUTA_LOGISTICS'
  | 'MATANGAZO_MASOKO'
  | 'CHAKULA_KINYWAJI'
  | 'VINGINEVYO';

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: ExpenseCategory;
  categoryLabel: string;
  amount: number;
  branchId: string;
  branchName: string;
  branchCode?: string;
  description: string;
  recordedBy: string;
  receiptNumber?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  dealerCode?: string;
  dealerName?: string;
}
