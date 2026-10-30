package com.spendwise.budget.repository;

import com.spendwise.budget.entity.Budget;
import com.spendwise.budget.entity.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByDepartment(String department);

    List<Budget> findByDepartmentAndFinancialYearAndMonth(
        String department, Integer year, Integer month
    );

    Optional<Budget> findByDepartmentAndCategoryIdAndFinancialYearAndMonth(
        String department, Long categoryId, Integer year, Integer month
    );

    List<Budget> findByFinancialYearAndMonth(Integer year, Integer month);

    // Get budgets with WARNING, CRITICAL, or EXCEEDED status (alerts)
    List<Budget> findByStatusIn(List<BudgetStatus> statuses);

    // For reconciliation report
    @Query("SELECT b FROM Budget b WHERE b.financialYear = :year AND b.month = :month ORDER BY b.utilizationPercentage DESC")
    List<Budget> findAllForMonthOrderByUtilization(Integer year, Integer month);
}
