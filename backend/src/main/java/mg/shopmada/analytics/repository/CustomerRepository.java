package mg.shopmada.analytics.repository;

import mg.shopmada.analytics.domain.Customer;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Page<Customer> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String email, Pageable pageable);
    boolean existsByEmailIgnoreCase(String email);
    Optional<Customer> findByEmailIgnoreCase(String email);
}