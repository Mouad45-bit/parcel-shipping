package com.parcelshipping.auth.service;

import com.parcelshipping.auth.domain.UserAccount;
import com.parcelshipping.auth.error.InvalidSessionException;
import com.parcelshipping.auth.repository.UserAccountRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthenticatedUserService {

    private final UserAccountRepository userAccountRepository;

    public AuthenticatedUserService(
            UserAccountRepository userAccountRepository
    ) {
        this.userAccountRepository =
                userAccountRepository;
    }

    @Transactional(readOnly = true)
    public UserAccount getAuthenticatedUser(
            Jwt jwt
    ) {
        UUID userId = parseUserId(
                jwt.getSubject()
        );

        UserAccount userAccount =
                userAccountRepository
                        .findById(userId)
                        .orElseThrow(
                                InvalidSessionException::new
                        );

        if (!userAccount.isEnabled()) {
            throw new InvalidSessionException();
        }

        return userAccount;
    }

    private UUID parseUserId(
            String subject
    ) {
        if (subject == null || subject.isBlank()) {
            throw new InvalidSessionException();
        }

        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException exception) {
            throw new InvalidSessionException();
        }
    }
}
