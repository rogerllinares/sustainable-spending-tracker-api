package com.rogerllina.sst.dto

import com.rogerllina.sst.model.Transaction
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

data class TransactionDto(
    val id: UUID,
    val date: LocalDateTime,
    val amount: BigDecimal,
    val currency: String,
    val merchantName: String,
    val mccCode: String,
    val category: String,
    val description: String,
    val co2Kg: BigDecimal,
    val esgScore: Int,
    val scoringRationale: String
) {
    companion object {
        fun from(t: Transaction): TransactionDto = TransactionDto(
            id = t.id,
            date = t.date,
            amount = t.amount,
            currency = t.currency,
            merchantName = t.merchantName,
            mccCode = t.mccScore.mccCode,
            category = t.category,
            description = t.description,
            co2Kg = t.co2Kg,
            esgScore = t.esgScore,
            scoringRationale = "MCC ${t.mccScore.mccCode} (${t.mccScore.description}): " +
                "${t.mccScore.co2PerEur} kg CO₂/€ × €${t.amount} = ${t.co2Kg} kg CO₂ → ESG ${t.esgScore}"
        )
    }
}
