package mg.shopmada.analytics.controller;

import jakarta.validation.Valid;
import mg.shopmada.analytics.domain.SalesChannel;
import mg.shopmada.analytics.dto.ApiDtos.CheckoutRequest;
import mg.shopmada.analytics.dto.ApiDtos.CreateOrderRequest;
import mg.shopmada.analytics.dto.ApiDtos.OrderResponse;
import mg.shopmada.analytics.service.CustomerService;
import mg.shopmada.analytics.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/checkout")
public class CheckoutController {
    private final CustomerService customers;
    private final OrderService orders;

    public CheckoutController(CustomerService customers, OrderService orders) {
        this.customers = customers;
        this.orders = orders;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse checkout(@Valid @RequestBody CheckoutRequest request) {
        var customer = customers.findOrCreateForCheckout(request.customer());
        return orders.create(new CreateOrderRequest(customer.getId(), request.items(),
                SalesChannel.WEBSITE, request.paymentMethod()));
    }
}