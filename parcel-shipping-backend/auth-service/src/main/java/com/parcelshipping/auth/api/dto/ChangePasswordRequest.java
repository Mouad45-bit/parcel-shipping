package com.parcelshipping.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank(
                message = "currentPassword is required"
        )
        @Size(
                max = 200,
                message = "currentPassword must not exceed 200 characters"
        )
        String currentPassword,

        @NotBlank(
                message = "newPassword is required"
        )
        @Size(
                min = 8,
                max = 200,
                message = "newPassword must contain between 8 and 200 characters"
        )
        String newPassword
) {
}
