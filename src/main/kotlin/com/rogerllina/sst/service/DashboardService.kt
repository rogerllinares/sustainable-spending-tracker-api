package com.rogerllina.sst.service

import com.rogerllina.sst.dto.CategorySummaryDto
import com.rogerllina.sst.dto.DashboardSummaryDto
import com.rogerllina.sst.dto.MonthlyTrendDto
import com.rogerllina.sst.repository.TransactionRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class DashboardService(private val transactionRepository: TransactionRepository) {

    fun getSummary(): DashboardSummaryDto {
        val summary = transactionRepository.aggregateSummary()
        val monthly = transactionRepository.aggregateMonthlyTrend().map {
            MonthlyTrendDto(
                month = "%04d-%02d".format(it.year, it.month),
                co2Kg = it.co2Kg ?: BigDecimal.ZERO,
                esgScore = it.avgEsgScore?.toInt() ?: 0,
                transactionCount = it.transactionCount.toInt()
            )
        }
        return DashboardSummaryDto(
            totalCo2Kg = summary.totalCo2Kg ?: BigDecimal.ZERO,
            avgEsgScore = summary.avgEsgScore?.toInt() ?: 0,
            transactionCount = summary.transactionCount.toInt(),
            monthlyTrend = monthly
        )
    }

    fun getCategorySummaries(): List<CategorySummaryDto> =
        transactionRepository.aggregateByCategory().map {
            CategorySummaryDto(
                category = it.category,
                totalSpend = it.totalSpend ?: BigDecimal.ZERO,
                totalCo2Kg = it.totalCo2Kg ?: BigDecimal.ZERO,
                avgEsgScore = it.avgEsgScore?.toInt() ?: 0,
                transactionCount = it.transactionCount.toInt()
            )
        }
}
