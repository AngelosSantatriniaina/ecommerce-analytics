package mg.shopmada.analytics.service;

import mg.shopmada.analytics.domain.Customer;
import mg.shopmada.analytics.dto.ApiDtos.CustomerRequest;
import mg.shopmada.analytics.dto.ApiDtos.CustomerResponse;
import mg.shopmada.analytics.dto.ApiDtos.CheckoutCustomerRequest;
import mg.shopmada.analytics.exception.ResourceNotFoundException;
import mg.shopmada.analytics.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CustomerService {
    private final CustomerRepository customers;

    public CustomerService(CustomerRepository customers) {
        this.customers = customers;
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> list(String search, Pageable pageable) {
        Page<Customer> page = search == null || search.isBlank()
                ? customers.findAll(pageable)
                : customers.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search.trim(), search.trim(), pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse get(long id) {
        return toResponse(find(id));
    }

    public CustomerResponse create(CustomerRequest request) {
        if (customers.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Un client avec cette adresse e-mail existe déjà.");
        }
        return toResponse(apply(new Customer(), request));
    }

    public Customer findOrCreateForCheckout(CheckoutCustomerRequest request) {
        return customers.findByEmailIgnoreCase(request.email().trim())
                .orElseGet(() -> apply(new Customer(), new CustomerRequest(request.name(), request.email(),
                        request.phone(), request.city(), request.region(), "Nouveau")));
    }

    public CustomerResponse update(long id, CustomerRequest request) {
        Customer customer = find(id);
        if (!customer.getEmail().equalsIgnoreCase(request.email()) && customers.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Un client avec cette adresse e-mail existe déjà.");
        }
        return toResponse(apply(customer, request));
    }

    public void delete(long id) {
        customers.delete(find(id));
    }

    private Customer find(long id) {
        return customers.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client", id));
    }

    private Customer apply(Customer customer, CustomerRequest request) {
        customer.setName(request.name().trim());
        customer.setEmail(request.email().trim().toLowerCase());
        customer.setPhone(request.phone());
        customer.setCity(request.city());
        customer.setRegion(request.region());
        customer.setSegment(request.segment().trim());
        return customers.save(customer);
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(customer.getId(), customer.getName(), customer.getEmail(),
                customer.getPhone(), customer.getCity(), customer.getRegion(),
                customer.getSegment(), customer.getCreatedAt());
    }
}