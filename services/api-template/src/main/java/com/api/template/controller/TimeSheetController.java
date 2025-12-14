package com.api.template.controller;

import com.api.template.domain.dto.EmployeeDto;
import com.api.template.domain.dto.TimeSheetRequestDto;
import com.api.template.domain.dto.TimeSheetResponseDto;
import com.api.template.domain.dto.VehicleDto;
import com.api.template.service.TimeSheetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Controller
@RequestMapping("/api/v1")
@Slf4j
public class TimeSheetController {

    private final TimeSheetService timeSheetService;

    @Autowired // Injection explicite
    public TimeSheetController(TimeSheetService timeSheetService) {
        this.timeSheetService = timeSheetService;
    }

    @Autowired
    private ApplicationContext applicationContext;

    @PostMapping("/frais-kilometriques")
    @ResponseBody
    public TimeSheetResponseDto generateFraisKilometriques(@RequestBody TimeSheetRequestDto request, Model model) {
        YearMonth yearMonth = request.getYearMonth();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM").withLocale(Locale.FRANCE);

        // Création des DTOs avec les données
        EmployeeDto employee = EmployeeDto.of(request.getFirstName(), request.getLastName());
        VehicleDto vehicle = VehicleDto.of(request.getFiscalPower());

        // Informations générales
        model.addAttribute("employee", employee);
        model.addAttribute("year", yearMonth.getYear());
        model.addAttribute("monthYear", yearMonth.format(formatter));
        model.addAttribute("vehicle", vehicle);
        model.addAttribute("tripsPerWeek", request.getTripsPerWeek());
        String previousKilometers = String.format(Locale.FRANCE, "%.1f", request.getPreviousKilometers());
        model.addAttribute("previousKilometers", previousKilometers);

        // Entries du mois
        var entries = timeSheetService.generateTimeSheet(
                yearMonth.getYear(),
                yearMonth.getMonthValue(),
                request.getPreviousKilometers(),
                request.getTripsPerWeek(),
                request.getDestination(),
                request.getClient(),
                request.getKilometersPerTrip()
        );
        model.addAttribute("entries", entries);

        // Calcul du kilométrage final
        double totalMonthKilometers = entries.stream()
                .mapToDouble(entry -> entry.kilometers() != null ? entry.kilometers() : 0.0)
                .sum();
        String finalKilometers = String.format(Locale.FRANCE, "%.1f", request.getPreviousKilometers() + totalMonthKilometers);
        model.addAttribute("finalKilometers", finalKilometers);

        // Rendre la vue et récupérer le HTML
        ModelAndView modelAndView = new ModelAndView("frais-kilometriques-template");
        modelAndView.addAllObjects(model.asMap());
        String htmlContent = timeSheetService.renderView(modelAndView);

        return new TimeSheetResponseDto(
                htmlContent,
                request.year(),
                request.month(),
                request.getPreviousKilometers(),
                request.getPreviousKilometers() + totalMonthKilometers,
                request.getTripsPerWeek(),
                request.getDestination(),
                request.getClient(),
                request.kilometersPerTrip(),
                request.getFirstName(),
                request.getLastName(),
                request.getFiscalPower()
        );
    }

    @PostMapping("/timesheet")
    @ResponseBody
    public String generateTimeSheet(@RequestBody TimeSheetRequestDto request, Model model) {
        YearMonth yearMonth = request.getYearMonth();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM").withLocale(Locale.FRANCE);

        // Création des DTOs avec les données
        EmployeeDto employee = EmployeeDto.of(request.getFirstName(), request.getLastName());
        VehicleDto vehicle = VehicleDto.of(request.getFiscalPower());

        // Informations générales
        model.addAttribute("employee", employee);
        model.addAttribute("year", yearMonth.getYear());
        model.addAttribute("monthYear", yearMonth.format(formatter));
        model.addAttribute("vehicle", vehicle);
        model.addAttribute("tripsPerWeek", request.getTripsPerWeek());
        String previousKilometers = String.format(Locale.FRANCE, "%.1f", request.getPreviousKilometers());
        model.addAttribute("previousKilometers", previousKilometers);

        // Entries du mois
        var entries = timeSheetService.generateTimeSheet(
                yearMonth.getYear(),
                yearMonth.getMonthValue(),
                request.getPreviousKilometers(),
                request.getTripsPerWeek(),
                request.getDestination(),
                request.getClient(),
                request.getKilometersPerTrip()
        );
        model.addAttribute("entries", entries);

        // Rendre la vue et récupérer le HTML
        ModelAndView modelAndView = new ModelAndView("timesheet");
        modelAndView.addAllObjects(model.asMap());
        return timeSheetService.renderView(modelAndView);
    }
}
