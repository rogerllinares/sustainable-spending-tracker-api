package com.rogerllina.sst.model

import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "mcc_scores")
data class MccScore(
    @Id val mccCode: String,
    val category: String,
    val description: String,
    val co2PerEur: BigDecimal,
    val esgScore: Int
)
