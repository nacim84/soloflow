package com.api.template.domain.dto;

public record VehicleDto(
    int fiscalPower,
    double rateUpTo5000km,
    double rateFrom5001To20000km,
    double rateAbove20000km
) {
    public static VehicleDto of(int fiscalPower) {
        return switch (fiscalPower) {
            case 5 -> new VehicleDto(5, 0.636, 0.357, 0.427);
            case 6 -> new VehicleDto(6, 0.665, 0.374, 0.446);
            case 7 -> new VehicleDto(7, 0.697, 0.392, 0.469);
            default -> throw new IllegalArgumentException("Puissance fiscale non supportée: " + fiscalPower);
        };
    }

    public String getDisplayText() {
        return fiscalPower + " CV";
    }

    public double calculateAmount(double kilometers, double totalYearKilometers) {
        if (totalYearKilometers <= 5000) {
            return kilometers * rateUpTo5000km;
        } else if (totalYearKilometers <= 20000) {
            return kilometers * rateFrom5001To20000km + 1395;
        } else {
            return kilometers * rateAbove20000km;
        }
    }
}
