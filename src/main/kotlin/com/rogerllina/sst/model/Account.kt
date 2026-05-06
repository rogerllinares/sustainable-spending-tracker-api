package com.rogerllina.sst.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.util.UUID

@Entity
@Table(name = "accounts")
data class Account(
    @Id val id: UUID = UUID.randomUUID(),
    val name: String,
    val iban: String,
    val currency: String = "EUR",
    val balance: BigDecimal
)
