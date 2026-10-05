package mg.shopmada.analytics.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import mg.shopmada.analytics.domain.OrderStatus;
import mg.shopmada.analytics.domain.SalesChannel;

public final class ApiDtos {
    private ApiDtos() {
    }

    public record CustomerRequest(
            @NotBlank @Size(max = 140) String name,
            @NotBlank @Email @Size(max = 180) String email,
            @Size(max = 40) String phone,
            @Size(max = 100) String city,
            @Size(max = 100) String region,
            @NotBlank @Size(max = 40) String segment) {}

    public record CustomerResponse(
            Long id, String name, String email, String phone, String city,
            String region, String segment, LocalDateTime createdAt) {}

    public record CheckoutCustomerRequest(
            @NotBlank @Size(max = 140) String name,
            @NotBlank @Email @Size(max = 180) String email,
            @Size(max = 40) String phone,
            @Size(max = 100) String city,
            @Size(max = 100) String region) {}

    public record CheckoutRequest(
            @NotNull @Valid CheckoutCustomerRequest customer,
            @NotEmpty List<@Valid OrderItemRequest> items,
            @Size(max = 80) String paymentMethod) {}

    public record AdminSetupRequest(
            @NotBlank @Size(min = 3, max = 80) String username,
            @NotBlank @Size(min = 12, max = 100) String password,
            @NotBlank @Size(max = 140) String name,
            @NotBlank @Email @Size(max = 180) String email) {}

    public record AdminLoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record AdminProfileRequest(
            @NotBlank @Size(max = 140) String name,
            @NotBlank @Email @Size(max = 180) String email,
            @Size(max = 40) String phone,
            @Size(max = 100) String city,
            @Size(max = 500) String avatarUrl) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 12, max = 100) String newPassword) {}

    public record AdminResponse(String username, String name, String email, String phone,
            String city, String avatarUrl, LocalDateTime passwordUpdatedAt) {}

    public record AuthStatusResponse(boolean setupRequired) {}

    public record CsrfResponse(String token) {}

    public record ProductRequest(
            @NotBlank @Size(max = 180) String name,
            @NotBlank @Size(max = 100) String category,
            @NotNull @DecimalMin("0.00") BigDecimal unitPrice,
            @PositiveOrZero int stockQuantity,
            @Size(max = 500) String imageUrl) {}

    public record ProductResponse(
            Long id, String name, String category, BigDecimal unitPrice,
            int stockQuantity, String imageUrl, LocalDateTime updatedAt) {}

    public record OrderItemRequest(
            @NotNull @Positive Long productId,
            @Positive int quantity) {}

    public record CreateOrderRequest(
            @NotNull @Positive Long customerId,
            @NotEmpty List<@Valid OrderItemRequest> items,
            SalesChannel channel,
            @Size(max = 80) String paymentMethod) {}

    public record OrderStatusRequest(@NotNull OrderStatus status) {}

    public record OrderItemResponse(
            Long productId, String productName, int quantity, BigDecimal unitPrice,
            BigDecimal lineTotal) {}

    public record OrderResponse(
            Long id, String orderNumber, Long customerId, String customerName,
            OrderStatus status, SalesChannel channel, String paymentMethod,
            BigDecimal totalAmount, LocalDateTime createdAt,
            List<OrderItemResponse> items) {}

    public record DashboardSummary(
            BigDecimal revenue, BigDecimal revenueChangePercent,
            long orderCount, long activeCustomers, BigDecimal refundRatePercent) {}

    public record RevenuePoint(String label, BigDecimal revenue, long orders) {}

    public record ProductSales(
            Long productId, String name, String category, String imageUrl,
            long unitsSold, BigDecimal revenue) {}

    public record RegionSales(String region, BigDecimal revenue, long orders) {}

    public record CategorySales(String category, BigDecimal revenue, long unitsSold) {}

    public record ApiError(LocalDateTime timestamp, int status, String error,
                           String message, String path) {}
}