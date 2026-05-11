package com.rogerllina.sst.repository

import com.rogerllina.sst.model.Transaction
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime
import java.util.UUID

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
}
