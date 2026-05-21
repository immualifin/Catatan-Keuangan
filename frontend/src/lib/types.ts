export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string | number;
  userId?: string;
  categoryId?: string;
  category_id?: string;
  category?: Category;
  receiptId?: string;
  type: TransactionType;
  amount: number;
  description?: string;
  transactionDate?: string;
  transaction_date?: string;
  source?: "manual" | "scan";
  createdAt?: string;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Receipt {
  id: string;
  userId: string;
  imagePath: string;
  rawOcrText?: string;
  parsedJson?: ParsedReceipt;
  status: "pending" | "parsed" | "failed";
  storeName?: string;
  receiptDate?: string;
  totalAmount?: number;
  items?: ReceiptItem[];
  createdAt: string;
}

export interface ParsedReceipt {
  store_name: string | null;
  receipt_date: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number | null;
  currency: string;
}

export interface DashboardStats {
  currentMonthIncome: number;
  currentMonthExpense: number;
  netBalance: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    color: string;
    total: number;
    percentage: number;
  }>;
  dailyTrend: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
  recentTransactions: Transaction[];
}

export interface ReportFilter {
  period: "daily" | "weekly" | "monthly" | "custom";
  startDate?: string;
  endDate?: string;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactions: Transaction[];
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  currency: string;
  created_at?: string;
}
