package com.spendwise.category.config;

import com.spendwise.category.entity.Category;
import com.spendwise.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the 10 default expense categories when the app starts.
 * Only runs if the categories table is empty.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            log.info("Seeding default expense categories...");
            categoryRepository.saveAll(List.of(
                cat("Travel",          "Business travel - flights, trains",       new BigDecimal("150000")),
                cat("Accommodation",   "Hotel and lodging expenses",               new BigDecimal("100000")),
                cat("Food",            "Meals and entertainment",                  new BigDecimal("50000")),
                cat("Transportation",  "Local transport - taxis, cabs, fuel",      new BigDecimal("30000")),
                cat("Software",        "Software licenses and subscriptions",      new BigDecimal("75000")),
                cat("Equipment",       "Laptops, phones, hardware",                new BigDecimal("200000")),
                cat("Office Supplies", "Stationery and printing",                  new BigDecimal("20000")),
                cat("Training",        "Courses, certifications, conferences",     new BigDecimal("100000")),
                cat("Communication",   "Internet, phone bills",                    new BigDecimal("25000")),
                cat("Other",           "Miscellaneous business expenses",          new BigDecimal("50000"))
            ));
            log.info("10 default categories created.");
        }
    }

    private Category cat(String name, String desc, BigDecimal limit) {
        return Category.builder().name(name).description(desc).budgetLimit(limit).active(true).build();
    }
}
