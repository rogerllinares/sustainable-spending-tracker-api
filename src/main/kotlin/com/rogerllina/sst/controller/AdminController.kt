package com.rogerllina.sst.controller

import com.rogerllina.sst.service.TransactionService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Administrative endpoints")
class AdminController(private val transactionService: TransactionService) {

    @PostMapping("/seed")
    @Operation(summary = "Seed database with mock bank transactions")
    fun seed(): ResponseEntity<Map<String, Any>> {
        val count = transactionService.seedFromMock()
        return ResponseEntity.ok(mapOf("seeded" to count, "message" to "Seeded $count transactions successfully"))
    }
}
