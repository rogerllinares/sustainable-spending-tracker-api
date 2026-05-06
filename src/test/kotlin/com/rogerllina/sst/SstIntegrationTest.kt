package com.rogerllina.sst

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpStatus
import org.springframework.test.context.ActiveProfiles

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SstIntegrationTest {

    @Autowired
    lateinit var restTemplate: TestRestTemplate

    @Test
    fun `seed endpoint persists transactions and dashboard returns data`() {
        // 1. Seed
        val seedResponse = restTemplate.postForEntity("/api/admin/seed", null, Map::class.java)
        assertThat(seedResponse.statusCode).isEqualTo(HttpStatus.OK)
        val seeded = (seedResponse.body!!["seeded"] as Number).toLong()
        assertThat(seeded).isGreaterThan(0)

        // 2. List transactions
        val txResponse = restTemplate.getForEntity("/api/transactions", Map::class.java)
        assertThat(txResponse.statusCode).isEqualTo(HttpStatus.OK)
        val totalElements = (txResponse.body!!["totalElements"] as Number).toLong()
        assertThat(totalElements).isGreaterThan(0)

        // 3. Dashboard summary
        val summaryResponse = restTemplate.getForEntity("/api/dashboard/summary", Map::class.java)
        assertThat(summaryResponse.statusCode).isEqualTo(HttpStatus.OK)
        val transactionCount = (summaryResponse.body!!["transactionCount"] as Number).toInt()
        assertThat(transactionCount).isGreaterThan(0)

        // 4. Dashboard categories
        val catResponse = restTemplate.getForEntity("/api/dashboard/categories", List::class.java)
        assertThat(catResponse.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(catResponse.body).isNotEmpty
    }
}
