package com.api.template.domain.dto;

public record EmployeeDto(
    String firstName,
    String lastName,
    String fullName
) {
    public static EmployeeDto of(String firstName, String lastName) {
        return new EmployeeDto(
            firstName,
            lastName,
            String.format("%s %s", lastName.toUpperCase(), firstName)
        );
    }
}
