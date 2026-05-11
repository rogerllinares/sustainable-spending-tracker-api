package com.rogerllina.sst.service

import com.rogerllina.sst.model.Account
import com.rogerllina.sst.model.MccScore
import com.rogerllina.sst.model.Transaction
import com.rogerllina.sst.repository.AccountRepository
import com.rogerllina.sst.repository.MccScoreRepository
import com.rogerllina.sst.repository.TransactionRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.Optional
import java.util.UUID

class TransactionServiceTest {

    private val transactionRepository = mockk<TransactionRepository>()
    private val accountRepository = mockk<AccountRepository>()
    private val mccScoreRepository = mockk<MccScoreRepository>()
    private val mockBankService = mockk<MockBankService>()
    private val esgScoringService = mockk<EsgScoringService>()

    private val service = TransactionService(
        transactionRepository,
        accountRepository,
        mccScoreRepository,
        mockBankService,
        esgScoringService
    )

    private val testAccount = Account(
        id = UUID.fromString("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
        name = "Main Account",
        iban = "ES91 2100 0418 4502 0005 1332",
        currency = "EUR",
        balance = BigDecimal("2450.75")
    )

    private val testMcc = MccScore(
        mccCode = "5411",
        category = "Food",
        description = "Supermarket",
        co2PerEur = BigDecimal("0.2100"),
        esgScore = 72
    )

    @Test
    fun `seedFromMock persists transactions`() {
        val bankAccount = BankAccount(
            id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            name = "Main Account",
            iban = "ES91 2100 0418 4502 0005 1332",
            currency = "EUR",
            balance = BigDecimal("2450.75")
        )
        val bankTx1 = BankTransaction(
            id = UUID.randomUUID().toString(),
            date = LocalDateTime.now(),
            amount = BigDecimal("50.00"),
            currency = "EUR",
            merchantName = "Mercadona",
            mccCode = "5411",
            description = "Grocery shopping"
        )
        val bankTx2 = BankTransaction(
            id = UUID.randomUUID().toString(),
            date = LocalDateTime.now(),
            amount = BigDecimal("30.00"),
            currency = "EUR",
            merchantName = "Lidl",
            mccCode = "5411",
            description = "Grocery shopping"
        )

        val esgResult = EsgResult(
            co2Kg = BigDecimal("10.500"),
            esgScore = 72,
            category = "Food"
        )

        every { transactionRepository.count() } returns 0L
        every { mockBankService.getAccounts() } returns listOf(bankAccount)
        every { mockBankService.getTransactions() } returns listOf(bankTx1, bankTx2)
        every { accountRepository.findById(testAccount.id) } returns Optional.of(testAccount)
        every { mccScoreRepository.findById("5411") } returns Optional.of(testMcc)
        every { esgScoringService.score("5411", any()) } returns esgResult

        val savedSlot = slot<List<Transaction>>()
        every { transactionRepository.saveAll(capture(savedSlot)) } answers { savedSlot.captured }

        val count = service.seedFromMock()

        assertEquals(2, count)
        verify(exactly = 1) { transactionRepository.saveAll(any<List<Transaction>>()) }
        assertEquals(2, savedSlot.captured.size)
    }

    @Test
    fun `seedFromMock is idempotent — skips when transactions already exist`() {
        every { transactionRepository.count() } returns 5L

        val count = service.seedFromMock()

        assertEquals(0, count)
        verify(exactly = 0) { transactionRepository.saveAll(any<List<Transaction>>()) }
    }

    @Test
    fun `listTransactions delegates to repository`() {
        val pageable = PageRequest.of(0, 10)
        val now = LocalDateTime.now()
        val transaction = Transaction(
            id = UUID.randomUUID(),
            account = testAccount,
            mccScore = testMcc,
            date = now,
            amount = BigDecimal("50.00"),
            currency = "EUR",
            merchantName = "Mercadona",
            category = "Food",
            description = "Grocery shopping",
            co2Kg = BigDecimal("10.500"),
            esgScore = 72
        )
        val page = PageImpl(listOf(transaction), pageable, 1)

        every {
            transactionRepository.findFiltered("Food", null, null, null, null, pageable)
        } returns page

        val result = service.listTransactions(
            category = "Food",
            dateFrom = null,
            dateTo = null,
            minScore = null,
            maxScore = null,
            pageable = pageable
        )

        verify(exactly = 1) {
            transactionRepository.findFiltered("Food", null, null, null, null, pageable)
        }
        assertEquals(1, result.totalElements)
        assertEquals(1, result.content.size)
        assertEquals("Food", result.content[0].category)
    }
}
