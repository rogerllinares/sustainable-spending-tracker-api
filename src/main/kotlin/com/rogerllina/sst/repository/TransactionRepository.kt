package com.rogerllina.sst.repository

import com.rogerllina.sst.model.Transaction
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

interface SummaryProjection {
    val totalCo2Kg: BigDecimal?
    val avgEsgScore: Double?
    val transactionCount: Long
}

interface MonthlyTrendProjection {
    val year: Int
    val month: Int
    val co2Kg: BigDecimal?
    val avgEsgScore: Double?
    val transactionCount: Long
}

interface CategorySummaryProjection {
    val category: String
    val totalSpend: BigDecimal?
    val totalCo2Kg: BigDecimal?
    val avgEsgScore: Double?
    val transactionCount: Long
}

interface TransactionRepository : JpaRepository<Transaction, UUID> {

    @Query("""
        SELECT t FROM Transaction t
        WHERE (CAST(:category AS string)            IS NULL OR t.category = :category)
          AND (CAST(:dateFrom AS timestamp)         IS NULL OR t.date >= :dateFrom)
          AND (CAST(:dateTo   AS timestamp)         IS NULL OR t.date <= :dateTo)
          AND (CAST(:minScore AS integer)           IS NULL OR t.esgScore >= :minScore)
          AND (CAST(:maxScore AS integer)           IS NULL OR t.esgScore <= :maxScore)
        ORDER BY t.date DESC
    """)
    fun findFiltered(
        @Param("category") category: String?,
        @Param("dateFrom") dateFrom: LocalDateTime?,
        @Param("dateTo")   dateTo: LocalDateTime?,
        @Param("minScore") minScore: Int?,
        @Param("maxScore") maxScore: Int?,
        pageable: Pageable
    ): Page<Transaction>

    @Query("""
        SELECT COALESCE(SUM(t.co2Kg), 0) AS totalCo2Kg,
               AVG(t.esgScore)           AS avgEsgScore,
               COUNT(t)                  AS transactionCount
        FROM Transaction t
    """)
    fun aggregateSummary(): SummaryProjection

    @Query("""
        SELECT YEAR(t.date)              AS year,
               MONTH(t.date)             AS month,
               COALESCE(SUM(t.co2Kg), 0) AS co2Kg,
               AVG(t.esgScore)           AS avgEsgScore,
               COUNT(t)                  AS transactionCount
        FROM Transaction t
        GROUP BY YEAR(t.date), MONTH(t.date)
        ORDER BY YEAR(t.date) DESC, MONTH(t.date) DESC
    """)
    fun aggregateMonthlyTrend(): List<MonthlyTrendProjection>

    @Query("""
        SELECT t.category                  AS category,
               COALESCE(SUM(t.amount), 0)  AS totalSpend,
               COALESCE(SUM(t.co2Kg), 0)   AS totalCo2Kg,
               AVG(t.esgScore)             AS avgEsgScore,
               COUNT(t)                    AS transactionCount
        FROM Transaction t
        GROUP BY t.category
        ORDER BY SUM(t.co2Kg) DESC
    """)
    fun aggregateByCategory(): List<CategorySummaryProjection>
}
