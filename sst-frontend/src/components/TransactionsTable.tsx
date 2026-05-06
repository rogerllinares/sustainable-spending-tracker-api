import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTransactions } from "@/api/transactions"
import { useCategories } from "@/api/dashboard"
import { EsgBadge } from "./EsgBadge"
import type { TransactionFilters } from "@/api/types"

const PAGE_SIZE = 10

export function TransactionsTable() {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 0, size: PAGE_SIZE })
  const txns = useTransactions(filters)
  const categories = useCategories()

  const update = (patch: Partial<TransactionFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: 0 }))

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Transactions</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filters.category ?? ""}
            onChange={(e) => update({ category: e.target.value || undefined })}
          >
            <option value="">All categories</option>
            {categories.data?.map((c) => (
              <option key={c.category} value={c.category}>{c.category}</option>
            ))}
          </select>

          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => update({ dateFrom: e.target.value || undefined })}
            className="h-9 w-40"
          />
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => update({ dateTo: e.target.value || undefined })}
            className="h-9 w-40"
          />

          <Input
            type="number"
            placeholder="Min ESG"
            min={0}
            max={100}
            value={filters.minScore ?? ""}
            onChange={(e) =>
              update({ minScore: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="h-9 w-24"
          />
          <Input
            type="number"
            placeholder="Max ESG"
            min={0}
            max={100}
            value={filters.maxScore ?? ""}
            onChange={(e) =>
              update({ maxScore: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="h-9 w-24"
          />

          <Button
            variant="outline"
            onClick={() => setFilters({ page: 0, size: PAGE_SIZE })}
            className="h-9"
          >
            Reset
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount (€)</TableHead>
                <TableHead className="text-right">CO₂ (kg)</TableHead>
                <TableHead className="text-right">ESG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.isLoading && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {txns.data?.content.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions match these filters.</TableCell></TableRow>
              )}
              {txns.data?.content.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.date}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className="text-muted-foreground">{t.category}</TableCell>
                  <TableCell className="text-right font-medium">{t.amountEur.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{t.co2Kg.toFixed(2)}</TableCell>
                  <TableCell className="text-right"><EsgBadge score={t.esgScore} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {txns.data && txns.data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {txns.data.page + 1} of {txns.data.totalPages} · {txns.data.totalElements} transactions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={txns.data.page === 0}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 0) - 1 }))}
              >Previous</Button>
              <Button
                variant="outline"
                size="sm"
                disabled={txns.data.page + 1 >= txns.data.totalPages}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 0) + 1 }))}
              >Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
