package com.spendwise.expense.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

/**
 * FeignConfig - enables OpenFeign clients.
 *
 * The @EnableFeignClients annotation is placed here (on a config class)
 * rather than on the main application class, which is a cleaner pattern.
 * It scans the "client" package for interfaces annotated with @FeignClient.
 */
@Configuration
@EnableFeignClients(basePackages = "com.spendwise.expense.client")
public class FeignConfig {}
