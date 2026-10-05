package mg.shopmada.analytics.repository;

import mg.shopmada.analytics.domain.Product;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);
    Page<Product> findByActiveTrueAndNameContainingIgnoreCaseOrActiveTrueAndCategoryContainingIgnoreCase(
            String name, String category, Pageable pageable);
    Optional<Product> findByIdAndActiveTrue(long id);
    boolean existsByNameIgnoreCaseAndActiveTrue(String name);
}