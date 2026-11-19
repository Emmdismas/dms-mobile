import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Branch,
  Customer,
  Dealer,
  Expense,
  Language,
  SaleRecord,
  StockTransfer,
  SupplierOrder,
  TeamMember,
  VehicleUnit,
} from '../types';
import { operationsApi } from '../api/operations';
import { useAuth } from './AuthContext';
import { translations } from '../i18n/translations';
import { syncService } from '../services/syncService';

const THEME_KEY = '@dms_theme';
const LANG_KEY = '@dms_language';

interface AppContextType {
  // Theme & Language
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  t: typeof translations.sw;

  // Workspace Data
  dealers: Dealer[];
  branches: Branch[];
  units: VehicleUnit[];
  sales: SaleRecord[];
  customers: Customer[];
  transfers: StockTransfer[];
  orders: SupplierOrder[];
  expenses: Expense[];
  teamMembers: TeamMember[];

  // Filtered views according to active branch
  filteredUnits: VehicleUnit[];
  filteredSales: SaleRecord[];
  filteredExpenses: Expense[];
  activeBranch: Branch | null;

  // Sync & Offline state
  isRefreshing: boolean;
  isSyncing: boolean;
  isOffline: boolean;
  pendingQueueCount: number;
  lastSyncTime: Date | null;
  refreshData: () => Promise<void>;
  syncNow: () => Promise<{ syncedCount: number; failedCount: number }>;

