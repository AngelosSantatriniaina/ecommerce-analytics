package mg.shopmada.analytics.repository;

import java.util.Optional;
import mg.shopmada.analytics.domain.AdminAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAccountRepository extends JpaRepository<AdminAccount, String> {
    Optional<AdminAccount> findByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, String id);
}