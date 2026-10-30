# SpendWise - Corporate Financial Expense Analytics & Budget Reconciliation System

> **Stack:** Java 21 · Spring Boot 3.3 · MySQL 8 · React 18 · Netflix Eureka · OpenFeign · WebSocket/STOMP
> **Architecture:** Microservices with API Gateway · Role-Based Access Control · JWT Authentication

---

## Table of Contents
1. [Project Overview](#overview)
2. [Architecture Diagram](#architecture)
3. [Technology Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Execution / How to Run](#execution)
6. [Login Credentials](#credentials)
7. [Microservices - Full Detail](#microservices)
8. [Frontend - Full Detail](#frontend)
9. [Database Schemas](#databases)
10. [API Endpoints Reference](#api-endpoints)
11. [Security Flow](#security)
12. [Complete File Structure](#file-structure)

---

## Project Overview
SpendWise is a full-stack enterprise Corporate Expense Management System on Spring Boot Microservices.
Employees submit claims, managers approve/reject, finance admins manage budgets, system admins oversee everything.

### Key Features
- Multi-role: Employee / Manager / Finance Admin / System Admin
- Real-time notifications via WebSocket/STOMP
- Budget tracking with WARNING / CRITICAL / EXCEEDED alerts
- Budget reconciliation (allocated vs actual spending)
- Analytics dashboards with Recharts (Bar, Pie, Line)
- JWT stateless authentication across all 8 services
- Full audit logging
- Budget reconciliation (allocated vs actual spending)
- Analytics dashboards with Recharts (Bar, Pie, Line)
- JWT stateless authentication across all 8 services
- Full audit logging of all user actions

---

## Architecture Diagram
```
React Frontend (port 5173)
         |
         v
API Gateway (port 8080)   <- JWT validation + routing
         |
  +------+------+----------+------------+
  v      v      v          v            v
Auth  Expense Category  Budget   Notification  Report
8081  8082    8083      8084     8086          8085
  |      |      |          |            |
MySQL  MySQL  MySQL      MySQL         MySQL   (no DB)

All services register with Eureka Discovery Server (port 8761)
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.3, Java 21 |
| Service Discovery | Netflix Eureka |
| API Gateway | Spring Cloud Gateway |
| Inter-Service Calls | OpenFeign |
| Security | Spring Security, JWT (JJWT 0.12, HS512) |
| Database | MySQL 8.0 (5 separate databases) |
| ORM | Spring Data JPA / Hibernate (auto DDL) |
| Real-time | WebSocket + STOMP (SockJS) |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI) |
| Frontend | React 18, React Router v6, Vite |
| Charts | Recharts |
| HTTP Client | Axios |
| Styling | Vanilla CSS (dark-mode design system) |
| Build | Maven 3.8+ |

---

## Prerequisites

| Tool | Version | Check Command |
|---|---|---|
| Java JDK | 21+ | java -version |
| Maven | 3.8+ | mvn -version |
| MySQL | 8.0 | Windows service `MySQL80` |
| Node.js | 18+ | 
ode --version |
| npm | 9+ | 
pm --version |

**MySQL Setup:** Start your local MySQL server on `localhost:3306`. The launcher asks for your MySQL `root` password without saving it in the project. The five service databases are created automatically on first startup.

---

## Execution - How to Run

### Option 1: One-Click (Recommended)
```
Double-click: start-all.bat
```
Builds the backend JARs when needed, securely prompts for the MySQL root password, then starts the eight backend services and React frontend. The launcher expects Java 21+, Maven 3.8+, Node.js, npm, and MySQL on `localhost:3306`.

### Option 2: Manual Start (run each in a separate terminal, in this order)

Before starting services manually, set `DB_USERNAME=root`, `DB_PASSWORD` to your MySQL password, and the same `JWT_SECRET` in each terminal. The Windows one-click launcher handles these values for you.

**Step 1 — Eureka Discovery Server** (wait ~15 sec for it to be ready)
```bash
cd backend/discovery-server
mvn spring-boot:run
```

**Step 2 — Auth Service**
```bash
cd backend/auth-service
mvn spring-boot:run
```

**Step 3 — Category, Expense, Budget, Notification, Report Services** (any order)
```bash
cd backend/category-service     && mvn spring-boot:run
cd backend/expense-service      && mvn spring-boot:run
cd backend/budget-service       && mvn spring-boot:run
cd backend/notification-service && mvn spring-boot:run
cd backend/report-service       && mvn spring-boot:run
```

**Step 4 — API Gateway** (start last, after all services registered)
```bash
cd backend/api-gateway
mvn spring-boot:run
```

**Step 5 — React Frontend**
```bash
cd frontend
npm install        # First time only
npm run dev
```

### Access URLs After Startup

| URL | Description |
|---|---|
| http://localhost:5173 | React Frontend (main app) |
| http://localhost:8761 | Eureka Dashboard |
| http://localhost:8080/swagger-ui.html | API Gateway Swagger |
| http://localhost:8081/swagger-ui.html | Auth Service Swagger |
| http://localhost:8082/swagger-ui.html | Expense Service Swagger |
| http://localhost:8083/swagger-ui.html | Category Service Swagger |
| http://localhost:8084/swagger-ui.html | Budget Service Swagger |
| http://localhost:8085/swagger-ui.html | Report Service Swagger |
| http://localhost:8086/swagger-ui.html | Notification Service Swagger |

---

## Login Credentials

The accounts below are demo accounts created only when `spendwise_auth.users` is empty. If you already have users in MySQL, sign in with their email and password instead. Authentication reads from the `spendwise_auth` database; stored passwords must be BCrypt hashes.

| Role | Email | Password | Access |
|---|---|---|---|
| System Admin | admin@spendwise.com | Admin@123 | Full system, audit logs, all users |
| Finance Admin | finance@spendwise.com | Finance@123 | Budgets, reconciliation, categories |
| Manager | manager@spendwise.com | Manager@123 | Approve/reject team expenses |
| Employee 1 | emp1@spendwise.com | Emp@12345 | Submit expense claims |
| Employee 2 | emp2@spendwise.com | Emp@12345 | Submit expense claims |

---

## Microservices - Full Detail

### 1. Discovery Server (Port 8761)
Netflix Eureka service registry. Every microservice registers here. Gateway discovers services via lb://SERVICE-NAME.

**Functionality:**
- Services register on startup with IP and port
- Web dashboard at http://localhost:8761
- Health-checks services every 30 seconds
- Enables load-balanced routing via Spring Cloud LoadBalancer

**Files:**
```
discovery-server/src/main/java/com/spendwise/discovery/
└── DiscoveryServerApplication.java   (@EnableEurekaServer)
```

---

### 2. API Gateway (Port 8080)
Single entry point for all client requests. Validates JWT and routes to microservices.

**Functionality:**
- Validates JWT token on every protected request
- Routes: /api/auth/** -> Auth, /api/expenses/** -> Expense, /api/categories/** -> Category
- Routes: /api/budgets/** -> Budget, /api/reports/** -> Report, /api/notifications/** -> Notification
- Injects X-User-Id, X-User-Email, X-User-Role, X-User-Department headers downstream
- Public routes (no JWT): /api/auth/login, /api/auth/register, /api/notifications/send
- Global CORS config for http://localhost:5173

**Files:**
```
api-gateway/src/main/java/com/spendwise/gateway/
├── ApiGatewayApplication.java
└── filter/
    └── JwtAuthenticationFilter.java    <- Core JWT validation + header injection

api-gateway/src/main/resources/
└── application.yml                     <- Route definitions + JWT secret
```

---

### 3. Auth Service (Port 8081) -> Database: spendwise_auth
Handles user registration, login, JWT generation, and audit logging.

**Functionality:**
- POST /api/auth/login            - Login, receive JWT (24h expiry)
- POST /api/auth/register         - Register new user
- GET  /api/auth/users            - List all users (SYSTEM_ADMIN)
- GET  /api/auth/users/{id}       - Get user by ID
- PUT  /api/auth/users/{id}       - Update user profile
- GET  /api/auth/audit-logs       - Full audit trail (SYSTEM_ADMIN)
- Passwords stored as BCrypt hash
- Seeds 5 demo users on first startup via DataSeeder

**Files:**
```
auth-service/src/main/java/com/spendwise/auth/
├── AuthServiceApplication.java
├── config/
|   ├── SecurityConfig.java         <- Spring Security + BCrypt
|   └── DataSeeder.java             <- Seeds 5 users on startup
├── controller/AuthController.java
├── dto/
|   ├── LoginRequest.java           <- {email, password}
|   ├── LoginResponse.java          <- {token, userId, role, ...}
|   └── RegisterRequest.java
├── entity/
|   ├── User.java                   <- id, email, password, role, department
|   ├── Role.java                   <- Enum: EMPLOYEE/MANAGER/FINANCE_ADMIN/SYSTEM_ADMIN
|   └── AuditLog.java               <- userId, action, details, timestamp
├── repository/
|   ├── UserRepository.java
|   └── AuditLogRepository.java
├── security/
|   ├── JwtAuthenticationFilter.java
|   └── CustomUserDetailsService.java
├── service/AuthService.java
└── util/JwtUtil.java               <- generateToken(), validateToken(), getClaims()
```

---

### 4. Expense Service (Port 8082) -> Database: spendwise_expense
Core service managing the full lifecycle of expense claims.

**Expense Lifecycle:** DRAFT -> SUBMITTED -> APPROVED/REJECTED -> PAID

**Functionality:**
- POST /api/expenses                 - Create expense (any auth user)
- GET  /api/expenses/my              - My own expenses (paginated)
- GET  /api/expenses/pending         - All SUBMITTED expenses (Manager+)
- GET  /api/expenses                 - All expenses (Admin)
- GET  /api/expenses/{id}            - Get by ID
- PUT  /api/expenses/{id}            - Update (only if status=DRAFT)
- POST /api/expenses/{id}/submit     - Submit for approval
- POST /api/expenses/{id}/approve    - Approve (Manager+) -> notifies employee + updates budget
- POST /api/expenses/{id}/reject     - Reject with reason (Manager+) -> notifies employee
- GET  /api/expenses/stats           - Spending statistics
- GET  /api/expenses/department/{d} - Expenses by department
- On approval: calls Budget Service via Feign to update spending
- On approval/rejection: calls Notification Service via Feign

**Files:**
```
expense-service/src/main/java/com/spendwise/expense/
├── ExpenseServiceApplication.java
├── client/
|   ├── BudgetClient.java           <- Feign: PUT /api/budgets/update-spending
|   ├── CategoryClient.java         <- Feign: GET /api/categories/{id}
|   └── NotificationClient.java     <- Feign: POST /api/notifications/send
├── config/
|   ├── FeignConfig.java            <- Forwards JWT headers to downstream Feign calls
|   ├── SecurityConfig.java
|   └── SwaggerConfig.java
├── controller/ExpenseController.java
├── dto/
|   ├── ExpenseRequest.java         <- title, amount, categoryId, merchantName, notes
|   ├── ExpenseDto.java             <- Full response with category name
|   ├── ApprovalRequest.java        <- comments field
|   └── CategoryDto.java            <- Local mirror for Feign
├── entity/
|   ├── Expense.java                <- All fields including merchantName, notes
|   └── ExpenseStatus.java          <- Enum: DRAFT/SUBMITTED/APPROVED/REJECTED/PAID
├── exception/
|   ├── GlobalExceptionHandler.java
|   ├── ResourceNotFoundException.java
|   └── BadRequestException.java
├── repository/ExpenseRepository.java
├── security/JwtAuthenticationFilter.java
└── service/ExpenseService.java     <- All business logic + Feign orchestration
```

---

### 5. Category Service (Port 8083) -> Database: spendwise_category
Manages expense categories used in the expense submission form dropdown.

**Functionality:**
- GET    /api/categories          - Get active categories
- GET    /api/categories/active   - Active categories alias (for dropdown)
- GET    /api/categories/all      - All including inactive (Finance Admin+)
- GET    /api/categories/{id}     - Get by ID
- POST   /api/categories          - Create (Finance Admin+)
- PUT    /api/categories/{id}     - Update (Finance Admin+)
- DELETE /api/categories/{id}     - Soft-delete/deactivate (Finance Admin+)
- Seeds 14 categories on startup

**Seeded Categories:** Travel, Accommodation, Food, Transportation, Software, Equipment,
Office Supplies, Training, Communication, Other, Food & Dining, Entertainment, Medical, Fuel & Cab

**Files:**
```
category-service/src/main/java/com/spendwise/category/
├── CategoryServiceApplication.java
├── config/
|   ├── DataSeeder.java             <- Seeds 14 categories on startup
|   ├── SecurityConfig.java
|   └── SwaggerConfig.java
├── controller/CategoryController.java
├── dto/
|   ├── CategoryDto.java            <- id, name, description, icon, budgetLimitPercentage, active
|   ├── CategoryRequest.java
|   └── ApiResponse.java
├── entity/Category.java            <- id, name, description, icon, budgetLimitPercentage, active
├── exception/GlobalExceptionHandler.java
├── repository/CategoryRepository.java
├── security/JwtAuthenticationFilter.java
└── service/CategoryService.java
```

---

### 6. Budget Service (Port 8084) -> Database: spendwise_budget
Manages department/category budgets and tracks actual spending with utilization alerts.

**Budget Status Logic:**
- utilization < 80%  -> NORMAL (green)
- utilization 80-90% -> WARNING (yellow)
- utilization 90-100%-> CRITICAL (orange)
- utilization > 100% -> EXCEEDED (red)

**Functionality:**
- POST /api/budgets                      - Create budget (Finance Admin+)
- GET  /api/budgets                      - All budgets (Manager+)
- GET  /api/budgets/{id}                 - Get by ID
- GET  /api/budgets/summary              - Current month summary (all roles)
- GET  /api/budgets/alerts               - WARNING/CRITICAL/EXCEEDED budgets
- GET  /api/budgets/reconciliation       - Allocated vs Actual (Finance Admin+)
- GET  /api/budgets/department/{dept}    - Budgets by department
- PUT  /api/budgets/{id}                 - Update allocation (Finance Admin+)
- PUT  /api/budgets/update-spending      - Internal: called by Expense Service via Feign on approval

**Files:**
```
budget-service/src/main/java/com/spendwise/budget/
├── BudgetServiceApplication.java
├── config/{SecurityConfig, SwaggerConfig}.java
├── controller/BudgetController.java
├── dto/
|   ├── BudgetDto.java              <- includes utilization%, status, category name
|   ├── BudgetRequest.java          <- dept, categoryId, month, year, allocatedAmount
|   ├── ReconciliationDto.java      <- allocated, spent, remaining, utilization%
|   └── ApiResponse.java
├── entity/
|   ├── Budget.java                 <- dept, categoryId, month, year, allocated, spent
|   └── BudgetStatus.java           <- Enum: NORMAL/WARNING/CRITICAL/EXCEEDED
├── exception/GlobalExceptionHandler.java
├── repository/BudgetRepository.java
├── security/JwtAuthenticationFilter.java
└── service/BudgetService.java      <- Calculates utilization, status, reconciliation report
```

---

### 7. Report Service (Port 8085) - No Database (Pure Aggregator)
Aggregates data from Expense and Budget services to generate financial analytics.
Uses OpenFeign to call other services. Has no own database.

**Functionality:**
- GET /api/reports/dashboard          - Full dashboard: total spent, pending count, approved, budget health
- GET /api/reports/expenses/summary   - Expense breakdown by category, department, status
- GET /api/reports/budgets/summary    - Budget utilization overview across all departments

**Files:**
```
report-service/src/main/java/com/spendwise/report/
├── ReportServiceApplication.java
├── client/
|   ├── ExpenseClient.java          <- Feign: fetches expense data from expense-service
|   └── BudgetClient.java           <- Feign: fetches budget data from budget-service
├── config/{FeignConfig, SecurityConfig, SwaggerConfig}.java
├── controller/ReportController.java
├── dto/
|   ├── DashboardDto.java           <- Aggregated dashboard numbers
|   ├── ExpenseSummaryDto.java      <- Category/dept/status breakdown
|   ├── BudgetSummaryDto.java
|   └── ApiResponse.java
├── security/JwtAuthenticationFilter.java
└── (no entity or repository - stateless aggregator)
```

---

### 8. Notification Service (Port 8086) -> Database: spendwise_notification
Stores and broadcasts real-time notifications via WebSocket/STOMP.
Other services call POST /api/notifications/send via Feign (no auth required for this endpoint).

**Notification Types:**
- EXPENSE_SUBMITTED  -> sent to manager when employee submits
- EXPENSE_APPROVED   -> sent to employee when manager approves
- EXPENSE_REJECTED   -> sent to employee when manager rejects
- BUDGET_WARNING     -> sent when budget utilization hits 80%
- BUDGET_CRITICAL    -> sent when budget utilization hits 90%
- BUDGET_EXCEEDED    -> sent when budget utilization exceeds 100%

**Functionality:**
- POST /api/notifications/send          - Internal: create + broadcast (public, no JWT)
- GET  /api/notifications/my            - My notification history (paginated)
- GET  /api/notifications/unread        - Unread notifications
- GET  /api/notifications/unread-count  - Badge count for navbar
- POST /api/notifications/mark-read     - Mark all as read
- WebSocket: ws://localhost:8086/ws     - Real-time push via STOMP

**Files:**
```
notification-service/src/main/java/com/spendwise/notification/
├── NotificationServiceApplication.java
├── config/
|   ├── SecurityConfig.java
|   ├── SwaggerConfig.java
|   └── WebSocketConfig.java        <- STOMP WebSocket + SockJS configuration
├── controller/NotificationController.java
├── dto/{NotificationDto, ApiResponse}.java
├── entity/
|   └── Notification.java           <- userId, title, message, type, is_read, createdAt
├── repository/NotificationRepository.java
├── security/JwtAuthenticationFilter.java
└── service/NotificationService.java <- save to DB + push via SimpMessagingTemplate
```

---

## Frontend - Full Detail

**Tech:** React 18, Vite, React Router v6, Axios, Recharts, Vanilla CSS dark-mode

### API Layer (src/api/)
```
api/
├── axios.js          <- Base instance: http://localhost:8080, auto-attaches JWT from localStorage
├── auth.js           <- login(), logout(), getUsers(), getAuditLogs(), updateUser()
├── expenses.js       <- getMyExpenses(), createExpense(), approve(), reject(), submit()
├── categories.js     <- getActive(), getAll(), create(), update(), deactivate()
├── budgets.js        <- getSummary(), getAll(), getReconciliation(), create(), update()
├── notifications.js  <- getMy(), getUnreadCount(), getUnread(), markRead()
└── reports.js        <- getDashboard(), getExpenseSummary(), getBudgetSummary()
```

### Context (src/context/)
```
AuthContext.jsx   <- Global auth state: user, token, login(), logout(), isAuthenticated
                     Token stored in localStorage, auto-cleared on logout/expiry
```

### Components (src/components/)
```
components/
├── common/
|   ├── Loading.jsx         <- Animated spinner overlay
|   ├── ProtectedRoute.jsx  <- Wraps routes, redirects to /login if not authenticated
|   └── StatusBadge.jsx     <- Colored badge for DRAFT/SUBMITTED/APPROVED/REJECTED/EXCEEDED etc.
└── layout/
    ├── AppLayout.jsx       <- Main shell: Sidebar + Topbar + children content area
    ├── Sidebar.jsx         <- Role-aware navigation (shows only relevant links per role)
    └── Topbar.jsx          <- User name, notification badge count, logout button
```

### Pages (src/pages/)
```
pages/
├── auth/
|   └── Login.jsx                    <- Login form + quick demo login buttons per role
|
├── employee/                        (Role: EMPLOYEE)
|   ├── EmployeeDashboard.jsx        <- Stat cards, spending chart, recent expenses list
|   ├── MyExpenses.jsx               <- Paginated table with status badges + submit button
|   ├── NewExpense.jsx               <- Expense form: title, amount, category dropdown, notes
|   └── Notifications.jsx            <- Notification history + mark all read button
|
├── manager/                         (Role: MANAGER)
|   ├── ManagerDashboard.jsx         <- Pending approvals count, team stats, bar chart
|   ├── PendingApprovals.jsx         <- Table of SUBMITTED expenses + Approve/Reject buttons
|   ├── TeamExpenses.jsx             <- All team expenses with status filter
|   ├── ManagerBudgets.jsx           <- Budget utilization with color-coded progress bars
|   └── ManagerReports.jsx           <- Spending breakdown charts
|
├── finance/                         (Role: FINANCE_ADMIN)
|   ├── FinanceDashboard.jsx         <- Budget health overview, KPI cards
|   ├── BudgetManagement.jsx         <- Budget table + Create/Edit modal
|   ├── Reconciliation.jsx           <- Allocated vs Actual spending table with utilization %
|   ├── Categories.jsx               <- Category CRUD with create/edit modal
|   ├── FinanceExpenses.jsx          <- All expenses with department filter
|   └── FinanceReports.jsx           <- Detailed Bar + Pie analytics charts
|
└── admin/                           (Role: SYSTEM_ADMIN)
    ├── AdminDashboard.jsx           <- System-wide stats, service health overview
    ├── AdminUsers.jsx               <- All users, role filter buttons
    ├── AdminExpenses.jsx            <- All expenses across all users and departments
    ├── AdminCategories.jsx          <- Full category management
    ├── AdminBudgets.jsx             <- Full budget management
    ├── AdminReports.jsx             <- System-wide analytics charts
    └── AuditLogs.jsx                <- Full audit trail of all user actions
```
"# soa-project" 
