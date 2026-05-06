package com.rogerllina.sst.repository

import com.rogerllina.sst.model.Account
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AccountRepository : JpaRepository<Account, UUID>
