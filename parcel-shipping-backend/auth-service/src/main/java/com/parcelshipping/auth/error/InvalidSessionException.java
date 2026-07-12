package com.parcelshipping.auth.error;

public class InvalidSessionException
        extends RuntimeException {

    public InvalidSessionException() {
        super(
                "The authentication session "
                        + "is no longer valid."
        );
    }
}
