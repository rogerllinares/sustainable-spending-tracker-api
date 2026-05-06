package com.rogerllina.sst.service

import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime
import java.util.Random
import java.util.UUID

data class BankTransaction(
    val id: String,
    val date: LocalDateTime,
    val amount: BigDecimal,
    val currency: String,
    val merchantName: String,
    val mccCode: String,
    val description: String
)

data class BankAccount(
    val id: String,
    val name: String,
    val iban: String,
    val currency: String,
    val balance: BigDecimal
)

@Service
class MockBankService {

    private val merchants = listOf(
        Triple("Mercadona",        "5411", "Grocery shopping"),
        Triple("Lidl",             "5411", "Grocery shopping"),
        Triple("Repsol",           "5541", "Fuel"),
        Triple("TMB Metro",        "4111", "Metro card top-up"),
        Triple("Uber",             "4121", "Ride"),
        Triple("McDonald's",       "5812", "Fast food"),
        Triple("Burger King",      "5814", "Fast food"),
        Triple("Zara",             "5651", "Clothing"),
        Triple("H&M",              "5691", "Clothing"),
        Triple("Media Markt",      "5734", "Electronics"),
        Triple("El Corte Inglés",  "5311", "Department store"),
        Triple("Netflix",          "7812", "Streaming subscription"),
        Triple("Booking.com",      "7011", "Hotel reservation"),
        Triple("Endesa",           "4900", "Electricity bill"),
        Triple("Farmacia",         "5912", "Pharmacy"),
        Triple("Dr. García",       "8011", "Medical consultation")
    )

    fun getTransactions(): List<BankTransaction> {
        val random = Random(42)
        val now = LocalDateTime.now()
        return buildList {
            for (monthsAgo in 0..5) {
                val base = now.minusMonths(monthsAgo.toLong()).withDayOfMonth(1)
                repeat(15) {
                    val (name, mcc, desc) = merchants[random.nextInt(merchants.size)]
                    val amount = BigDecimal(random.nextDouble() * 115 + 5)
                        .setScale(2, RoundingMode.HALF_UP)
                    add(BankTransaction(
                        id = UUID.randomUUID().toString(),
                        date = base.plusDays(random.nextLong(28)).plusHours(random.nextLong(24)),
                        amount = amount,
                        currency = "EUR",
                        merchantName = name,
                        mccCode = mcc,
                        description = desc
                    ))
                }
            }
        }
    }

    fun getAccounts(): List<BankAccount> = listOf(
        BankAccount(
            id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            name = "Main Account",
            iban = "ES91 2100 0418 4502 0005 1332",
            currency = "EUR",
            balance = BigDecimal("2450.75")
        )
    )
}
