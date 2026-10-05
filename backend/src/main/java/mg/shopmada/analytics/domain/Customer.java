package mg.shopmada.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String region;

    @Column(nullable = false, length = 40)
    private String segment = "Nouveau";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Customer() {
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}