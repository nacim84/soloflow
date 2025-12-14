package com.api.template.domain.dto;

import java.time.YearMonth;

public record TimeSheetRequestDto(
    Integer year,
    Integer month,
    Double previousKilometers,
    Integer tripsPerWeek,
    String destination,
    String client,
    Double kilometersPerTrip,
    String firstName,
    String lastName,
    Integer fiscalPower
) {
    // Factory method pour créer une requête avec les valeurs par défaut
    public static TimeSheetRequestDto getDefault() {
        YearMonth now = YearMonth.now();
        return new TimeSheetRequestDto(
            now.getYear(),
            now.getMonthValue(),
            0.0,
            4,
            "12 Rue Villiot, 75012 Paris",
            "CA-TS",
            42.0,
            "Nacim",
            "RABIA",
            5
        );
    }

    // Méthodes pour obtenir les valeurs avec gestion des valeurs par défaut
    public YearMonth getYearMonth() {
        YearMonth now = YearMonth.now();
        return YearMonth.of(
            year != null ? year : now.getYear(),
            month != null ? month : now.getMonthValue()
        );
    }

    public double getPreviousKilometers() {
        return previousKilometers != null ? previousKilometers : 0.0;
    }

    public Integer getTripsPerWeek() {
        return tripsPerWeek != null ? tripsPerWeek : 4;
    }

    public String getDestination() {
        return destination != null ? destination : "12 Rue Villiot, 75012 Paris";
    }

    public String getClient() {
        return client != null ? client : "CA-TS";
    }

    public Double getKilometersPerTrip() {
        return kilometersPerTrip != null ? kilometersPerTrip : 42.0;
    }

    public String getFirstName() {
        return firstName != null ? firstName : "Nacim";
    }

    public String getLastName() {
        return lastName != null ? lastName : "RABIA";
    }

    public Integer getFiscalPower() {
        return fiscalPower != null ? fiscalPower : 5;
    }
}
