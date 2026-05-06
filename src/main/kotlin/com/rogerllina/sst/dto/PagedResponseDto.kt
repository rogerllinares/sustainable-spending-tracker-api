package com.rogerllina.sst.dto

import org.springframework.data.domain.Page

data class PagedResponseDto<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int
) {
    companion object {
        fun <T> from(page: Page<T>): PagedResponseDto<T> = PagedResponseDto(
            content = page.content,
            page = page.number,
            size = page.size,
            totalElements = page.totalElements,
            totalPages = page.totalPages
        )
    }
}
