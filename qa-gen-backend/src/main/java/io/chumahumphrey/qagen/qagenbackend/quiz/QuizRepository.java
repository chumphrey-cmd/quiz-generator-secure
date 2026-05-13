package io.chumahumphrey.qagen.qagenbackend.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {

    // Using this to populate the user's dashboard with their specific quiz history
    List<Quiz> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
