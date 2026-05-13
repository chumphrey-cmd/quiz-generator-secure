package io.chumahumphrey.qagen.qagenbackend.quiz;

import io.chumahumphrey.qagen.qagenbackend.user.User;
import io.chumahumphrey.qagen.qagenbackend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private UserRepository userRepository;

    // The thing undertest
    @InjectMocks
    private QuizService quizService;

    // Arrange: Creating a fake User ID

    @Test
    // "Happy Path" assuming the user does everything right!
    public void shouldCreateAndSaveQuizWhenUserExists(){

        // Arrange
        UUID userId = UUID.randomUUID();
        User validUser = new User();
        validUser.setId(userId);
        validUser.setEmail("test@gmail.com");

        // 1. Arrange: create a dummy quiz coming from the front end
        Quiz rawQuiz = new Quiz();
        rawQuiz.setTitle("Example Quiz");

        // 2. Arrange: if asked for a specific id, return the valid user
        when(userRepository.findById(userId)).thenReturn(Optional.of(validUser));

        // when saving, return the exact same quiz back
        // When the save method is called, look at the arguments passed into the parentheses. Grab the argument at index `0` (the Quiz object we are trying to save), and immediately return it.
        // invocation ensures Mockito acts like a perfect mirror and hands back the object that we passed to it
        when(quizRepository.save(any(Quiz.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act: calling the method we are going to build
        Quiz savedQuiz = quizService.createQuiz(rawQuiz, userId);

        // Assert: ensuring that the user email, quiz title, are attached
        assertThat(savedQuiz.getUser()).isNotNull();
        assertThat(savedQuiz.getUser().getId()).isEqualTo(userId);
        assertThat(savedQuiz.getUser().getEmail()).isEqualTo("test@gmail.com");
        assertThat(savedQuiz.getTitle()).isEqualTo("Example Quiz");

        // Verify that the quiz was actually saved
        verify(quizRepository).save(any(Quiz.class));

    }

    @Test
    public void shouldThrowErrorIfUserCreatesQuizUsingUnknownUserId(){

        // Arrange
        UUID unknownUserId = UUID.randomUUID();
        Quiz rawQuiz = new Quiz();
        rawQuiz.setTitle("Temp Quiz");

        // Arrange use Mockito to fake that the user doesn't exist
        when(userRepository.findById(unknownUserId)).thenReturn(Optional.empty());

        // Act & Assert: throw exception
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> quizService.createQuiz(rawQuiz, unknownUserId));

        // Assert: verify the contents of the error message
        assertThat(exception.getMessage()).isEqualTo("Cannot create quiz: User ID not found");

        // Verify that the quiz is never saved and attempts to update the DB are ignored
        verify(quizRepository, never()).save(any());

    }

    @Test
    public void shouldReturnQuizWhenIdIsValid(){

        // Arrange: create fake quiz id and quiz to match
        UUID targetQuizId = UUID.randomUUID();
        Quiz existingQuiz = new Quiz();
        existingQuiz.setId(targetQuizId);
        existingQuiz.setTitle("New Spring Boot Quiz");

        // Arrange
        when(quizRepository.findById(targetQuizId)).thenReturn(Optional.of(existingQuiz));

        // Act: retrieving the quiz we want to build
        Quiz foundQuiz = quizService.getQuizById(targetQuizId);

        // Assert: ensuring that the quiz id, quiz title, and the quiz is not null
        assertThat(foundQuiz).isNotNull();
        assertThat(foundQuiz.getId()).isEqualTo(targetQuizId);
        assertThat(foundQuiz.getTitle()).isEqualTo("New Spring Boot Quiz");

        // Verify: sanity check to make sure it was saved
        verify(quizRepository).findById(targetQuizId);

    }

    @Test
    public void shouldThrownExceptionIfQuizNotFound(){

        // Arrange
        UUID missingUUID = UUID.randomUUID();

        // Arrange: having Mockito to fake the repository
        when(quizRepository.findById(missingUUID)).thenReturn(Optional.empty());

        // Act + Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> quizService.getQuizById(missingUUID));

        // Assert
        assertThat(exception.getMessage()).isEqualTo("Quiz not found.");

        // Verify
        verify(quizRepository).findById(missingUUID);
    }

    @Test
    public void shouldDeleteQuizWhenQuizExists() {

        // Arrange
        UUID targetQuizId = UUID.randomUUID();
        when(quizRepository.existsById(targetQuizId)).thenReturn(true);

        // Act
        quizService.deleteQuiz(targetQuizId);

        // Assert
        verify(quizRepository, times(1)).deleteById(targetQuizId);
    }
}
