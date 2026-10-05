package mg.shopmada.analytics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import mg.shopmada.analytics.domain.OrderStatus;
import mg.shopmada.analytics.dto.ApiDtos.DashboardSummary;
import mg.shopmada.analytics.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {
    @Mock
    private OrderRepository orders;

    @InjectMocks
    private DashboardService service;

    @Test
    void summaryCalculatesRevenueGrowthAndRefundRate() {
        when(orders.sumRevenue(any(LocalDateTime.class), any(LocalDateTime.class), any()))
                .thenReturn(new BigDecimal("1500.00"), new BigDecimal("1000.00"));
        when(orders.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any())).thenReturn(10L);
        when(orders.countByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                eq(OrderStatus.REFUNDED), any(), any())).thenReturn(1L);
        when(orders.countActiveCustomers(any(), any(), any())).thenReturn(7L);

        DashboardSummary result = service.summary(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 30));

        assertThat(result.revenue()).isEqualByComparingTo("1500.00");
        assertThat(result.revenueChangePercent()).isEqualByComparingTo("50.00");
        assertThat(result.orderCount()).isEqualTo(10);
        assertThat(result.activeCustomers()).isEqualTo(7);
        assertThat(result.refundRatePercent()).isEqualByComparingTo("10.00");
    }
}