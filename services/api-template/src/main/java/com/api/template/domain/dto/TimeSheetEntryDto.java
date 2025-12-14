package com.api.template.domain.dto;

import java.time.LocalDate;

public record TimeSheetEntryDto(
    LocalDate date,
    String destination,
    String client,
    Double kilometers,
    Double totalAmount,
    boolean isWeekend,
    boolean isHoliday,
    String dayOfWeek
) {
    // Factory method pour créer une entrée vide
    public static TimeSheetEntryDto empty(LocalDate date, boolean isWeekend, boolean isHoliday, String dayOfWeek) {
        return new TimeSheetEntryDto(
            date,
            "",
            "",
            0.0,
            0.0,
                isWeekend,
                isHoliday,
            dayOfWeek
        );
    }

    // Factory method pour créer une entrée de trajet régulier
    public static TimeSheetEntryDto regularTrip(
            LocalDate date,
            String dayOfWeek,
            String destination,
            String client,
            Double kilometers,
            Double totalAmount
    ) {
        return new TimeSheetEntryDto(
            date,
            destination,
            client,
            kilometers,
            totalAmount,
            false,
            false,
            dayOfWeek
        );
    }
}
