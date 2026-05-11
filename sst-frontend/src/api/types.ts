export interface MonthlyTrendPoint {
  month: string   // ISO "2026-04"
  co2Kg: number
}

export interface DashboardSummary {
  totalCo2Kg: number
  avgEsgScore: number
  transactionCount: number
  monthlyTrend: MonthlyTrendPoint[]
}

export interface CategorySummary {
  category: string
  totalSpend: number
  totalCo2Kg: number
  avgEsgScore: number
  transactionCount: number
}

export interface Transaction {
  id: string
  date: string         // ISO datetime
  description: string
  merchantName?: string
  category: string
  amount: number       // EUR
  currency?: string
  co2Kg: number
  esgScore: number
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface TransactionFilters {
  category?: string
  dateFrom?: string
  dateTo?: string
  minScore?: number
  maxScore?: number
  page?: number
  size?: number
}
