package com.rogerllina.sst.service

import com.rogerllina.sst.model.Account
import com.rogerllina.sst.model.MccScore
import com.rogerllina.sst.model.Transaction
import com.rogerllina.sst.repository.TransactionRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

class DashboardServiceTest {

    private val transactionRepository = mockk<TransactionRepository>()
    private val service = DashboardService(transactionRepository)

    private val account = Account(
        id = UUID.randomUUID(),
        name = "Test Account",
        iban = "ES12345678901234567890",
        currency = "EUR",
        balance = BigDecimal("1000.00")
    )

    private val mccScore = MccScore(
        mccCode = "5411",
        category = "Food",
        description = "Supermarket",
        co2PerEur = BigDecimal("0.21"),
        esgScore = 72
    )

    private fun makeTransaction(
        co2Kg: BigDecimal,
        esgScore: Int,
        category: String = "Food",
        date: LocalDateTime = LocalDateTime.of(2026, 1, 15, 10, 0),
        amount: BigDecimal = BigDecimal("50.00")
    ) = Transaction(
        id = UUID.randomUUID(),
        account = account,
        mccScore = mccScore,
        date = date,
        amount = amount,
        currency = "EUR",
        merchantName = "Merchant",
        category = category,
        description = "desc",
        co2Kg = co2Kg,
        esgScore = esgScore
    )

    @Test
    fun `getSummary with empty transactions returns zeros`() {
        every { transactionRepository.findAll() } returns emptyList()

        val result = service.getSummary()

        assertEquals(BigDecimal.ZERO, result.totalCo2Kg)
        assertEquals(0, result.transactionCount)
        assertEquals(0, result.avgEsgScore)
        assertTrue(result.monthlyTrend.isEmpty())
    }

    @Test
    fun `getSummary aggregates correctly`() {
        val jan2026 = LocalDateTime.of(2026, 1, 15, 10, 0)
        val t1 = makeTransaction(co2Kg = BigDecimal("1.0"), esgScore = 40, date = jan2026)
        val t2 = makeTransaction(co2Kg = BigDecimal("2.0"), esgScore = 60, date = jan2026)
        every { transactionRepository.findAll() } returns listOf(t1, t2)

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
    fun `getCategorySummaries groups by category`() {
        val t1 = makeTransaction(co2Kg = BigDecimal("1.5"), esgScore = 40, category = "Food", amount = BigDecimal("30.00"))
        val t2 = makeTransaction(co2Kg = BigDecimal("2.5"), esgScore = 60, category = "Food", amount = BigDecimal("70.00"))
        every { transactionRepository.findAll() } returns listOf(t1, t2)

        val result = service.getCategorySummaries()

        assertEquals(1, result.size)
        val food = result[0]
        assertEquals("Food", food.category)
        assertEquals(BigDecimal("100.00"), food.totalSpend)
        assertEquals(BigDecimal("4.0"), food.totalCo2Kg)
        assertEquals(50, food.avgEsgScore)
        assertEquals(2, food.transactionCount)
    }
}
