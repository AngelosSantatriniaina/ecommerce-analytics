package mg.shopmada.analytics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import mg.shopmada.analytics.domain.Product;
import mg.shopmada.analytics.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock
    private ProductRepository products;

    @InjectMocks
    private ProductService service;

    @Test
    void deleteArchivesProductInsteadOfRemovingOrderHistoryReference() {
        Product product = new Product();
        product.setName("Sac de voyage");
        product.setCategory("Accessoires");
        product.setUnitPrice(new BigDecimal("15000.00"));
        product.setStockQuantity(5);
        when(products.findByIdAndActiveTrue(7L)).thenReturn(Optional.of(product));

        service.delete(7L);

        assertThat(product.isActive()).isFalse();
        verify(products).save(product);
    }
}