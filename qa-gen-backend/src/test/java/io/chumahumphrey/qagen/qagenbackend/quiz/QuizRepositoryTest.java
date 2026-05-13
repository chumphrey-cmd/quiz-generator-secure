package io.chumahumphrey.qagen.qagenbackend.quiz;

import io.chumahumphrey.qagen.qagenbackend.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class QuizRepositoryTest {

    // entityManager: Spring Boot testing tool that lets us easily setup prerequisite database records (like our parent Quiz)
    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private QuizRepository quizRepository;

    @Test
    public void shouldFindAndReturnCompleteQuiz(){

        // 1. Arrange: Create and save user first
        User newUser = new User();
        newUser.setEmail("test@gmail.com");
        newUser.setPasswordHash("superSecretHash1234");
        newUser.setRole("USER");

        // Save the user so tht it exisits in the database
        newUser = entityManager.persistAndFlush(newUser);

        // 2. Arrange: Create the Quiz
        Quiz testQuiz = new Quiz();
        // Setting user because Quiz.java entity needs a "user_id".
        testQuiz.setUser(newUser);

        testQuiz.setTitle("Demo quiz!");
        testQuiz.setLastScore(78);

        // Act: saving quiz to the repository and find it's UUID generated ID
        Quiz savedQuiz = quizRepository.save(testQuiz);
        Optional<Quiz> foundQuiz = quizRepository.findById(savedQuiz.getId());

        // Assert: Verifying that the saved quiz is correctly being saved
        assertThat(foundQuiz).isPresent();
        assertThat(foundQuiz.get().getTitle()).isEqualTo("Demo quiz!");
        assertThat(foundQuiz.get().getLastScore()).isEqualTo(78);
        assertThat(foundQuiz.get().getId()).isNotNull();

        // Assert: Verifying current user information is present
        assertThat(foundQuiz.get().getUser().getEmail()).isEqualTo("test@gmail.com");
        assertThat(foundQuiz.get().getUser().getRole()).isEqualTo("USER");

    }

}
