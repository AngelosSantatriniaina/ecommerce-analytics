package mg.shopmada.analytics.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import mg.shopmada.analytics.domain.Customer;
import mg.shopmada.analytics.domain.OrderItem;
import mg.shopmada.analytics.domain.OrderStatus;
import mg.shopmada.analytics.domain.Product;
import mg.shopmada.analytics.domain.SalesOrder;
import mg.shopmada.analytics.repository.projection.CategorySalesView;
import mg.shopmada.analytics.repository.projection.ProductSalesView;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;

@DataJpaTest
class OrderRepositoryTest {
    @Autowired
    private OrderRepository orders;

    @Autowired
    private CustomerRepository customers;

    @Autowired
    private ProductRepository products;

    @Test
    void analyticsQueriesAggregateOrderLinesByProductAndCategory() {
        Customer customer = new Customer();
        customer.setName("Miora Rakoto");
        customer.setEmail("miora@example.mg");
        customer.setRegion("Analamanga");
        customers.saveAndFlush(customer);

        Product product = new Product();
        product.setName("Casque audio");
        product.setCategory("Électronique");
        product.setUnitPrice(new BigDecimal("189000.00"));
        product.setStockQuantity(5);
        products.saveAndFlush(product);

        SalesOrder order = new SalesOrder();
        order.setOrderNumber("SM-TEST-1001");
        order.setCustomer(customer);
        order.setCreatedAt(LocalDateTime.now());
        order.addItem(new OrderItem(product, 2, product.getUnitPrice()));
        orders.saveAndFlush(order);
        product.setActive(false);
        products.saveAndFlush(product);

        LocalDateTime from = LocalDateTime.now().minusDays(1);
        LocalDateTime to = LocalDateTime.now().plusDays(1);
        List<OrderStatus> excluded = List.of(OrderStatus.CANCELLED, OrderStatus.REFUNDED);
        List<ProductSalesView> productSales = orders.findTopProducts(from, to, excluded, PageRequest.of(0, 5));
        List<CategorySalesView> categorySales = orders.findSalesByCategory(from, to, excluded);

        assertThat(productSales).hasSize(1);
        assertThat(productSales.getFirst().getUnitsSold()).isEqualTo(2);
        assertThat(productSales.getFirst().getRevenue()).isEqualByComparingTo("378000.00");
        assertThat(categorySales).hasSize(1);
        assertThat(categorySales.getFirst().getCategory()).isEqualTo("Électronique");
        assertThat(categorySales.getFirst().getUnitsSold()).isEqualTo(2);
    }
}