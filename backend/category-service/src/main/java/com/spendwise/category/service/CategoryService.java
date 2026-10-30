package com.spendwise.category.service;

import com.spendwise.category.dto.CategoryDto;
import com.spendwise.category.dto.CategoryRequest;
import com.spendwise.category.entity.Category;
import com.spendwise.category.exception.ResourceAlreadyExistsException;
import com.spendwise.category.exception.ResourceNotFoundException;
import com.spendwise.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CategoryService - business logic for expense categories.
 *
 * Categories like "Travel", "Food", "Equipment" are managed here.
 * The Expense Service calls this service (via OpenFeign) to validate
 * that a category exists when an employee submits an expense.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /** Get all active categories - used by the expense form dropdown */
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findByActive(true)
                .stream().map(this::toDto).toList();
    }

    /** Get all categories (including inactive) - for admin view */
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream().map(this::toDto).toList();
    }

    /** Get single category by ID - used by Expense Service via Feign */
    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    /** Create a new category - FINANCE_ADMIN / SYSTEM_ADMIN only */
    public CategoryDto createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Category already exists: " + request.getName());
        }
        Category saved = categoryRepository.save(Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon() != null ? request.getIcon() : "🏷️")
                .budgetLimit(request.getBudgetLimit())
                .budgetLimitPercentage(request.getBudgetLimitPercentage() != null ? request.getBudgetLimitPercentage() : 100)
                .active(true)
                .build());
        log.info("Category created: {}", saved.getName());
        return toDto(saved);
    }

    /** Update an existing category */
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check name uniqueness only if name is changing
        if (!cat.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Category name already exists: " + request.getName());
        }

        cat.setName(request.getName());
        if (request.getDescription() != null) cat.setDescription(request.getDescription());
        if (request.getBudgetLimit() != null) cat.setBudgetLimit(request.getBudgetLimit());

        return toDto(categoryRepository.save(cat));
    }

    /** Deactivate a category (soft delete) */
    public void deactivateCategory(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        cat.setActive(false);
        categoryRepository.save(cat);
        log.info("Category deactivated: {}", cat.getName());
    }

    private CategoryDto toDto(Category cat) {
        return CategoryDto.builder()
                .id(cat.getId())
                .name(cat.getName())
                .description(cat.getDescription())
                .icon(cat.getIcon())
                .budgetLimit(cat.getBudgetLimit())
                .budgetLimitPercentage(cat.getBudgetLimitPercentage())
                .active(cat.isActive())
                .createdAt(cat.getCreatedAt())
                .build();
    }
}
