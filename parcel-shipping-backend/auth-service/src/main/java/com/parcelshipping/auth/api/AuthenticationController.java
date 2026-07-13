package com.parcelshipping.auth.api;

import com.parcelshipping.auth.api.dto.AuthUserResponse;
import com.parcelshipping.auth.api.dto.CurrentUserResponse;
import com.parcelshipping.auth.api.dto.LoginRequest;
import com.parcelshipping.auth.api.dto.LoginResponse;
import com.parcelshipping.auth.domain.UserAccount;
import com.parcelshipping.auth.service.AuthenticatedUserService;
import com.parcelshipping.auth.service.AuthenticationService;
import com.parcelshipping.auth.service.JwtCookieFactory;
import com.parcelshipping.auth.service.LoginResult;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.parcelshipping.auth.api.dto.ChangePasswordRequest;
import com.parcelshipping.auth.api.dto.CsrfTokenResponse;
import com.parcelshipping.auth.service.PasswordService;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.PatchMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

        private final AuthenticationService authenticationService;
        private final AuthenticatedUserService authenticatedUserService;
        private final PasswordService passwordService;
        private final JwtCookieFactory jwtCookieFactory;

        public AuthenticationController(
                        AuthenticationService authenticationService,
                        AuthenticatedUserService authenticatedUserService,
                        PasswordService passwordService,
                        JwtCookieFactory jwtCookieFactory) {
                this.authenticationService = authenticationService;

                this.authenticatedUserService = authenticatedUserService;

                this.passwordService = passwordService;

                this.jwtCookieFactory = jwtCookieFactory;
        }

        @PostMapping("/login")
        public ResponseEntity<LoginResponse> login(
                        @Valid @RequestBody LoginRequest request) {
                LoginResult loginResult = authenticationService.login(request);

                ResponseCookie accessTokenCookie = jwtCookieFactory.createAccessTokenCookie(
                                loginResult.accessToken());

                LoginResponse response = new LoginResponse(
                                AuthUserResponse.from(
                                                loginResult.user()));

                return ResponseEntity
                                .ok()
                                .header(
                                                HttpHeaders.SET_COOKIE,
                                                accessTokenCookie.toString())
                                .cacheControl(CacheControl.noStore())
                                .header(HttpHeaders.PRAGMA, "no-cache")
                                .body(response);
        }

        @GetMapping("/me")
        public ResponseEntity<CurrentUserResponse> getCurrentUser(
                        @AuthenticationPrincipal Jwt jwt) {
                UserAccount userAccount = authenticatedUserService
                                .getAuthenticatedUser(jwt);

                CurrentUserResponse response = new CurrentUserResponse(
                                AuthUserResponse.from(userAccount));

                return ResponseEntity
                                .ok()
                                .cacheControl(CacheControl.noStore())
                                .header(HttpHeaders.PRAGMA, "no-cache")
                                .body(response);
        }

        @GetMapping("/csrf")
        public ResponseEntity<CsrfTokenResponse> getCsrfToken(
                        CsrfToken csrfToken) {
                CsrfTokenResponse response = new CsrfTokenResponse(
                                csrfToken.getToken(),
                                csrfToken.getHeaderName());

                return ResponseEntity
                                .ok()
                                .cacheControl(CacheControl.noStore())
                                .header(HttpHeaders.PRAGMA, "no-cache")
                                .body(response);
        }

        @PatchMapping("/password")
        public ResponseEntity<Void> changePassword(
                        @AuthenticationPrincipal Jwt jwt,
                        @Valid @RequestBody ChangePasswordRequest request) {
                passwordService.changePassword(
                                jwt,
                                request);

                return ResponseEntity
                                .noContent()
                                .cacheControl(CacheControl.noStore())
                                .header(HttpHeaders.PRAGMA, "no-cache")
                                .build();
        }

        @PostMapping("/logout")
        public ResponseEntity<Void> logout() {
                ResponseCookie expiredAccessTokenCookie = jwtCookieFactory
                                .createExpiredAccessTokenCookie();

                return ResponseEntity
                                .noContent()
                                .header(
                                                HttpHeaders.SET_COOKIE,
                                                expiredAccessTokenCookie.toString())
                                .cacheControl(CacheControl.noStore())
                                .header(HttpHeaders.PRAGMA, "no-cache")
                                .build();
        }
}
