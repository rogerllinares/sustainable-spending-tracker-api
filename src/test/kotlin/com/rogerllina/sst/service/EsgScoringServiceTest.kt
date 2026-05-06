package com.rogerllina.sst.service

import com.rogerllina.sst.model.MccScore
import com.rogerllina.sst.repository.MccScoreRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.util.Optional

class EsgScoringServiceTest {

    private val mccScoreRepository = mockk<MccScoreRepository>()
    private val service = EsgScoringService(mccScoreRepository)

    @Test
    fun `score known MCC returns correct co2 and esg`() {
        val mcc = MccScore("5411", "Food", "Supermarket", BigDecimal("0.2100"), 72)
        every { mccScoreRepository.findById("5411") } returns Optional.of(mcc)

        val result = service.score("5411", BigDecimal("100.00"))

        assertEquals(BigDecimal("21.000"), result.co2Kg)
        assertEquals(72, result.esgScore)
        assertEquals("Food", result.category)
    }

    @Test
    fun `score unknown MCC uses default values`() {
        every { mccScoreRepository.findById("9999") } returns Optional.empty()

        val result = service.score("9999", BigDecimal("50.00"))

        assertEquals(BigDecimal("25.000"), result.co2Kg)
        assertEquals(50, result.esgScore)
        assertEquals("Other", result.category)
    }

    @Test
    fun `score gas station returns low esg score`() {
        val mcc = MccScore("5541", "Transport", "Gas Station", BigDecimal("2.3000"), 12)
        every { mccScoreRepository.findById("5541") } returns Optional.of(mcc)

        val result = service.score("5541", BigDecimal("60.00"))

        assertEquals(BigDecimal("138.000"), result.co2Kg)
        assertEquals(12, result.esgScore)
    }
}
