package mg.shopmada.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "admin_accounts")
public class AdminAccount implements UserDetails {
    @Id
    private String id = "ADMIN";

    @Column(nullable = false, unique = true, length = 80)
    private String username;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(length = 100)
    private String city;

    @Column(length = 500)
    private String avatarUrl;

    @Column(nullable = false)
    private LocalDateTime passwordUpdatedAt;

    public AdminAccount() {
    }

    @PrePersist
    void onCreate() {
        passwordUpdatedAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Override
    public String getUsername() { return username; }

    @Override
    public String getPassword() { return passwordHash; }

    public String getId() { return id; }
    public void setUsername(String username) { this.username = username; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public LocalDateTime getPasswordUpdatedAt() { return passwordUpdatedAt; }
    public void setPasswordUpdatedAt(LocalDateTime passwordUpdatedAt) { this.passwordUpdatedAt = passwordUpdatedAt; }
}