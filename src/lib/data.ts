import { Category, Transaction, DashboardStats } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense
  { id: "cat-1", name: "Makanan & Minuman", type: "expense", color: "#f97316", icon: "🍔" },
  { id: "cat-2", name: "Transportasi", type: "expense", color: "#3b82f6", icon: "🚗" },
  { id: "cat-3", name: "Belanja", type: "expense", color: "#a855f7", icon: "🛍️" },
  { id: "cat-4", name: "Kesehatan", type: "expense", color: "#22c55e", icon: "💊" },
  { id: "cat-5", name: "Hiburan", type: "expense", color: "#ec4899", icon: "🎬" },
  { id: "cat-6", name: "Pendidikan", type: "expense", color: "#14b8a6", icon: "📚" },
  { id: "cat-7", name: "Tagihan & Utilitas", type: "expense", color: "#f59e0b", icon: "💡" },
  { id: "cat-8", name: "Lainnya", type: "expense", color: "#6b7280", icon: "📦" },
  // Income
  { id: "cat-9", name: "Gaji", type: "income", color: "#10b981", icon: "💼" },
  { id: "cat-10", name: "Freelance", type: "income", color: "#8b5cf6", icon: "💻" },
  { id: "cat-11", name: "Investasi", type: "income", color: "#0ea5e9", icon: "📈" },
  { id: "cat-12", name: "Hadiah", type: "income", color: "#f43f5e", icon: "🎁" },
  { id: "cat-13", name: "Lainnya", type: "income", color: "#6b7280", icon: "💰" },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "trx-1",
    userId: "user-1",
    categoryId: "cat-1",
    category: DEFAULT_CATEGORIES[0],
    type: "expense",
    amount: 45000,
    description: "Makan siang di warung Padang",
    transactionDate: "2026-05-20",
    source: "manual",
    createdAt: "2026-05-20T12:00:00Z",
  },
  {
    id: "trx-2",
    userId: "user-1",
    categoryId: "cat-9",
    category: DEFAULT_CATEGORIES[8],
    type: "income",
    amount: 8500000,
    description: "Gaji bulan Mei",
    transactionDate: "2026-05-01",
    source: "manual",
    createdAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "trx-3",
    userId: "user-1",
    categoryId: "cat-2",
    category: DEFAULT_CATEGORIES[1],
    type: "expense",
    amount: 35000,
    description: "Bensin motor",
    transactionDate: "2026-05-19",
    source: "manual",
    createdAt: "2026-05-19T09:00:00Z",
  },
  {
    id: "trx-4",
    userId: "user-1",
    categoryId: "cat-3",
    category: DEFAULT_CATEGORIES[2],
    type: "expense",
    amount: 250000,
    description: "Baju baru",
    transactionDate: "2026-05-18",
    source: "scan",
    createdAt: "2026-05-18T14:00:00Z",
  },
  {
    id: "trx-5",
    userId: "user-1",
    categoryId: "cat-10",
    category: DEFAULT_CATEGORIES[9],
    type: "income",
    amount: 1500000,
    description: "Project website klien",
    transactionDate: "2026-05-15",
    source: "manual",
    createdAt: "2026-05-15T16:00:00Z",
  },
  {
    id: "trx-6",
    userId: "user-1",
    categoryId: "cat-7",
    category: DEFAULT_CATEGORIES[6],
    type: "expense",
    amount: 320000,
    description: "Listrik + internet",
    transactionDate: "2026-05-10",
    source: "manual",
    createdAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "trx-7",
    userId: "user-1",
    categoryId: "cat-5",
    category: DEFAULT_CATEGORIES[4],
    type: "expense",
    amount: 75000,
    description: "Netflix + Spotify",
    transactionDate: "2026-05-08",
    source: "manual",
    createdAt: "2026-05-08T18:00:00Z",
  },
  {
    id: "trx-8",
    userId: "user-1",
    categoryId: "cat-4",
    category: DEFAULT_CATEGORIES[3],
    type: "expense",
    amount: 120000,
    description: "Vitamin & obat",
    transactionDate: "2026-05-06",
    source: "manual",
    createdAt: "2026-05-06T11:00:00Z",
  },
  {
    id: "trx-9",
    userId: "user-1",
    categoryId: "cat-1",
    category: DEFAULT_CATEGORIES[0],
    type: "expense",
    amount: 85000,
    description: "Makan malam keluarga",
    transactionDate: "2026-05-17",
    source: "manual",
    createdAt: "2026-05-17T19:00:00Z",
  },
  {
    id: "trx-10",
    userId: "user-1",
    categoryId: "cat-11",
    category: DEFAULT_CATEGORIES[10],
    type: "income",
    amount: 250000,
    description: "Dividen saham",
    transactionDate: "2026-05-12",
    source: "manual",
    createdAt: "2026-05-12T08:00:00Z",
  },
];

