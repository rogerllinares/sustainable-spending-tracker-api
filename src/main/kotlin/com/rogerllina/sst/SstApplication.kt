package com.rogerllina.sst

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SstApplication

fun main(args: Array<String>) {
	runApplication<SstApplication>(*args)
}
