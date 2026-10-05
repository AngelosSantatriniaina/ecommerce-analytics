package mg.shopmada.analytics.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import mg.shopmada.analytics.domain.Customer;
import mg.shopmada.analytics.domain.OrderItem;
import mg.shopmada.analytics.domain.OrderStatus;
import mg.shopmada.analytics.domain.Product;
import mg.shopmada.analytics.domain.SalesChannel;
import mg.shopmada.analytics.domain.SalesOrder;
import mg.shopmada.analytics.repository.CustomerRepository;
import mg.shopmada.analytics.repository.OrderRepository;
import mg.shopmada.analytics.repository.ProductRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!production")
public class DemoDataInitializer implements ApplicationRunner {
    private final CustomerRepository customers;
    private final ProductRepository products;
    private final OrderRepository orders;

    public DemoDataInitializer(CustomerRepository customers, ProductRepository products, OrderRepository orders) {
        this.customers = customers;
        this.products = products;
        this.orders = orders;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (customers.count() > 0 || products.count() > 0 || orders.count() > 0) return;

        List<Customer> customerRows = List.of(
                customer("Miora Rakoto", "miora@example.mg", "+261 34 12 345 67", "Antananarivo", "Analamanga", "Fidèle"),
                customer("Hery Andrian", "hery@example.mg", "+261 32 45 678 90", "Toamasina", "Atsinanana", "VIP"),
                customer("Lalao Randria", "lalao@example.mg", "+261 33 78 901 23", "Antsirabe", "Vakinankaratra", "Nouveau"),
                customer("Tiana Rabe", "tiana@example.mg", "+261 34 56 789 01", "Mahajanga", "Boeny", "Fidèle"),
                customer("Soa Rakoto", "soa@example.mg", "+261 32 90 123 45", "Fianarantsoa", "Haute Matsiatra", "Nouveau"));
        customers.saveAll(customerRows);

        List<Product> productRows = List.of(
                product("Casque audio sans fil", "Électronique", "189000", 24, "/sony-wh1000xm5-headphones.jpg"),
                product("Chaussures running", "Chaussures", "245000", 18, "/adidas-ultraboost-running-shoe.jpg"),
                product("Montre connectée", "Électronique", "320000", 12, null),
                product("Sac de voyage", "Accessoires", "156000", 30, null),
                product("T-shirt coton bio", "Vêtements", "68000", 45, null));
        products.saveAll(productRows);

        createOrder(customerRows.get(0), productRows.get(0), 1, OrderStatus.DELIVERED, SalesChannel.WEBSITE, 1);
        createOrder(customerRows.get(1), productRows.get(1), 1, OrderStatus.DELIVERED, SalesChannel.MOBILE, 2);
        createOrder(customerRows.get(2), productRows.get(3), 2, OrderStatus.PROCESSING, SalesChannel.MARKETPLACE, 3);
        createOrder(customerRows.get(3), productRows.get(2), 1, OrderStatus.SHIPPED, SalesChannel.WEBSITE, 5);
        createOrder(customerRows.get(0), productRows.get(4), 3, OrderStatus.DELIVERED, SalesChannel.STORE, 8);
        createOrder(customerRows.get(4), productRows.get(0), 1, OrderStatus.PENDING, SalesChannel.MOBILE, 10);
    }

    private Customer customer(String name, String email, String phone, String city, String region, String segment) {
        Customer customer = new Customer();
        customer.setName(name);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setCity(city);
        customer.setRegion(region);
        customer.setSegment(segment);
        return customer;
    }

    private Product product(String name, String category, String price, int stock, String imageUrl) {
        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setUnitPrice(new BigDecimal(price));
        product.setStockQuantity(stock);
        product.setImageUrl(imageUrl);
        return product;
    }

    private void createOrder(Customer customer, Product product, int quantity, OrderStatus status,
                             SalesChannel channel, int daysAgo) {
        SalesOrder order = new SalesOrder();
        order.setOrderNumber("SM-DEMO-" + (1000 + daysAgo));
        order.setCustomer(customer);
        order.setStatus(status);
        order.setChannel(channel);
        order.setPaymentMethod("Mobile Money");
        order.addItem(new OrderItem(product, quantity, product.getUnitPrice()));
        order.setTotalAmount(product.getUnitPrice().multiply(BigDecimal.valueOf(quantity)));
        order.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        orders.save(order);
        product.setStockQuantity(product.getStockQuantity() - quantity);
        products.save(product);
    }
}