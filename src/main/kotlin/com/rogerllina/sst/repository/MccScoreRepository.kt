package com.rogerllina.sst.repository

import com.rogerllina.sst.model.MccScore
import org.springframework.data.jpa.repository.JpaRepository

interface MccScoreRepository : JpaRepository<MccScore, String>
