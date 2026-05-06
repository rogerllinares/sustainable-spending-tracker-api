package com.rogerllina.sst.dto

import java.math.BigDecimal

data class DashboardSummaryDto(
    val totalCo2Kg: BigDecimal,
    val avgEsgScore: Int,
    val transactionCount: Int,
    val monthlyTrend: List<MonthlyTrendDto>
)

data class MonthlyTrendDto(
    val month: String,
    val co2Kg: BigDecimal,
    val esgScore: Int,
    val transactionCount: Int
)

data class CategorySummaryDto(
    val category: String,
    val totalSpend: BigDecimal,
    val totalCo2Kg: BigDecimal,
    val avgEsgScore: Int,
    val transactionCount: Int
)
