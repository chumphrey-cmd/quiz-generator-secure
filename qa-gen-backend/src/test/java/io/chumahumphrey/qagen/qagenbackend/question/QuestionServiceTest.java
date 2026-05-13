package io.chumahumphrey.qagen.qagenbackend.question;

import io.chumahumphrey.qagen.qagenbackend.quiz.Quiz;
import io.chumahumphrey.qagen.qagenbackend.quiz.QuizRepository;
import io.chumahumphrey.qagen.qagenbackend.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private QuestionService questionService;

    @Test
    public void shouldSaveValidQuestionsWhenUserOwnsQuiz() {

        // Arrange - Create user, quiz and UUIDs
        UUID userId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();

        User owner = new User();
        owner.setId(userId);

        Quiz targetQuiz = new Quiz();
        targetQuiz.setId(quizId);
        targetQuiz.setUser(owner); // Ensuring that we are tying the target quiz to the owner.

        // Arrange - Create 3 formatted correctly, here I wanted to simulate a series of questions being saved as a list
        Question q1 = createValidQuestion("Capital of Texas?", "Austin");
        Question q2 = createValidQuestion("2 + 2", "4");
        Question q3 = createValidQuestion("Color of the sky?", "Blue");
        List<Question> incomingQuestions = Arrays.asList(q1, q2, q3);

        // Arrange setting up Mockito
        // return the dummy quiz when search by its ID
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(targetQuiz));

        // Arrange
        // save question and echo it back
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act - call the list we are building
        List<Question> savedQuestions = questionService.saveQuestions(incomingQuestions, quizId, userId);

        // Assert
        // Verify the size of the questions (3), that every question was attached to the correct quiz, and that it was called 3 times
        assertThat(savedQuestions).hasSize(3);

        // grabbing the first element of the saved questions in the Array List
        assertThat(savedQuestions.getFirst().getQuiz()).isEqualTo(targetQuiz);
        verify(questionRepository, times(3)).save(any(Question.class));
    }

    @Test
    public void shouldFilterOutInvalidQuestionsAndSaveTheRest() {

        // Arrange - Create user, quiz and UUIDs
        UUID userId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();

        User owner = new User();
        owner.setId(userId);

        Quiz targetQuiz = new Quiz();
        targetQuiz.setId(quizId);
        targetQuiz.setUser(owner); // Ensuring that we are tying the target quiz to the owner.

        // Arrange - creating 2 valid questions and 1 invalid question
        Question valid1 = createValidQuestion("What is 2+2?", "4");
        Question valid2 = createValidQuestion("Color of the sky?", "Blue");

        // Invalid question
        Question invalidQuestion = new Question();
        invalidQuestion.setQuestionText("Broken question.");
        invalidQuestion.setOptions(Arrays.asList("A", "B", "C")); // no correct answers set here

        List<Question> incomingQuestions = Arrays.asList(valid1, valid2, invalidQuestion);

        // Arrange - using Mockito here
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(targetQuiz));
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act - activating the service
        List<Question> savedQuestions = questionService.saveQuestions(incomingQuestions, quizId,userId);

        // Assert that the service should only have parsed and returned 2 questions
        assertThat(savedQuestions).hasSize(2);

        // Verify that the database was touched TWICE ignoring the invalid question
        verify(questionRepository, times(2)).save(any(Question.class));

    }

    @Test
    public void shouldReturnEmptyListIfIncomingQuestionsEmpty() {

        // Arrange - create empty list and dummy IDs
        List<Question> emptyList = Arrays.asList();
        UUID userId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();

        // Act - trigger the service
        List<Question> result = questionService.saveQuestions(emptyList, quizId, userId);

        // Assert - the result should be empty
        assertThat(result).isEmpty();

        // Verify that we never even ask the database for the Quiz
        verify(quizRepository, org.mockito.Mockito.never()).findById(any(UUID.class));
        verify(questionRepository, org.mockito.Mockito.never()).save(any(Question.class));

    }

    /// Test 3:
    @Test
    public void shouldThrowExceptionIfQuizNotFound() {

        // Arrange setting up user
        UUID userId = UUID.randomUUID();
        UUID missingQuizId = UUID.randomUUID();

        List<Question> incomingQuestions = Arrays.asList(
                createValidQuestion("Q1?", "A"),
                createValidQuestion("Q2?", "B")
        );

        // Arrange return EMPTY (if Quiz not found)
        when(quizRepository.findById(missingQuizId)).thenReturn(Optional.empty());


        // Act - initiate throwing the illegal argument exception
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class, () -> questionService.saveQuestions(incomingQuestions, missingQuizId, userId)
        );

        // Assert
        assertThat(exception.getMessage()).isEqualTo("Quiz not found.");

        // Verify
        verify(questionRepository, never()).save(any(Question.class));

    }

    @Test
    public void shouldThrowExceptionIfUserDoesNotOwnQuiz(){
        // Arrange setting up user
        UUID maliciousUserId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();
        UUID realOwnerId = UUID.randomUUID();

        // Create the real owner and target quiz
        User realOwner = new User();
        realOwner.setId(realOwnerId);

        // Create target quiz linking them to the real owner!
        Quiz targetQuiz = new Quiz();
        targetQuiz.setId(quizId);
        targetQuiz.setUser(realOwner);


        List<Question> incomingQuestions = Arrays.asList(
                createValidQuestion("Q1?", "A"),
                createValidQuestion("Q2?", "B")
        );

        // Arrange - when we find the correct quiz and user combo
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(targetQuiz));

        // Act and assert here that stops the malicious user and throws an error
        SecurityException exception = assertThrows(
                SecurityException.class, () -> questionService.saveQuestions(incomingQuestions, quizId, maliciousUserId)
        );

        assertThat(exception.getMessage()).isEqualTo("Unauthorized: You do not have permission to add questions to this quiz.");

        // Verify - ensure that the malicious questions where blocked from being saved
        verify(questionRepository, never()).save(any(Question.class));


    }

    // Helper method that simulates the process of creating a valid question so that we don't have to keep instantiating a new question each time we want to work on our tests.
    private Question createValidQuestion(String text, String answer) {
        Question q = new Question();
        q.setQuestionText(text);
        q.setOptions(Arrays.asList(answer, "Wrong Option 1", "Wrong Option 2"));
        q.setCorrectAnswers(Arrays.asList(answer));
        return q;
    }
}
