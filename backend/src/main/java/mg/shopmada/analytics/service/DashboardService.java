package mg.shopmada.analytics.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import mg.shopmada.analytics.domain.OrderStatus;
import mg.shopmada.analytics.domain.SalesOrder;
import mg.shopmada.analytics.dto.ApiDtos.DashboardSummary;
import mg.shopmada.analytics.dto.ApiDtos.CategorySales;
import mg.shopmada.analytics.dto.ApiDtos.ProductSales;
import mg.shopmada.analytics.dto.ApiDtos.RegionSales;
import mg.shopmada.analytics.dto.ApiDtos.RevenuePoint;
import mg.shopmada.analytics.repository.OrderRepository;
import mg.shopmada.analytics.repository.projection.CategorySalesView;
import mg.shopmada.analytics.repository.projection.ProductSalesView;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private static final List<OrderStatus> EXCLUDED = List.of(OrderStatus.CANCELLED, OrderStatus.REFUNDED);
    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd/MM");
    private final OrderRepository orders;

    public DashboardService(OrderRepository orders) {
        this.orders = orders;
    }

    public DashboardSummary summary(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        long days = Duration.between(start, end).toDays();
        LocalDateTime previousStart = start.minusDays(days);
        BigDecimal revenue = orders.sumRevenue(start, end, EXCLUDED);
        BigDecimal previousRevenue = orders.sumRevenue(previousStart, start, EXCLUDED);
        long orderCount = orders.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
        long refundedCount = orders.countByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                OrderStatus.REFUNDED, start, end);
        BigDecimal change = previousRevenue.signum() == 0
                ? BigDecimal.ZERO
                : revenue.subtract(previousRevenue).multiply(BigDecimal.valueOf(100))
                        .divide(previousRevenue, 2, RoundingMode.HALF_UP);
        BigDecimal refundRate = orderCount == 0 ? BigDecimal.ZERO
                : BigDecimal.valueOf(refundedCount).multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP);
        return new DashboardSummary(revenue, change, orderCount,
                orders.countActiveCustomers(start, end, EXCLUDED), refundRate);
    }

    public List<RevenuePoint> revenueByDay(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        Map<LocalDate, BigDecimal> totals = new LinkedHashMap<>();
        Map<LocalDate, Long> counts = new LinkedHashMap<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            totals.put(day, BigDecimal.ZERO);
            counts.put(day, 0L);
        }
        for (SalesOrder order : orders.findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc(start, end)) {
            if (EXCLUDED.contains(order.getStatus())) continue;
            LocalDate day = order.getCreatedAt().toLocalDate();
            totals.computeIfPresent(day, (key, value) -> value.add(order.getTotalAmount()));
            counts.computeIfPresent(day, (key, value) -> value + 1);
        }
        return totals.entrySet().stream()
                .map(entry -> new RevenuePoint(entry.getKey().format(DAY_LABEL), entry.getValue(), counts.get(entry.getKey())))
                .toList();
    }

    public List<ProductSales> topProducts(LocalDate from, LocalDate to, int limit) {
        List<ProductSalesView> rows = orders.findTopProducts(from.atStartOfDay(), to.plusDays(1).atStartOfDay(),
                EXCLUDED, PageRequest.of(0, limit));
        return rows.stream().map(row -> new ProductSales(row.getProductId(), row.getName(), row.getCategory(),
                row.getImageUrl(), row.getUnitsSold(), row.getRevenue())).toList();
    }

            public List<CategorySales> salesByCategory(LocalDate from, LocalDate to) {
            List<CategorySalesView> rows = orders.findSalesByCategory(from.atStartOfDay(),
                to.plusDays(1).atStartOfDay(), EXCLUDED);
            return rows.stream().map(row -> new CategorySales(
                row.getCategory(), row.getRevenue(), row.getUnitsSold())).toList();
            }

    public List<RegionSales> salesByRegion(LocalDate from, LocalDate to) {
        List<SalesOrder> rows = orders.findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc(
                from.atStartOfDay(), to.plusDays(1).atStartOfDay());
        Map<String, BigDecimal> revenue = new LinkedHashMap<>();
        Map<String, Long> counts = new LinkedHashMap<>();
        for (SalesOrder order : rows) {
            if (EXCLUDED.contains(order.getStatus())) continue;
            String region = order.getCustomer().getRegion() == null ? "Non renseignée" : order.getCustomer().getRegion();
            revenue.merge(region, order.getTotalAmount(), BigDecimal::add);
            counts.merge(region, 1L, Long::sum);
        }
        return revenue.entrySet().stream().map(entry -> new RegionSales(entry.getKey(), entry.getValue(),
                counts.get(entry.getKey()))).toList();
    }

    public List<RevenuePoint> monthlyRevenue(int year) {
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = from.plusYears(1).atStartOfDay();
        Map<Integer, BigDecimal> totals = new LinkedHashMap<>();
        for (int month = 1; month <= 12; month++) totals.put(month, BigDecimal.ZERO);
        for (SalesOrder order : orders.findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc(start, end)) {
            if (!EXCLUDED.contains(order.getStatus())) {
                int month = order.getCreatedAt().getMonthValue();
                totals.merge(month, order.getTotalAmount(), BigDecimal::add);
            }
        }
        return totals.entrySet().stream().map(entry -> new RevenuePoint(
                LocalDate.of(year, entry.getKey(), 1).getMonth().getDisplayName(
                        java.time.format.TextStyle.SHORT, java.util.Locale.FRENCH), entry.getValue(), 0))
                .toList();
    }
}