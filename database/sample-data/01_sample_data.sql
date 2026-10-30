-- =============================================================
-- SpendWise - Sample Data
-- Run this AFTER starting all services (they create the schemas)
-- =============================================================

-- Categories
USE spendwise_category;
INSERT IGNORE INTO categories (name, description, budget_limit, active, created_at, updated_at) VALUES
('Travel',           'Business travel expenses including flights and trains', 150000.00, true, NOW(), NOW()),
('Accommodation',    'Hotel and lodging expenses',                            100000.00, true, NOW(), NOW()),
('Food',             'Meals and entertainment during business trips',          50000.00, true, NOW(), NOW()),
('Transportation',   'Local transport, taxis, cabs, fuel',                    30000.00, true, NOW(), NOW()),
('Software',         'Software licenses and subscriptions',                    75000.00, true, NOW(), NOW()),
('Equipment',        'Laptops, phones, and office hardware',                  200000.00, true, NOW(), NOW()),
('Office Supplies',  'Stationery, printing, and misc office items',           20000.00, true, NOW(), NOW()),
('Training',         'Courses, certifications, and conferences',              100000.00, true, NOW(), NOW()),
('Communication',    'Internet, phone bills, and communication tools',        25000.00, true, NOW(), NOW()),
('Other',            'Miscellaneous business expenses',                       50000.00, true, NOW(), NOW());

-- Budgets (for current financial year)
USE spendwise_budget;
INSERT IGNORE INTO budgets (department, category_id, financial_year, month, allocated_amount, spent_amount, remaining_amount, utilization_percentage, status, created_at, updated_at) VALUES
('Engineering', 1, 2026, 9,  100000.00, 25000.00, 75000.00, 25.00, 'NORMAL',   NOW(), NOW()),
('Engineering', 5, 2026, 9,   75000.00, 45000.00, 30000.00, 60.00, 'NORMAL',   NOW(), NOW()),
('Engineering', 6, 2026, 9,  200000.00,175000.00, 25000.00, 87.50, 'WARNING',  NOW(), NOW()),
('Finance',     1, 2026, 9,   50000.00, 12000.00, 38000.00, 24.00, 'NORMAL',   NOW(), NOW()),
('Marketing',   1, 2026, 9,  150000.00,142000.00,  8000.00, 94.67, 'CRITICAL', NOW(), NOW()),
('Marketing',   3, 2026, 9,   50000.00, 52000.00, -2000.00,104.00, 'EXCEEDED', NOW(), NOW()),
('HR',          8, 2026, 9,  100000.00, 35000.00, 65000.00, 35.00, 'NORMAL',   NOW(), NOW()),
('Operations',  4, 2026, 9,   30000.00, 18000.00, 12000.00, 60.00, 'NORMAL',   NOW(), NOW());