  // Quick State Updates
  appendUnits: (newUnits: VehicleUnit[]) => void;
  appendSale: (sale: SaleRecord, updatedUnit: VehicleUnit, customer?: Customer) => void;
  appendTransfer: (transfer: StockTransfer) => void;
  appendExpense: (expense: Expense) => void;
  receiveStockOffline: (payload: { units: any[]; supplier?: string }) => Promise<void>;
  recordSaleOffline: (payload: any) => Promise<{ sale: SaleRecord; unit: VehicleUnit }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, selectedBranchId } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('sw');

  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [units, setUnits] = useState<VehicleUnit[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Restore Theme & Language
  useEffect(() => {
    void (async () => {
      const [savedTheme, savedLang] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(LANG_KEY),
      ]);
      if (savedTheme === 'dark') setIsDarkMode(true);
      if (savedLang === 'en' || savedLang === 'sw') setLanguage(savedLang as Language);
    })();
  }, []);

  // Restore offline cache immediately on boot
  useEffect(() => {
    void (async () => {
      const cached = await syncService.getWorkspaceCache();
      if (cached) {
        setDealers(cached.dealers || []);
        setBranches(cached.branches || []);
        setUnits(cached.units || []);
        setSales(cached.sales || []);
        setCustomers(cached.customers || []);
        setTransfers(cached.transfers || []);
        setOrders(cached.orders || []);
        setExpenses(cached.expenses || []);
        setTeamMembers(cached.teamMembers || []);
      }
      const queue = await syncService.getQueue();
      setPendingQueueCount(queue.length);
    })();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      void AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'sw' ? 'en' : 'sw';
      void AsyncStorage.setItem(LANG_KEY, next);
      return next;
    });
  };

  const t = translations[language];

  // Refresh data from API
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      const isOnline = await syncService.isOnline();
      setIsOffline(!isOnline);

      const data = await operationsApi.fetchBootstrap();
      setDealers(data.dealers || []);
      setBranches(data.branches || []);
      setUnits(data.units || []);
      setSales(data.sales || []);
      setCustomers(data.customers || []);
      setTransfers(data.transfers || []);
      setOrders(data.orders || []);
      setExpenses(data.expenses || []);
      setTeamMembers(data.teamMembers || []);
      setLastSyncTime(new Date());

      // Save to persistent offline cache
      void syncService.saveWorkspaceCache(data);

      setIsOffline(false);
    } catch {
      setIsOffline(true);
    } finally {
      setIsRefreshing(false);
      const queue = await syncService.getQueue();
      setPendingQueueCount(queue.length);
    }
  }, [currentUser]);

  // Synchronize pending queue
  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncService.processQueue();
      if (res.syncedCount > 0) {
        await refreshData();
      }
      const queue = await syncService.getQueue();
      setPendingQueueCount(queue.length);
      setIsOffline(false);
      return res;
    } catch (err: any) {
      setIsOffline(true);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshData]);

  // Periodic connectivity & auto-sync checker
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      const online = await syncService.isOnline();
      setIsOffline(!online);
      const queue = await syncService.getQueue();
      setPendingQueueCount(queue.length);

      // If online and items are pending, auto-sync in background
      if (online && queue.length > 0 && !isSyncing) {
        try {
          await syncService.processQueue();
          await refreshData();
        } catch {
          // ignore background sync error
        }
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [currentUser, isSyncing, refreshData]);

  useEffect(() => {
    if (currentUser) {
      void refreshData();
    }
  }, [currentUser, refreshData]);

  // Determine active branch
  const activeBranch = React.useMemo(() => {
    if (!selectedBranchId) return null;
    return branches.find((b) => String(b.id) === String(selectedBranchId)) || null;
  }, [selectedBranchId, branches]);

  // Filter items by branch if selected
  const filteredUnits = React.useMemo(() => {
    if (!selectedBranchId) return units;
    return units.filter((u) => String(u.branchId) === String(selectedBranchId));
  }, [units, selectedBranchId]);

  const filteredSales = React.useMemo(() => {
    if (!selectedBranchId) return sales;
    return sales.filter((s) => String(s.branchId) === String(selectedBranchId));
  }, [sales, selectedBranchId]);

  const filteredExpenses = React.useMemo(() => {
    if (!selectedBranchId) return expenses;
    return expenses.filter((e) => String(e.branchId) === String(selectedBranchId));
  }, [expenses, selectedBranchId]);

  // Quick State Updates
  const appendUnits = (newUnits: VehicleUnit[]) => {
    setUnits((prev) => {
      const updated = [...newUnits, ...prev];
      void syncService.saveWorkspaceCache({ dealers, branches, units: updated, sales, customers, transfers, orders, expenses, teamMembers });
      return updated;
    });
  };

  const appendSale = (sale: SaleRecord, updatedUnit: VehicleUnit, customer?: Customer) => {
    setSales((prev) => {
      const nextSales = [sale, ...prev];
      setUnits((prevUnits) => {
        const nextUnits = prevUnits.map((u) => (u.id === updatedUnit.id ? updatedUnit : u));
        void syncService.saveWorkspaceCache({ dealers, branches, units: nextUnits, sales: nextSales, customers, transfers, orders, expenses, teamMembers });
        return nextUnits;
      });
      return nextSales;
    });

    if (customer) {
      setCustomers((prev) => {
        const idx = prev.findIndex((c) => c.id === customer.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = customer;
          return next;
        }
        return [customer, ...prev];
      });
    }
  };

  const appendTransfer = (transfer: StockTransfer) => {
    setTransfers((prev) => [transfer, ...prev]);
    void refreshData();
  };

  const appendExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  // Offline-First Handlers: Enqueue and update local cache
  const receiveStockOffline = async (payload: { units: any[]; supplier?: string }) => {
    // 1. Enqueue to sync queue
    await syncService.enqueue('RECEIVE_STOCK', payload);

    // 2. Generate local unit records immediately
    const localUnits: VehicleUnit[] = payload.units.map((u, i) => {
      const branch = branches.find((b) => String(b.id) === String(u.branch_id)) || branches[0];
      return {
        id: `LOCAL-UNIT-${Date.now()}-${i}`,
        chassisNumber: u.chassis_number,
        engineNumber: u.engine_number,
        modelId: u.model_id || 'mod-1',
        modelName: u.model_name,
        vehicleType: u.vehicle_type || '2W',
        color: u.color || 'Black',
        branchId: String(u.branch_id),
        branchCode: branch ? branch.code : '',
        branchName: branch ? branch.name : 'Branch',
        status: 'IN STOCK',
        receivedDate: new Date().toISOString().split('T')[0],
        stockAgeDays: 0,
        costPrice: u.cost_price,
        price: u.price,
        journey: [],
      };
    });

    appendUnits(localUnits);
    const queue = await syncService.getQueue();
    setPendingQueueCount(queue.length);
  };

  const recordSaleOffline = async (payload: any) => {
    // 1. Enqueue to sync queue
    await syncService.enqueue('RECORD_SALE', payload);

    // 2. Find and mark the unit as SOLD locally so it cannot be double sold offline!
    const targetUnit = units.find((u) => String(u.id) === String(payload.unit_id));
    const branch = branches.find((b) => String(b.id) === String(payload.branch_id)) || branches[0];

    const localSale: SaleRecord = {
      id: `LOCAL-SALE-${Date.now()}`,
      receiptNumber: `OFFLINE-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      unitId: String(payload.unit_id),
      chassisNumber: targetUnit ? targetUnit.chassisNumber : 'N/A',
      engineNumber: targetUnit ? targetUnit.engineNumber : 'N/A',
      modelName: targetUnit ? targetUnit.modelName : 'Motorcycle',
      vehicleType: targetUnit ? targetUnit.vehicleType : '2W',
      branchId: String(payload.branch_id),
      branchName: branch ? branch.name : 'Branch',
      branchCode: branch ? branch.code : '',
      customerId: `LOCAL-CUST-${Date.now()}`,
      customerName: payload.customer_name,
      customerPhone: payload.customer_phone,
      salespersonName: currentUser?.name || 'Seller',
      amount: payload.amount,
      amountPaid: payload.amount_paid || payload.amount,
      paymentMethod: payload.payment_method,
      paymentRef: payload.payment_ref,
      status: 'COMPLETED',
      notes: payload.notes ? `${payload.notes} (Iliuzwa Offline)` : 'Iliuzwa Offline',
    };

    const updatedUnit: VehicleUnit = targetUnit
      ? {
          ...targetUnit,
          status: 'SOLD',
          soldToCustomerName: payload.customer_name,
          soldDate: new Date().toISOString().split('T')[0],
          soldAmount: payload.amount,
        }
      : ({ id: String(payload.unit_id), status: 'SOLD' } as any);

    appendSale(localSale, updatedUnit);
    const queue = await syncService.getQueue();
    setPendingQueueCount(queue.length);

    return { sale: localSale, unit: updatedUnit };
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        language,
        toggleLanguage,
        t,
        dealers,
        branches,
        units,
        sales,
        customers,
        transfers,
        orders,
        expenses,
        teamMembers,
        filteredUnits,
        filteredSales,
        filteredExpenses,
        activeBranch,
        isRefreshing,
        isSyncing,
        isOffline,
        pendingQueueCount,
        lastSyncTime,
        refreshData,
        syncNow,
        appendUnits,
        appendSale,
        appendTransfer,
        appendExpense,
        receiveStockOffline,
        recordSaleOffline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
