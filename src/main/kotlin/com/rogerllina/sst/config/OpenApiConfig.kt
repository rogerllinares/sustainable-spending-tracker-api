package com.rogerllina.sst.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {
    @Bean
    fun customOpenApi(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("Sustainable Spending Tracker API")
                .version("1.0.0")
                .description("REST API for carbon footprint tracking per spending category")
                .contact(Contact().name("Roger Llinares").email("roger.llinares@estudiantat.upc.edu"))
        )
}
