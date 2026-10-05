package mg.shopmada.analytics.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import mg.shopmada.analytics.domain.Customer;
import mg.shopmada.analytics.domain.OrderItem;
import mg.shopmada.analytics.domain.OrderStatus;
import mg.shopmada.analytics.domain.Product;
import mg.shopmada.analytics.domain.SalesChannel;
import mg.shopmada.analytics.domain.SalesOrder;
import mg.shopmada.analytics.dto.ApiDtos.CreateOrderRequest;
import mg.shopmada.analytics.dto.ApiDtos.OrderItemResponse;
import mg.shopmada.analytics.dto.ApiDtos.OrderResponse;
import mg.shopmada.analytics.exception.ResourceNotFoundException;
import mg.shopmada.analytics.repository.CustomerRepository;
import mg.shopmada.analytics.repository.OrderRepository;
import mg.shopmada.analytics.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orders;
    private final CustomerRepository customers;
    private final ProductRepository products;

    public OrderService(OrderRepository orders, CustomerRepository customers, ProductRepository products) {
        this.orders = orders;
        this.customers = customers;
        this.products = products;
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> list(OrderStatus status, Pageable pageable) {
        Page<SalesOrder> page = status == null
                ? orders.findAllByOrderByCreatedAtDesc(pageable)
                : orders.findByStatusOrderByCreatedAtDesc(status, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse get(long id) {
        return toResponse(find(id));
    }

    public OrderResponse create(CreateOrderRequest request) {
        Customer customer = customers.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.customerId()));
        SalesOrder order = new SalesOrder();
        order.setOrderNumber("SM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCustomer(customer);
        order.setChannel(request.channel() == null ? SalesChannel.WEBSITE : request.channel());
        order.setPaymentMethod(request.paymentMethod());

        for (var itemRequest : request.items()) {
            Product product = products.findByIdAndActiveTrue(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produit", itemRequest.productId()));
            if (product.getStockQuantity() < itemRequest.quantity()) {
                throw new IllegalArgumentException("Stock insuffisant pour le produit " + product.getName() + ".");
            }
            product.setStockQuantity(product.getStockQuantity() - itemRequest.quantity());
            order.addItem(new OrderItem(product, itemRequest.quantity(), product.getUnitPrice()));
        }
        return toResponse(orders.save(order));
    }

    public OrderResponse updateStatus(long id, OrderStatus newStatus) {
        SalesOrder order = find(id);
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
            throw new IllegalStateException("Une commande annulée ou remboursée ne peut plus changer de statut.");
        }
        if (newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.REFUNDED) {
            order.getItems().forEach(item -> item.getProduct().setStockQuantity(
                    item.getProduct().getStockQuantity() + item.getQuantity()));
        }
        order.setStatus(newStatus);
        return toResponse(order);
    }

    private SalesOrder find(long id) {
        return orders.findById(id).orElseThrow(() -> new ResourceNotFoundException("Commande", id));
    }

    private OrderResponse toResponse(SalesOrder order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(item.getProduct().getId(), item.getProduct().getName(),
                        item.getQuantity(), item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))))
                .toList();
        return new OrderResponse(order.getId(), order.getOrderNumber(), order.getCustomer().getId(),
                order.getCustomer().getName(), order.getStatus(), order.getChannel(), order.getPaymentMethod(),
                order.getTotalAmount(), order.getCreatedAt(), items);
    }
}