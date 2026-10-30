package com.spendwise.expense.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApprovalRequest {
    // Required when rejecting an expense
    private String rejectionReason;
}
