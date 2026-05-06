package com.rogerllina.sst.controller

import com.rogerllina.sst.dto.PagedResponseDto
import com.rogerllina.sst.dto.TransactionDto
import com.rogerllina.sst.service.TransactionService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Pageable
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transactions", description = "List and filter spending transactions")
class TransactionController(private val transactionService: TransactionService) {

    @GetMapping
    @Operation(summary = "List transactions with optional filters")
    fun list(
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) dateFrom: LocalDateTime?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) dateTo: LocalDateTime?,
        @RequestParam(required = false) minScore: Int?,
        @RequestParam(required = false) maxScore: Int?,
        pageable: Pageable
    ): ResponseEntity<PagedResponseDto<TransactionDto>> {
        val result = transactionService.listTransactions(category, dateFrom, dateTo, minScore, maxScore, pageable)
        return ResponseEntity.ok(result)
    }
}