// Static 30-day daily trend — deterministic (no Math.random for SSR safety)
const RAW_DAILY_TREND: Array<{ date: string; income: number; expense: number }> = [
  { date: "2026-04-21", income: 0,       expense: 55000  },
  { date: "2026-04-22", income: 0,       expense: 120000 },
  { date: "2026-04-23", income: 0,       expense: 75000  },
  { date: "2026-04-24", income: 0,       expense: 90000  },
  { date: "2026-04-25", income: 0,       expense: 45000  },
  { date: "2026-04-26", income: 500000,  expense: 200000 },
  { date: "2026-04-27", income: 0,       expense: 60000  },
  { date: "2026-04-28", income: 0,       expense: 85000  },
  { date: "2026-04-29", income: 0,       expense: 110000 },
  { date: "2026-04-30", income: 0,       expense: 95000  },
  { date: "2026-05-01", income: 8500000, expense: 120000 },
  { date: "2026-05-02", income: 0,       expense: 65000  },
  { date: "2026-05-03", income: 0,       expense: 55000  },
  { date: "2026-05-04", income: 0,       expense: 130000 },
  { date: "2026-05-05", income: 0,       expense: 80000  },
  { date: "2026-05-06", income: 0,       expense: 120000 },
  { date: "2026-05-07", income: 0,       expense: 70000  },
  { date: "2026-05-08", income: 0,       expense: 75000  },
  { date: "2026-05-09", income: 0,       expense: 50000  },
  { date: "2026-05-10", income: 0,       expense: 320000 },
  { date: "2026-05-11", income: 0,       expense: 60000  },
  { date: "2026-05-12", income: 250000,  expense: 45000  },
  { date: "2026-05-13", income: 0,       expense: 80000  },
  { date: "2026-05-14", income: 0,       expense: 95000  },
  { date: "2026-05-15", income: 1500000, expense: 75000  },
  { date: "2026-05-16", income: 0,       expense: 55000  },
  { date: "2026-05-17", income: 0,       expense: 85000  },
  { date: "2026-05-18", income: 0,       expense: 250000 },
  { date: "2026-05-19", income: 0,       expense: 35000  },
  { date: "2026-05-20", income: 0,       expense: 45000  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  currentMonthIncome: 10250000,
  currentMonthExpense: 930000,
  netBalance: 9320000,
  categoryBreakdown: [
    { categoryId: "cat-1", categoryName: "Makanan & Minuman", color: "#f97316", total: 130000, percentage: 14 },
    { categoryId: "cat-2", categoryName: "Transportasi", color: "#3b82f6", total: 35000, percentage: 3.8 },
    { categoryId: "cat-3", categoryName: "Belanja", color: "#a855f7", total: 250000, percentage: 26.9 },
    { categoryId: "cat-4", categoryName: "Kesehatan", color: "#22c55e", total: 120000, percentage: 12.9 },
    { categoryId: "cat-5", categoryName: "Hiburan", color: "#ec4899", total: 75000, percentage: 8.1 },
    { categoryId: "cat-7", categoryName: "Tagihan & Utilitas", color: "#f59e0b", total: 320000, percentage: 34.4 },
  ],
  dailyTrend: RAW_DAILY_TREND,
  recentTransactions: MOCK_TRANSACTIONS.slice(0, 10),
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Parse a YYYY-MM-DD or ISO string safely without timezone shift */
function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const [y, m, d] = cleanDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseLocalDate(dateStr));
};

export const formatShortDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(parseLocalDate(dateStr));
};
