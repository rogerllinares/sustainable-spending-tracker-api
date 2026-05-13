package com.rogerllina.sst.service

import com.rogerllina.sst.repository.CategorySummaryProjection
import com.rogerllina.sst.repository.MonthlyTrendProjection
import com.rogerllina.sst.repository.SummaryProjection
import com.rogerllina.sst.repository.TransactionRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal

class DashboardServiceTest {

    private val transactionRepository = mockk<TransactionRepository>()
    private val service = DashboardService(transactionRepository)

    private fun summary(co2: BigDecimal?, avgEsg: Double?, count: Long) =
        object : SummaryProjection {
            override val totalCo2Kg = co2
            override val avgEsgScore = avgEsg
            override val transactionCount = count
        }

    private fun month(year: Int, month: Int, co2: BigDecimal, avgEsg: Double, count: Long) =
        object : MonthlyTrendProjection {
            override val year = year
            override val month = month
            override val co2Kg: BigDecimal = co2
            override val avgEsgScore: Double = avgEsg
            override val transactionCount = count
        }

    private fun category(name: String, spend: BigDecimal, co2: BigDecimal, avgEsg: Double, count: Long) =
        object : CategorySummaryProjection {
            override val category = name
            override val totalSpend: BigDecimal = spend
            override val totalCo2Kg: BigDecimal = co2
            override val avgEsgScore: Double = avgEsg
            override val transactionCount = count
        }

    @Test
    fun `getSummary with no transactions returns zeros`() {
        every { transactionRepository.aggregateSummary() } returns summary(BigDecimal.ZERO, null, 0)
        every { transactionRepository.aggregateMonthlyTrend() } returns emptyList()

        val result = service.getSummary()

        assertEquals(BigDecimal.ZERO, result.totalCo2Kg)
        assertEquals(0, result.transactionCount)
        assertEquals(0, result.avgEsgScore)
        assertTrue(result.monthlyTrend.isEmpty())
    }

    @Test
    fun `getSummary maps projection rows to DTO`() {
        every { transactionRepository.aggregateSummary() } returns
            summary(BigDecimal("3.0"), 50.0, 2)
        every { transactionRepository.aggregateMonthlyTrend() } returns listOf(
            month(2026, 1, BigDecimal("3.0"), 50.0, 2)
        )

        val result = service.getSummary()

        assertEquals(BigDecimal("3.0"), result.totalCo2Kg)
        assertEquals(50, result.avgEsgScore)
        assertEquals(2, result.transactionCount)
        assertEquals(1, result.monthlyTrend.size)
        assertEquals("2026-01", result.monthlyTrend[0].month)
        assertEquals(BigDecimal("3.0"), result.monthlyTrend[0].co2Kg)
        assertEquals(50, result.monthlyTrend[0].esgScore)
        assertEquals(2, result.monthlyTrend[0].transactionCount)
    }

    @Test
    fun `getSummary preserves repository ordering for monthly trend`() {
        every { transactionRepository.aggregateSummary() } returns
            summary(BigDecimal("10.0"), 55.0, 4)
        every { transactionRepository.aggregateMonthlyTrend() } returns listOf(
            month(2026, 3, BigDecimal("4.0"), 60.0, 2),
            month(2026, 1, BigDecimal("6.0"), 50.0, 2)
        )

        val result = service.getSummary()

        assertEquals(listOf("2026-03", "2026-01"), result.monthlyTrend.map { it.month })
    }

    @Test
    fun `getSummary formats single-digit months with leading zero`() {
        every { transactionRepository.aggregateSummary() } returns
            summary(BigDecimal("1.0"), 40.0, 1)
        every { transactionRepository.aggregateMonthlyTrend() } returns listOf(
            month(2026, 2, BigDecimal("1.0"), 40.0, 1)
        )

        val result = service.getSummary()

        assertEquals("2026-02", result.monthlyTrend[0].month)
    }

    @Test
    fun `getCategorySummaries maps projection rows to DTO`() {
        every { transactionRepository.aggregateByCategory() } returns listOf(
            category("Food", BigDecimal("100.00"), BigDecimal("4.0"), 50.0, 2)
        )

        val result = service.getCategorySummaries()

        assertEquals(1, result.size)
        val food = result[0]
        assertEquals("Food", food.category)
        assertEquals(BigDecimal("100.00"), food.totalSpend)
        assertEquals(BigDecimal("4.0"), food.totalCo2Kg)
        assertEquals(50, food.avgEsgScore)
        assertEquals(2, food.transactionCount)
    }

    @Test
    fun `getCategorySummaries preserves repository ordering`() {
        every { transactionRepository.aggregateByCategory() } returns listOf(
            category("Transport", BigDecimal("50.00"), BigDecimal("8.0"), 30.0, 1),
            category("Food", BigDecimal("100.00"), BigDecimal("4.0"), 50.0, 2)
        )

        val result = service.getCategorySummaries()

        assertEquals(listOf("Transport", "Food"), result.map { it.category })
    }
}
