package com.parcelshipping.auth.service;

import com.parcelshipping.auth.api.dto.ChangePasswordRequest;
import com.parcelshipping.auth.domain.UserAccount;
import com.parcelshipping.auth.error.InvalidCurrentPasswordException;
import com.parcelshipping.auth.error.PasswordReuseException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class PasswordService {

    private final AuthenticatedUserService authenticatedUserService;
    private final PasswordEncoder passwordEncoder;

    public PasswordService(
            AuthenticatedUserService authenticatedUserService,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticatedUserService =
                authenticatedUserService;

        this.passwordEncoder =
                passwordEncoder;
    }

    @Transactional
    public void changePassword(
            Jwt jwt,
            ChangePasswordRequest request
    ) {
        UserAccount userAccount =
                authenticatedUserService
                        .getAuthenticatedUser(jwt);

        boolean currentPasswordMatches =
                passwordEncoder.matches(
                        request.currentPassword(),
                        userAccount.getPasswordHash()
                );

        if (!currentPasswordMatches) {
            throw new InvalidCurrentPasswordException();
        }

        boolean reusesCurrentPassword =
                passwordEncoder.matches(
                        request.newPassword(),
                        userAccount.getPasswordHash()
                );

        if (reusesCurrentPassword) {
            throw new PasswordReuseException();
        }

        String newPasswordHash =
                passwordEncoder.encode(
                        request.newPassword()
                );

        userAccount.updatePasswordHash(
                newPasswordHash,
                Instant.now()
        );
    }
}
