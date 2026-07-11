package com.parcelshipping.auth.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "username is required")
        @Size(
                max = 80,
                message = "username must not exceed 80 characters"
        )
        String username,

        @NotBlank(message = "password is required")
        @Size(
                max = 200,
                message = "password must not exceed 200 characters"
        )
        String password
) {
}
