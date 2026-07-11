package com.parcelshipping.auth.service;

import com.parcelshipping.auth.domain.UserAccount;

public record LoginResult(
        UserAccount user,
        String accessToken
) {
}
