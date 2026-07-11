package com.parcelshipping.auth.service;

import com.parcelshipping.auth.api.dto.LoginRequest;
import com.parcelshipping.auth.domain.UserAccount;
import com.parcelshipping.auth.error.InvalidCredentialsException;
import com.parcelshipping.auth.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    /*
     * Hash BCrypt valide utilisé lorsqu'aucun utilisateur n'existe.
     * Cela évite de supprimer entièrement le coût BCrypt dans ce cas.
     */
    private static final String DUMMY_PASSWORD_HASH =
            "$2y$12$AOTUhCBKFoNTTfIlLTXZX."
                    + "T7p81f0srN/.ChgoMg7Vt5/2d/Y06gi";

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResult login(
            LoginRequest request
    ) {
        String normalizedUsername =
                request.username().trim();

        UserAccount userAccount =
                userAccountRepository
                        .findByUsernameIgnoreCase(
                                normalizedUsername
                        )
                        .orElse(null);

        String storedPasswordHash =
                userAccount == null
                        ? DUMMY_PASSWORD_HASH
                        : userAccount.getPasswordHash();

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.password(),
                        storedPasswordHash
                );

        if (
                userAccount == null
                        || !passwordMatches
                        || !userAccount.isEnabled()
        ) {
            throw new InvalidCredentialsException();
        }

        String accessToken =
                jwtService.issueAccessToken(userAccount);

        return new LoginResult(
                userAccount,
                accessToken
        );
    }
}
