package com.api.template.service;

import com.api.template.domain.dto.TimeSheetEntryDto;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface TimeSheetService {

    Map<Integer, Set<LocalDate>> HOLIDAYS = Map.of(
            2025, Set.of(
                    LocalDate.of(2025, 1, 1),   // Jour de l'an
                    LocalDate.of(2025, 4, 21),  // Lundi de Pâques
                    LocalDate.of(2025, 5, 1),   // Fête du Travail
                    LocalDate.of(2025, 5, 8),   // Victoire 1945
                    LocalDate.of(2025, 5, 29),  // Ascension
                    LocalDate.of(2025, 6, 9),   // Lundi de Pentecôte
                    LocalDate.of(2025, 7, 14),  // Fête nationale
                    LocalDate.of(2025, 8, 15),  // Assomption
                    LocalDate.of(2025, 11, 1),  // Toussaint
                    LocalDate.of(2025, 11, 11), // Armistice 1918
                    LocalDate.of(2025, 12, 25)  // Noël
            ),
            2026, Set.of(
                    LocalDate.of(2026, 1, 1),   // Jour de l'an
                    LocalDate.of(2026, 4, 6),   // Lundi de Pâques
                    LocalDate.of(2026, 5, 1),   // Fête du Travail
                    LocalDate.of(2026, 5, 8),   // Victoire 1945
                    LocalDate.of(2026, 5, 14),  // Ascension
                    LocalDate.of(2026, 5, 25),  // Lundi de Pentecôte
                    LocalDate.of(2026, 7, 14),  // Fête nationale
                    LocalDate.of(2026, 8, 15),  // Assomption
                    LocalDate.of(2026, 11, 1),  // Toussaint
                    LocalDate.of(2026, 11, 11), // Armistice 1918
                    LocalDate.of(2026, 12, 25)  // Noël
            ),
            2027, Set.of(
                    LocalDate.of(2027, 1, 1),   // Jour de l'an
                    LocalDate.of(2027, 3, 29),  // Lundi de Pâques
                    LocalDate.of(2027, 5, 1),   // Fête du Travail
                    LocalDate.of(2027, 5, 6),   // Ascension
                    LocalDate.of(2027, 5, 8),   // Victoire 1945
                    LocalDate.of(2027, 5, 17),  // Lundi de Pentecôte
                    LocalDate.of(2027, 7, 14),  // Fête nationale
                    LocalDate.of(2027, 8, 15),  // Assomption
                    LocalDate.of(2027, 11, 1),  // Toussaint
                    LocalDate.of(2027, 11, 11), // Armistice 1918
                    LocalDate.of(2027, 12, 25)  // Noël
            ),
            2028, Set.of(
                    LocalDate.of(2028, 1, 1),   // Jour de l'an
                    LocalDate.of(2028, 4, 17),  // Lundi de Pâques
                    LocalDate.of(2028, 5, 1),   // Fête du Travail
                    LocalDate.of(2028, 5, 8),   // Victoire 1945
                    LocalDate.of(2028, 5, 25),  // Ascension
                    LocalDate.of(2028, 6, 5),   // Lundi de Pentecôte
                    LocalDate.of(2028, 7, 14),  // Fête nationale
                    LocalDate.of(2028, 8, 15),  // Assomption
                    LocalDate.of(2028, 11, 1),  // Toussaint
                    LocalDate.of(2028, 11, 11), // Armistice 1918
                    LocalDate.of(2028, 12, 25)  // Noël
            ),
            2029, Set.of(
                    LocalDate.of(2029, 1, 1),   // Jour de l'an
                    LocalDate.of(2029, 4, 2),   // Lundi de Pâques
                    LocalDate.of(2029, 5, 1),   // Fête du Travail
                    LocalDate.of(2029, 5, 8),   // Victoire 1945
                    LocalDate.of(2029, 5, 10),  // Ascension
                    LocalDate.of(2029, 5, 21),  // Lundi de Pentecôte
                    LocalDate.of(2029, 7, 14),  // Fête nationale
                    LocalDate.of(2029, 8, 15),  // Assomption
                    LocalDate.of(2029, 11, 1),  // Toussaint
                    LocalDate.of(2029, 11, 11), // Armistice 1918
                    LocalDate.of(2029, 12, 25)  // Noël
            ),
            2030, Set.of(
                    LocalDate.of(2030, 1, 1),   // Jour de l'an
                    LocalDate.of(2030, 4, 22),  // Lundi de Pâques
                    LocalDate.of(2030, 5, 1),   // Fête du Travail
                    LocalDate.of(2030, 5, 8),   // Victoire 1945
                    LocalDate.of(2030, 5, 30),  // Ascension
                    LocalDate.of(2030, 6, 10),  // Lundi de Pentecôte
                    LocalDate.of(2030, 7, 14),  // Fête nationale
                    LocalDate.of(2030, 8, 15),  // Assomption
                    LocalDate.of(2030, 11, 1),  // Toussaint
                    LocalDate.of(2030, 11, 11), // Armistice 1918
                    LocalDate.of(2030, 12, 25)  // Noël
            )
    );

    List<TimeSheetEntryDto> generateTimeSheet(
            int year,
            int month,
            double previousKilometers,
            int tripsPerWeek,
            String destination,
            String client,
            double kilometersPerTrip
    );

    String renderView(ModelAndView modelAndView);
}
