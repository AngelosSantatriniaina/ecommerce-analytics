package mg.shopmada.analytics.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import mg.shopmada.analytics.domain.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;

@DataJpaTest
class ProductRepositoryTest {
    @Autowired
    private ProductRepository products;

    @Test
    void activeCatalogExcludesArchivedProducts() {
        Product activeProduct = product("Sac de voyage");
        Product archivedProduct = product("Ancien article");
        archivedProduct.setActive(false);
        products.save(activeProduct);
        products.save(archivedProduct);

        var result = products.findByActiveTrue(PageRequest.of(0, 10));

        assertThat(result.getContent()).extracting(Product::getName).containsExactly("Sac de voyage");
        assertThat(activeProduct.isActive()).isTrue();
    }

    private Product product(String name) {
        Product product = new Product();
        product.setName(name);
        product.setCategory("Accessoires");
        product.setUnitPrice(new BigDecimal("15000.00"));
        product.setStockQuantity(5);
        return product;
    }
}