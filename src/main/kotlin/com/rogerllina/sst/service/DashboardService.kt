package com.rogerllina.sst.service

import com.rogerllina.sst.dto.CategorySummaryDto
import com.rogerllina.sst.dto.DashboardSummaryDto
import com.rogerllina.sst.dto.MonthlyTrendDto
import com.rogerllina.sst.repository.TransactionRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.format.DateTimeFormatter

@Service
class DashboardService(private val transactionRepository: TransactionRepository) {

    private val monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM")

    fun getSummary(): DashboardSummaryDto {
        val transactions = transactionRepository.findAll()

        if (transactions.isEmpty()) {
            return DashboardSummaryDto(
                totalCo2Kg = BigDecimal.ZERO,
                avgEsgScore = 0,
                transactionCount = 0,
                monthlyTrend = emptyList()
            )
        }

        val totalCo2Kg = transactions.fold(BigDecimal.ZERO) { acc, t -> acc + t.co2Kg }
        val avgEsgScore = transactions.map { it.esgScore }.average().toInt()
        val count = transactions.size

        val monthlyTrend = transactions
            .groupBy { it.date.format(monthFormatter) }
            .entries
            .sortedByDescending { it.key }
            .map { (month, txs) ->
                MonthlyTrendDto(
                    month = month,
                    co2Kg = txs.fold(BigDecimal.ZERO) { acc, t -> acc + t.co2Kg },
                    esgScore = txs.map { it.esgScore }.average().toInt(),
                    transactionCount = txs.size
                )
            }

        return DashboardSummaryDto(
            totalCo2Kg = totalCo2Kg,
            avgEsgScore = avgEsgScore,
            transactionCount = count,
            monthlyTrend = monthlyTrend
        )
    }

    fun getCategorySummaries(): List<CategorySummaryDto> {
        val transactions = transactionRepository.findAll()

        return transactions
            .groupBy { it.category }
            .map { (category, txs) ->
                CategorySummaryDto(
                    category = category,
                    totalSpend = txs.fold(BigDecimal.ZERO) { acc, t -> acc + t.amount },
                    totalCo2Kg = txs.fold(BigDecimal.ZERO) { acc, t -> acc + t.co2Kg },
                    avgEsgScore = txs.map { it.esgScore }.average().toInt(),
                    transactionCount = txs.size
                )
            }
            .sortedByDescending { it.totalCo2Kg }
    }
}
