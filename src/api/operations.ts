import { apiClient } from './client';
import {
  Branch,
  Customer,
  Dealer,
  Expense,
  SaleRecord,
  StockTransfer,
  SupplierOrder,
  TeamMember,
  VehicleUnit,
} from '../types';

export interface BootstrapResponse {
  dealers: Dealer[];
  branches: Branch[];
  teamMembers: TeamMember[];
  units: VehicleUnit[];
  sales: SaleRecord[];
  customers: Customer[];
  transfers: StockTransfer[];
  orders: SupplierOrder[];
  expenses: Expense[];
}

export const operationsApi = {
  fetchBootstrap(): Promise<BootstrapResponse> {
    return apiClient.get<BootstrapResponse>('/bootstrap');
  },

  async receiveStock(
    units: Array<{
      chassis_number: string;
      engine_number: string;
      model_id?: string;
      model_name: string;
      vehicle_type?: '2W' | '3W';
      color?: string;
      cost_price: number;
      price: number;
      branch_id?: string | number;
    }>,
    supplier?: string,
  ): Promise<{ units: VehicleUnit[]; order: SupplierOrder }> {
    return apiClient.post<{ units: VehicleUnit[]; order: SupplierOrder }>('/inventory/receive', {
      units,
      supplier: supplier || 'TVS / Wholesale Supply',
    });
  },

  async recordSale(saleData: {
    unit_id: string | number;
    branch_id: string | number;
    customer_id?: string | number;
    customer_name: string;
    customer_phone: string;
    customer_nida?: string;
    customer_location?: string;
    amount: number;
    amount_paid?: number;
    payment_method: 'CASH' | 'INSTALLMENT' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
    payment_ref?: string;
    delivery_type?: 'IMMEDIATE' | 'SCHEDULED';
    pickup_date?: string;
    notes?: string;
  }): Promise<{ sale: SaleRecord; unit: VehicleUnit; customer: Customer }> {
    return apiClient.post<{ sale: SaleRecord; unit: VehicleUnit; customer: Customer }>(
      '/sales',
      saleData,
    );
  },

  async releaseUnit(
    unitId: string | number,
    data: {
      delivery_status?: 'RELEASED';
      released_by?: string;
      notes?: string;
    } = {},
  ): Promise<{ unit: VehicleUnit }> {
    return apiClient.post<{ unit: VehicleUnit }>(`/units/${unitId}/release`, {
      delivery_status: 'RELEASED',
      ...data,
    });
  },

  async createTransfer(transferData: {
    from_branch_id: string | number;
    to_branch_id: string | number;
    unit_ids: Array<string | number>;
    notes?: string;
  }): Promise<{ transfer: StockTransfer; updated_units_count: number }> {
    return apiClient.post<{ transfer: StockTransfer; updated_units_count: number }>(
      '/transfers',
      transferData,
    );
  },

  async recordExpense(expenseData: {
    branch_id: string | number;
    category: string;
    amount: number;
    description: string;
    payment_method: 'CASH' | 'INSTALLMENT' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
    receipt_number?: string;
    notes?: string;
  }): Promise<{ expense: Expense }> {
    return apiClient.post<{ expense: Expense }>('/expenses', expenseData);
  },
};
