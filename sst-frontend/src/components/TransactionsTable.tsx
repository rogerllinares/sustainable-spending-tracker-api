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
      <CardContent className="p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">Transactions</h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4 items-end">
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="filter-category" className="text-xs text-muted-foreground mb-1 block">Category</label>
            <select
              id="filter-category"
              aria-label="Filter by category"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={filters.category ?? ""}
              onChange={(e) => update({ category: e.target.value || undefined })}
            >
              <option value="">All</option>
              {categories.data?.map((c) => (
                <option key={c.category} value={c.category}>{c.category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-date-from" className="text-xs text-muted-foreground mb-1 block">From</label>
            <Input
              id="filter-date-from"
              aria-label="Filter from date"
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) => update({ dateFrom: e.target.value || undefined })}
              className="h-9 w-full"
            />
          </div>

          <div>
            <label htmlFor="filter-date-to" className="text-xs text-muted-foreground mb-1 block">To</label>
            <Input
              id="filter-date-to"
              aria-label="Filter to date"
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(e) => update({ dateTo: e.target.value || undefined })}
              className="h-9 w-full"
            />
          </div>

          <div>
            <label htmlFor="filter-min-esg" className="text-xs text-muted-foreground mb-1 block">Min ESG</label>
            <Input
              id="filter-min-esg"
              aria-label="Minimum ESG score"
              type="number"
              min={0}
              max={100}
              value={filters.minScore ?? ""}
              onChange={(e) =>
                update({ minScore: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              className="h-9 w-full"
            />
          </div>

          <div>
            <label htmlFor="filter-max-esg" className="text-xs text-muted-foreground mb-1 block">Max ESG</label>
            <Input
              id="filter-max-esg"
              aria-label="Maximum ESG score"
              type="number"
              min={0}
              max={100}
              value={filters.maxScore ?? ""}
              onChange={(e) =>
                update({ maxScore: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              className="h-9 w-full"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <Button
              variant="outline"
              onClick={() => setFilters({ page: 0, size: PAGE_SIZE })}
              className="h-9 w-full"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {/* DESIGN.md sec.3 label token: mono, uppercase, tracked — column headers only */}
              <TableRow className="font-mono text-[0.66rem] uppercase tracking-[0.04em]">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Amount (€)</TableHead>
                <TableHead className="text-right">CO₂ (kg)</TableHead>
                <TableHead className="text-right">ESG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <p>Loading transactions…</p>
                    <p className="text-xs mt-1">First request can take ~50s while the backend wakes up (free tier).</p>
                  </TableCell>
                </TableRow>
              )}
              {txns.isError && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-sm text-destructive mb-2">Couldn't load transactions.</p>
                    <p className="text-xs text-muted-foreground mb-3">Backend may be cold-starting (~50s).</p>
                    <Button variant="outline" size="sm" onClick={() => txns.refetch()}>Retry</Button>
                  </TableCell>
                </TableRow>
              )}
              {!txns.isLoading && !txns.isError && txns.data?.content.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions match these filters.</TableCell></TableRow>
              )}
              {!txns.isError && txns.data?.content.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs tabular-nums">{t.date.slice(0, 10)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{t.merchantName ?? t.description}</div>
                    {t.merchantName && (
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    )}
                    <div className="md:hidden text-xs text-muted-foreground mt-0.5">{t.category}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{t.category}</TableCell>
                  <TableCell className="text-right font-mono font-medium tabular-nums">{t.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{t.co2Kg.toFixed(2)}</TableCell>
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
