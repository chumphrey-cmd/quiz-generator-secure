package io.chumahumphrey.qagen.qagenbackend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Spring Data JPA magic: Just by naming this method "findByEmail",
    // Spring automatically writes the SQL query to search the database by email!
    Optional<User> findByEmail(String email);
}
