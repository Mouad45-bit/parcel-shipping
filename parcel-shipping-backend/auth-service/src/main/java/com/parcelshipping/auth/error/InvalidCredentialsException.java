package com.parcelshipping.auth.error;

public class InvalidCredentialsException
        extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid username or password.");
    }
}
