package com.rogerllina.sst.service

import com.rogerllina.sst.dto.PagedResponseDto
import com.rogerllina.sst.dto.TransactionDto
import com.rogerllina.sst.model.Account
import com.rogerllina.sst.model.MccScore
import com.rogerllina.sst.model.Transaction
import com.rogerllina.sst.repository.AccountRepository
import com.rogerllina.sst.repository.MccScoreRepository
import com.rogerllina.sst.repository.TransactionRepository
import jakarta.transaction.Transactional
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Service
class TransactionService(
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
    private val mccScoreRepository: MccScoreRepository,
    private val mockBankService: MockBankService,
    private val esgScoringService: EsgScoringService
) {

    private val fallbackMcc = MccScore(
        mccCode = "0000",
        category = "Other",
        description = "Unknown",
        co2PerEur = BigDecimal("0.5"),
        esgScore = 50
    )

    @Transactional
    fun seedFromMock(): Int {
        if (transactionRepository.count() > 0) {
            return 0
        }
        val accounts = mockBankService.getAccounts().map { bankAccount ->
            val uuid = UUID.fromString(bankAccount.id)
            accountRepository.findById(uuid).orElseGet {
                accountRepository.save(
                    Account(
                        id = uuid,
                        name = bankAccount.name,
                        iban = bankAccount.iban,
                        currency = bankAccount.currency,
                        balance = bankAccount.balance
                    )
                )
            }
        }
        val primaryAccount = accounts.first()

        val transactions = mockBankService.getTransactions().map { bankTx ->
            val esgResult = esgScoringService.score(bankTx.mccCode, bankTx.amount)
            val mcc = mccScoreRepository.findById(bankTx.mccCode).orElse(fallbackMcc)
            // All mock transactions belong to the primary account.
            val account = primaryAccount

            Transaction(
                account = account,
                mccScore = mcc,
                date = bankTx.date,
                amount = bankTx.amount,
                currency = bankTx.currency,
                merchantName = bankTx.merchantName,
                category = esgResult.category,
                description = bankTx.description,
                co2Kg = esgResult.co2Kg,
                esgScore = esgResult.esgScore
            )
        }

        transactionRepository.saveAll(transactions)
        return transactions.size
    }

    fun listTransactions(
        category: String?,
        dateFrom: LocalDateTime?,
        dateTo: LocalDateTime?,
        minScore: Int?,
        maxScore: Int?,
        pageable: Pageable
    ): PagedResponseDto<TransactionDto> {
        val page = transactionRepository.findFiltered(category, dateFrom, dateTo, minScore, maxScore, pageable)
        return PagedResponseDto.from(page.map { TransactionDto.from(it) })
    }
}
