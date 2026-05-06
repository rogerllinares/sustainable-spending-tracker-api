import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { apiClient } from "./client"
import type { PagedResponse, Transaction, TransactionFilters } from "./types"

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.set("category", filters.category)
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.set("dateTo", filters.dateTo)
      if (filters.minScore !== undefined) params.set("minScore", String(filters.minScore))
      if (filters.maxScore !== undefined) params.set("maxScore", String(filters.maxScore))
      params.set("page", String(filters.page ?? 0))
      params.set("size", String(filters.size ?? 20))
      const { data } = await apiClient.get<PagedResponse<Transaction>>(
        `/api/transactions?${params.toString()}`,
      )
      return data
    },
    placeholderData: keepPreviousData,
  })
}
