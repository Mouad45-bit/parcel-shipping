package com.parcelshipping.auth.api.dto;

import com.parcelshipping.auth.domain.UserAccount;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String name,
        String username,
        String role
) {

    public static AuthUserResponse from(
            UserAccount userAccount
    ) {
        return new AuthUserResponse(
                userAccount.getId(),
                userAccount.getFullName(),
                userAccount.getUsername(),
                userAccount.getRole().name()
        );
    }
}
