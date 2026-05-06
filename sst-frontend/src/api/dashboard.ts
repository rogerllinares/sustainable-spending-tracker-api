import { useQuery } from "@tanstack/react-query"
import { apiClient } from "./client"
import type { DashboardSummary, CategorySummary } from "./types"

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardSummary>("/api/dashboard/summary")
      return data
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ["dashboard", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<CategorySummary[]>("/api/dashboard/categories")
      return data
    },
  })
}
