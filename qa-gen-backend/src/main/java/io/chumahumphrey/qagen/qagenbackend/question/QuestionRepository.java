package io.chumahumphrey.qagen.qagenbackend.question;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    // Retrieves all questions for a specific quiz, ordered by their question number
    List<Question> findByQuizIdOrderByQuestionNumberAsc(UUID quizId);
}
