package com.rogerllina.sst.controller

import com.rogerllina.sst.dto.CategorySummaryDto
import com.rogerllina.sst.dto.DashboardSummaryDto
import com.rogerllina.sst.service.DashboardService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "ESG metrics and trends")
class DashboardController(private val dashboardService: DashboardService) {

    @GetMapping("/summary")
    @Operation(summary = "Get overall ESG summary with monthly trend")
    fun summary(): ResponseEntity<DashboardSummaryDto> =
        ResponseEntity.ok(dashboardService.getSummary())

    @GetMapping("/categories")
    @Operation(summary = "Get ESG breakdown by spending category")
    fun categories(): ResponseEntity<List<CategorySummaryDto>> =
        ResponseEntity.ok(dashboardService.getCategorySummaries())
}
