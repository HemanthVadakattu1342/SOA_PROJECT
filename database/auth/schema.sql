-- Auth Service Schema
-- Auto-created by Hibernate (ddl-auto: update)
-- This file is for documentation and manual setup reference only.

CREATE DATABASE IF NOT EXISTS spendwise_auth;
USE spendwise_auth;

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20)  NOT NULL UNIQUE,
    first_name  VARCHAR(50)  NOT NULL,
    last_name   VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    department  VARCHAR(50)  NOT NULL,
    role        VARCHAR(20)  NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME     NOT NULL,
    INDEX idx_email (email),
    INDEX idx_department (department),
    INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    user_email  VARCHAR(100),
    action      VARCHAR(50)  NOT NULL,
    description TEXT,
    ip_address  VARCHAR(50),
    timestamp   DATETIME     NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
);
