package com.rogerllina.sst.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Duration

@Configuration
class SecurityConfig(
    @Value("\${admin.token:}") private val adminToken: String
) {

    @Bean
    fun adminTokenFilter(): OncePerRequestFilter = object : OncePerRequestFilter() {
        override fun doFilterInternal(
            request: HttpServletRequest,
            response: HttpServletResponse,
            filterChain: FilterChain
        ) {
            if (request.requestURI.startsWith("/api/admin/")) {
                val provided = request.getHeader("X-Admin-Token")
                if (adminToken.isBlank() || provided != adminToken) {
                    response.status = HttpStatus.UNAUTHORIZED.value()
                    response.contentType = "application/json"
                    response.writer.write("""{"error":"unauthorized"}""")
                    return
                }
            }
            filterChain.doFilter(request, response)
        }
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity, @Qualifier("adminTokenFilter") adminFilter: OncePerRequestFilter): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { }
            .authorizeHttpRequests { it.anyRequest().permitAll() }
            .headers { headers ->
                headers
                    .frameOptions { it.deny() }
                    .contentTypeOptions { }
                    .httpStrictTransportSecurity {
                        it.includeSubDomains(true).maxAgeInSeconds(Duration.ofDays(365).seconds)
                    }
                    .referrerPolicy {
                        it.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                    }
            }
            .addFilterBefore(adminFilter, UsernamePasswordAuthenticationFilter::class.java)
        return http.build()
    }
}
