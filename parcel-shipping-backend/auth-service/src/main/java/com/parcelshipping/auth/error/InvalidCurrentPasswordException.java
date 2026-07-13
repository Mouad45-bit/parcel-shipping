package com.parcelshipping.auth.error;

public class InvalidCurrentPasswordException
        extends RuntimeException {

    public InvalidCurrentPasswordException() {
        super("The current password is incorrect.");
    }
}
