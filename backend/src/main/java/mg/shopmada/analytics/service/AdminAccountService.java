package mg.shopmada.analytics.service;

import mg.shopmada.analytics.domain.AdminAccount;
import mg.shopmada.analytics.dto.ApiDtos.AdminProfileRequest;
import mg.shopmada.analytics.dto.ApiDtos.AdminResponse;
import mg.shopmada.analytics.dto.ApiDtos.AdminSetupRequest;
import mg.shopmada.analytics.dto.ApiDtos.ChangePasswordRequest;
import mg.shopmada.analytics.exception.ResourceNotFoundException;
import mg.shopmada.analytics.repository.AdminAccountRepository;
import java.time.LocalDateTime;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminAccountService implements UserDetailsService {
    private static final String ACCOUNT_ID = "ADMIN";
    private final AdminAccountRepository accounts;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountService(AdminAccountRepository accounts, PasswordEncoder passwordEncoder) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public boolean setupRequired() {
        return !accounts.existsById(ACCOUNT_ID);
    }

    public AdminResponse setup(AdminSetupRequest request) {
        if (!setupRequired()) throw new IllegalStateException("Le compte administrateur est déjà configuré.");
        AdminAccount account = new AdminAccount();
        account.setUsername(request.username().trim());
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.setName(request.name().trim());
        account.setEmail(request.email().trim().toLowerCase());
        return toResponse(accounts.save(account));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAccount loadUserByUsername(String username) throws UsernameNotFoundException {
        return accounts.findByUsernameIgnoreCase(username.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Identifiants invalides."));
    }

    @Transactional(readOnly = true)
    public AdminResponse profile(String username) {
        return toResponse(loadUserByUsername(username));
    }

    public AdminResponse updateProfile(String username, AdminProfileRequest request) {
        AdminAccount account = loadUserByUsername(username);
        if (!account.getEmail().equalsIgnoreCase(request.email())
                && accounts.existsByEmailIgnoreCaseAndIdNot(request.email(), ACCOUNT_ID)) {
            throw new IllegalArgumentException("Cette adresse e-mail est déjà utilisée.");
        }
        account.setName(request.name().trim());
        account.setEmail(request.email().trim().toLowerCase());
        account.setPhone(request.phone());
        account.setCity(request.city());
        account.setAvatarUrl(request.avatarUrl());
        return toResponse(accounts.save(account));
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        AdminAccount account = loadUserByUsername(username);
        if (!passwordEncoder.matches(request.currentPassword(), account.getPassword())) {
            throw new IllegalArgumentException("Le mot de passe actuel est incorrect.");
        }
        account.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        account.setPasswordUpdatedAt(LocalDateTime.now());
        accounts.save(account);
    }

    private AdminResponse toResponse(AdminAccount account) {
        return new AdminResponse(account.getUsername(), account.getName(), account.getEmail(),
                account.getPhone(), account.getCity(), account.getAvatarUrl(), account.getPasswordUpdatedAt());
    }
}