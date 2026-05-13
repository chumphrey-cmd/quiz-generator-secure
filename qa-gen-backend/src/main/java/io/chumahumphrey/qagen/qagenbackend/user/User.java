package io.chumahumphrey.qagen.qagenbackend.user;

import jakarta.persistence.*;
import io.chumahumphrey.qagen.qagenbackend.quiz.Quiz;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * @Entity marks this class as a JPA entity, meaning Hibernate will map it to a database table.
 * @Table is explicitly used here to name the table "users". "user" is a reserved keyword
 * in PostgreSQL, so pluralizing it prevents SQL syntax errors during table generation.
 */

@Entity
@Table(name = "users")
public class User implements UserDetails {

    /**
     * @Id marks this field as the Primary Key.
     * We use UUID instead of standard auto-incrementing integers for enterprise security,
     * making it mathematically impossible for malicious users to guess other users' IDs.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // unique = true enforces a database-level constraint so two users cannot share an email.
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    // Default role assignment to satisfy Spring Security's requirement for authorities.
    @Column(nullable = false)
    private String role = "USER";

    /**
     * @OneToMany defines the relationship: One User can own Many Quizzes.
     * mappedBy = "user" tells Hibernate that the Quiz class owns the foreign key.
     * cascade = CascadeType.ALL ensures that if we delete a User, their Quizzes are also deleted.
     * orphanRemoval = true ensures that if a Quiz is removed from this list, it is deleted from the DB.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Quiz> quizzes = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<Quiz> getQuizzes() {
        return quizzes;
    }

    public void setQuizzes(List<Quiz> quizzes) {
        this.quizzes = quizzes;
    }


    /// UserDetails Interface Methods (Spring Security Requirements)

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security expects roles to be formatted as authorities (e.g., "ROLE_USER")
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return passwordHash; // Maps your passwordHash field to Spring's password expectation
    }

    @Override
    public String getUsername() {
        return email; // We use email as the primary login identifier, mapping it to "username"
    }

    // For our MVP we're assuming accounts are always active and not locked out.
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
