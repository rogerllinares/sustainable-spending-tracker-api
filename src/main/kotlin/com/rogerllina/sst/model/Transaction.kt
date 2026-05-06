package com.rogerllina.sst.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "transactions")
data class Transaction(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id")
    val account: Account,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mcc_code")
    val mccScore: MccScore,
    val date: LocalDateTime,
    val amount: BigDecimal,
    val currency: String = "EUR",
    val merchantName: String,
    val category: String,
    val description: String,
    val co2Kg: BigDecimal,
    val esgScore: Int
)
