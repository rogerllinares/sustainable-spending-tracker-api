package com.rogerllina.sst.security

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = ["admin.token=test-token-xyz"])
class SecurityConfigTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Test
    fun `admin seed without token is rejected with 401`() {
        mockMvc.perform(post("/api/admin/seed"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `admin seed with wrong token is rejected with 401`() {
        mockMvc.perform(post("/api/admin/seed").header("X-Admin-Token", "nope"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `admin seed with correct token is accepted`() {
        mockMvc.perform(post("/api/admin/seed").header("X-Admin-Token", "test-token-xyz"))
            .andExpect(status().isOk)
    }

    @Test
    fun `public endpoint serves with security headers`() {
        mockMvc.perform(get("/api/transactions").secure(true))
            .andExpect(status().isOk)
            .andExpect(header().string("X-Frame-Options", "DENY"))
            .andExpect(header().string("X-Content-Type-Options", "nosniff"))
            .andExpect(header().exists("Strict-Transport-Security"))
            .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
    }
}
