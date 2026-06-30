package com.workforce.management.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for conflict scenarios (e.g., overlapping leave dates,
 * duplicate email registration).
 *
 * @ResponseStatus(HttpStatus.CONFLICT) returns a 409 HTTP response.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
