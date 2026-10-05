package mg.shopmada.analytics.controller;

import java.time.LocalDate;
import java.util.List;
import mg.shopmada.analytics.dto.ApiDtos.CategorySales;
import mg.shopmada.analytics.dto.ApiDtos.DashboardSummary;
import mg.shopmada.analytics.dto.ApiDtos.ProductSales;
import mg.shopmada.analytics.dto.ApiDtos.RegionSales;
import mg.shopmada.analytics.dto.ApiDtos.RevenuePoint;
import mg.shopmada.analytics.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) { this.service = service; }

    @GetMapping("/summary")
    public DashboardSummary summary(@RequestParam(required = false) LocalDate from,
                                    @RequestParam(required = false) LocalDate to) {
        DateRange range = dateRange(from, to);
        return service.summary(range.from(), range.to());
    }

    @GetMapping("/revenue")
    public List<RevenuePoint> revenue(@RequestParam(required = false) LocalDate from,
                                      @RequestParam(required = false) LocalDate to) {
        DateRange range = dateRange(from, to);
        return service.revenueByDay(range.from(), range.to());
    }

    @GetMapping("/top-products")
    public List<ProductSales> topProducts(@RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to, @RequestParam(defaultValue = "5") int limit) {
        DateRange range = dateRange(from, to);
        return service.topProducts(range.from(), range.to(), Math.min(Math.max(limit, 1), 50));
    }

    @GetMapping("/sales-by-region")
    public List<RegionSales> salesByRegion(@RequestParam(required = false) LocalDate from,
                                           @RequestParam(required = false) LocalDate to) {
        DateRange range = dateRange(from, to);
        return service.salesByRegion(range.from(), range.to());
    }

    @GetMapping("/sales-by-category")
    public List<CategorySales> salesByCategory(@RequestParam(required = false) LocalDate from,
                                               @RequestParam(required = false) LocalDate to) {
        DateRange range = dateRange(from, to);
        return service.salesByCategory(range.from(), range.to());
    }

    private DateRange dateRange(LocalDate from, LocalDate to) {
        LocalDate end = to == null ? LocalDate.now() : to;
        LocalDate start = from == null ? end.minusDays(29) : from;
        if (start.isAfter(end)) throw new IllegalArgumentException("La date de début doit précéder la date de fin.");
        if (start.isBefore(end.minusYears(5))) throw new IllegalArgumentException("La période ne peut pas dépasser cinq ans.");
        return new DateRange(start, end);
    }

    private record DateRange(LocalDate from, LocalDate to) {}
}