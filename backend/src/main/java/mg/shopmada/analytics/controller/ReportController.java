package mg.shopmada.analytics.controller;

import java.time.Year;
import java.util.List;
import mg.shopmada.analytics.dto.ApiDtos.RevenuePoint;
import mg.shopmada.analytics.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final DashboardService service;

    public ReportController(DashboardService service) { this.service = service; }

    @GetMapping("/revenue")
    public List<RevenuePoint> monthlyRevenue(@RequestParam(defaultValue = "0") int year) {
        int selectedYear = year == 0 ? Year.now().getValue() : year;
        if (selectedYear < Year.now().getValue() - 5 || selectedYear > Year.now().getValue() + 1) {
            throw new IllegalArgumentException("Année de rapport invalide.");
        }
        return service.monthlyRevenue(selectedYear);
    }
}