package com.jiyibi.app.di

import com.jiyibi.app.core.data.repository.AccountRepositoryImpl
import com.jiyibi.app.core.data.repository.BudgetRepositoryImpl
import com.jiyibi.app.core.data.repository.CategoryRepositoryImpl
import com.jiyibi.app.core.data.repository.DebtRepositoryImpl
import com.jiyibi.app.core.data.repository.RecurringRepositoryImpl
import com.jiyibi.app.core.data.repository.TransactionRepositoryImpl
import com.jiyibi.app.core.domain.repository.AccountRepository
import com.jiyibi.app.core.domain.repository.BudgetRepository
import com.jiyibi.app.core.domain.repository.CategoryRepository
import com.jiyibi.app.core.domain.repository.DebtRepository
import com.jiyibi.app.core.domain.repository.RecurringRepository
import com.jiyibi.app.core.domain.repository.TransactionRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds @Singleton
    abstract fun bindTransactionRepo(impl: TransactionRepositoryImpl): TransactionRepository

    @Binds @Singleton
    abstract fun bindAccountRepo(impl: AccountRepositoryImpl): AccountRepository

    @Binds @Singleton
    abstract fun bindCategoryRepo(impl: CategoryRepositoryImpl): CategoryRepository

    @Binds @Singleton
    abstract fun bindBudgetRepo(impl: BudgetRepositoryImpl): BudgetRepository

    @Binds @Singleton
    abstract fun bindRecurringRepo(impl: RecurringRepositoryImpl): RecurringRepository

    @Binds @Singleton
    abstract fun bindDebtRepo(impl: DebtRepositoryImpl): DebtRepository
}
