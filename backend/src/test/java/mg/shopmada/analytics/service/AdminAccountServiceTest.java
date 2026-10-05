package mg.shopmada.analytics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import mg.shopmada.analytics.domain.AdminAccount;
import mg.shopmada.analytics.dto.ApiDtos.AdminSetupRequest;
import mg.shopmada.analytics.dto.ApiDtos.ChangePasswordRequest;
import mg.shopmada.analytics.repository.AdminAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AdminAccountServiceTest {
    @Mock
    private AdminAccountRepository accounts;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminAccountService service;

    @Test
    void initialSetupStoresEncodedPassword() {
        when(accounts.existsById("ADMIN")).thenReturn(false);
        when(passwordEncoder.encode("test-password-with-12-chars")).thenReturn("$2a$hashed-password");
        when(accounts.save(any(AdminAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.setup(new AdminSetupRequest(
                "shop-admin", "test-password-with-12-chars", "Shop Admin", "admin@example.mg"));

        assertThat(response.username()).isEqualTo("shop-admin");
        assertThat(response.name()).isEqualTo("Shop Admin");
        verify(accounts).save(org.mockito.ArgumentMatchers.argThat(account ->
                account.getPassword().equals("$2a$hashed-password")));
    }

    @Test
    void passwordChangeRequiresCurrentPasswordAndStoresNewHash() {
        AdminAccount account = new AdminAccount();
        account.setUsername("shop-admin");
        account.setPasswordHash("$2a$old-hash");
        when(accounts.findByUsernameIgnoreCase("shop-admin")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("old-password", "$2a$old-hash")).thenReturn(true);
        when(passwordEncoder.encode("new-password-with-12-chars")).thenReturn("$2a$new-hash");

        service.changePassword("shop-admin", new ChangePasswordRequest("old-password", "new-password-with-12-chars"));

        assertThat(account.getPassword()).isEqualTo("$2a$new-hash");
        assertThat(account.getPasswordUpdatedAt()).isNotNull();
        verify(accounts).save(account);
    }

    @Test
    void passwordChangeRejectsWrongCurrentPassword() {
        AdminAccount account = new AdminAccount();
        account.setUsername("shop-admin");
        account.setPasswordHash("$2a$old-hash");
        when(accounts.findByUsernameIgnoreCase("shop-admin")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("wrong-password", "$2a$old-hash")).thenReturn(false);

        assertThatThrownBy(() -> service.changePassword("shop-admin",
                new ChangePasswordRequest("wrong-password", "new-password-with-12-chars")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("incorrect");
    }
}