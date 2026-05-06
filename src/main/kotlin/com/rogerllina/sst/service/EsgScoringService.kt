package com.rogerllina.sst.service

import com.rogerllina.sst.model.MccScore
import com.rogerllina.sst.repository.MccScoreRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode

data class EsgResult(val co2Kg: BigDecimal, val esgScore: Int, val category: String)

@Service
class EsgScoringService(private val mccScoreRepository: MccScoreRepository) {

    private val default = MccScore(
        mccCode = "0000",
        category = "Other",
        description = "Unknown",
        co2PerEur = BigDecimal("0.5000"),
        esgScore = 50
    )

    fun score(mccCode: String, amount: BigDecimal): EsgResult {
        val mcc = mccScoreRepository.findById(mccCode).orElse(default)
        val co2Kg = amount.multiply(mcc.co2PerEur).setScale(3, RoundingMode.HALF_UP)
        return EsgResult(co2Kg = co2Kg, esgScore = mcc.esgScore, category = mcc.category)
    }
}
