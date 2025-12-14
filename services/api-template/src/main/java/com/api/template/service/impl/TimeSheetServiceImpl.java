package com.api.template.service.impl;

import com.api.template.domain.dto.TimeSheetEntryDto;
import com.api.template.service.TimeSheetService;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.ModelAndView;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;

@Service
@Slf4j
public class TimeSheetServiceImpl implements TimeSheetService {

    private final SpringTemplateEngine templateEngine;
    private final ApplicationContext applicationContext;

    public TimeSheetServiceImpl(ApplicationContext applicationContext, SpringTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
        this.applicationContext = applicationContext;
    }

    private Set<LocalDate> getHolidaysForYear(int year) {
        return HOLIDAYS.getOrDefault(year, Collections.emptySet());
    }

    private Map<DayOfWeek, String> getTripDays(int tripsPerWeek) {
        Map<DayOfWeek, String> destinations = new LinkedHashMap<>();

        // Distribution des déplacements sur la semaine, en commençant par le mardi
        switch(tripsPerWeek) {
            case 5 -> {
                destinations.put(DayOfWeek.MONDAY, null);
                destinations.put(DayOfWeek.TUESDAY, null);
                destinations.put(DayOfWeek.WEDNESDAY, null);
                destinations.put(DayOfWeek.THURSDAY, null);
                destinations.put(DayOfWeek.FRIDAY, null);
            }
            case 4 -> {
                destinations.put(DayOfWeek.TUESDAY, null);
                destinations.put(DayOfWeek.WEDNESDAY, null);
                destinations.put(DayOfWeek.THURSDAY, null);
                destinations.put(DayOfWeek.FRIDAY, null);
            }
            case 3 -> {
                destinations.put(DayOfWeek.TUESDAY, null);
                destinations.put(DayOfWeek.WEDNESDAY, null);
                destinations.put(DayOfWeek.THURSDAY, null);
            }
            case 2 -> {
                destinations.put(DayOfWeek.TUESDAY, null);
                destinations.put(DayOfWeek.THURSDAY, null);
            }
            case 1 -> destinations.put(DayOfWeek.TUESDAY, null);
        }

        return destinations;
    }

    @Override
    public List<TimeSheetEntryDto> generateTimeSheet(
            int year,
            int month,
            double previousKilometers,
            int tripsPerWeek,
            String destination,
            String client,
            double kilometersPerTrip) {

        if (tripsPerWeek < 1 || tripsPerWeek > 5) {
            throw new IllegalArgumentException("Le nombre de déplacements par semaine doit être compris entre 1 et 5");
        }

        List<TimeSheetEntryDto> entries = new ArrayList<>();
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        double currentKilometers = previousKilometers;

        Map<DayOfWeek, String> tripDays = getTripDays(tripsPerWeek);

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            String dayOfWeek = capitalizeFirstLetter(date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.FRANCE));
            boolean isHoliday = getHolidaysForYear(year).contains(date);
            boolean isWeekend = date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;

            TimeSheetEntryDto entry;
            if (!isWeekend && !isHoliday && tripDays.containsKey(date.getDayOfWeek())) {
                currentKilometers += kilometersPerTrip;
                entry = TimeSheetEntryDto.regularTrip(
                        date,
                        dayOfWeek,
                        destination,
                        client,
                        kilometersPerTrip,
                        calculateAmount(kilometersPerTrip, currentKilometers)
                );
            } else {
                entry = TimeSheetEntryDto.empty(date, isWeekend, isHoliday ,dayOfWeek);
            }

            entries.add(entry);
        }

        return entries;
    }

    @Override
    public String renderView(ModelAndView modelAndView) {
        Context context = new Context();
        Map<String, Object> modelMap = modelAndView.getModel();
        context.setVariables(modelMap);

        return this.templateEngine.process(Objects.requireNonNull(modelAndView.getViewName()), context);
    }

    private double calculateAmount(double kilometers, double totalKilometers) {

        // Barème 2025 pour une voiture de 5 CV
        //        if (totalKilometers <= 5000) {
        //            return kilometers * 0.636;
        //        } else if (totalKilometers <= 20000) {
        //            return (kilometers * 0.357) + 1395;
        //        } else {
        //            return kilometers * 0.427;
        //        }

        // à la fin de l'année, on fait la régule par rapport au barème 2025
        return kilometers * 0.636;
    }

    private String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    }
}