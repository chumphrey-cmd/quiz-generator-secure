package io.chumahumphrey.qagen.qagenbackend.question;

import io.chumahumphrey.qagen.qagenbackend.quiz.Quiz;
import io.chumahumphrey.qagen.qagenbackend.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class QuestionRepositoryTest {

    // entityManager: Spring Boot testing tool that lets us easily setup prerequisite database records (like our parent Quiz)
    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private QuestionRepository questionRepository;

    @Test
    public void shouldSaveAndFindQuestionWithJson(){

        // 1. Arrange: Create and save user first
        User newUser = new User();
        newUser.setEmail("test@gmail.com");
        newUser.setPasswordHash("superSecretHash1234");
        newUser.setRole("USER");

        // Save the user so tht it exisits in the database
        newUser = entityManager.persistAndFlush(newUser);

        // 2. Arrange: Create the Quiz
        Quiz testQuiz = new Quiz();

        // Requires a title based off of the Quiz entity
        testQuiz.setTitle("Demo quiz!");

        // Attach the user, so that user_id is set.
        testQuiz.setUser(newUser);

        // Save the user so it's in the database
        testQuiz = entityManager.persistAndFlush(testQuiz);

        // Generating quiz with required fields
        Question newQuestion = new Question();
        newQuestion.setQuestionNumber(2);
        newQuestion.setQuestionText("What is the capital of Texas?");
        newQuestion.setExplanation("Austin is the state capital.");

        // JSON implementation
        newQuestion.setOptions(List.of("Austin", "Houston", "Dallas", "San Antonio"));
        newQuestion.setCorrectAnswers(List.of("Austin"));

        // Link question to quiz
        newQuestion.setQuiz(testQuiz);

        // ACT
        Question savedQuestion = questionRepository.save(newQuestion);
        Optional<Question> foundQuestion = questionRepository.findById(savedQuestion.getId());

        // Assert: confirm that it's saved and verify the list is correct
        assertThat(foundQuestion).isPresent();
        assertThat(foundQuestion.get().getQuestionNumber()).isEqualTo(2);
        assertThat(foundQuestion.get().getQuestionText()).isEqualTo("What is the capital of Texas?");
        assertThat(foundQuestion.get().getExplanation()).isEqualTo("Austin is the state capital.");

    }

}
