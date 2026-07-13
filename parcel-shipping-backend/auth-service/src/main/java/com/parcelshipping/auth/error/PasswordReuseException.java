package com.parcelshipping.auth.error;

public class PasswordReuseException
        extends RuntimeException {

    public PasswordReuseException() {
        super(
                "The new password must be different "
                        + "from the current password."
        );
    }
}
