package com.api.template.domain.dto;

import lombok.Builder;

@Builder
public record TimeSheetResponseDto(
        String htmlContent,
        Integer year,
        Integer month,
        Double previousKilometers,
        Double finalKilometers,
        Integer tripsPerWeek,
        String destination,
        String client,
        Double kilometersPerTrip,
        String firstName,
        String lastName,
        Integer fiscalPower) {}
