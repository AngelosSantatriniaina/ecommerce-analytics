package mg.shopmada.analytics.controller;

import jakarta.validation.Valid;
import mg.shopmada.analytics.domain.OrderStatus;
import mg.shopmada.analytics.dto.ApiDtos.CreateOrderRequest;
import mg.shopmada.analytics.dto.ApiDtos.OrderResponse;
import mg.shopmada.analytics.dto.ApiDtos.OrderStatusRequest;
import mg.shopmada.analytics.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @GetMapping
    public Page<OrderResponse> list(@RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return service.list(status, pageable);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable long id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) { return service.create(request); }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable long id, @Valid @RequestBody OrderStatusRequest request) {
        return service.updateStatus(id, request.status());
    }
}