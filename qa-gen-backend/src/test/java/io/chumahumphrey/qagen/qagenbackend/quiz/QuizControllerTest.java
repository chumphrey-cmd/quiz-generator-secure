package io.chumahumphrey.qagen.qagenbackend.quiz;

import io.chumahumphrey.qagen.qagenbackend.config.JwtService;
import io.chumahumphrey.qagen.qagenbackend.dto.QuizResponseDTO;
import io.chumahumphrey.qagen.qagenbackend.question.QuestionService;
import io.chumahumphrey.qagen.qagenbackend.user.UserRepository;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import io.chumahumphrey.qagen.qagenbackend.user.User;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuizController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypasses Spring Security for testing
public class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // --- SPRING SECURITY MOCKS ---
    // We must provide fake versions of these so the SecurityFilterChain can successfully boot up in our test context
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private QuizService quizService;

    @MockitoBean
    private QuestionService questionService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    public void shouldReturn201WhenQuizIsCreated() throws Exception {

        // 1. Arrange: Create our Mock VIP User
        User mockUser = new User();
        UUID mockUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        mockUser.setId(mockUserId);
        mockUser.setEmail("officer@army.mil");
        mockUser.setRole("USER");
        // We must provide a password string (even a fake one) to satisfy the UserDetails interface
        mockUser.setPasswordHash("fake_hash");

        Authentication auth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(auth);

        // 2. Arrange: The JSON Payload
        String jsonPayload = """
                {
                    "title": "Java Basics Quiz",
                    "questions": [
                        {
                            "questionText": "What is a class?",
                            "options": ["Blueprint", "Car", "Tool", "Book"],
                            "correctAnswers": ["Blueprint"]
                        }
                    ]
                }
                """;

        Quiz mockSavedQuiz = new Quiz();
        mockSavedQuiz.setId(UUID.randomUUID());
        mockSavedQuiz.setTitle("Java Basics Quiz");
        mockSavedQuiz.setLastScore(0);

        // 3. Arrange: The Mockito Rule
        // Notice we explicitly tell Mockito to expect our mockUserId!
        when(userRepository.findByEmail("officer@army.mil")).thenReturn(Optional.of(mockUser));
        when(quizService.createQuiz(any(Quiz.class), eq(mockUserId))).thenReturn(mockSavedQuiz);

        // 4. Act & Assert: Send a POST request
        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Java Basics Quiz"))
                .andExpect(jsonPath("$.id").exists())
                .andDo(print());

        SecurityContextHolder.clearContext();
    }

    @Test
    @WithMockUser(username = "testuser@gmail.com")
    public void shouldReturn200AndListOfQuizzesWhenGetAllIsCalled() throws Exception {

        // 0. Arrange: Create a fake User to satisfy the @AuthenticationPrincipal
        User mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        mockUser.setEmail("testuser@gmail.com");

        // Tell the Mock UserRepository to return this user
        when(userRepository.findByEmail("testuser@gmail.com")).thenReturn(java.util.Optional.of(mockUser));

        // 1. Arrange: Create a fake list of quizzes that the database "found"
        // (Hint: Use a List containing two Quiz entities instead of Maps now)
        Quiz quiz1 = new Quiz();
        quiz1.setId(UUID.randomUUID());
        quiz1.setTitle("Java Basics Quiz");
        quiz1.setLastScore(85);

        Quiz quiz2 = new Quiz();
        quiz2.setId(UUID.randomUUID());
        quiz2.setTitle("More Java Basics Quiz");
        quiz2.setLastScore(100);

        // Put both Quiz 1 and 2 into a single List
        List<Quiz> allQuizzes = List.of(quiz1, quiz2);

        // 2. Arrange: Tell the Mock QuizService to return the fake list when asked
        // Now uses getAllQuizzesForUser() with our mock user's ID
        when(quizService.getAllQuizzes(mockUser.getId())).thenReturn(allQuizzes);

        // Create the expected DTOs that the Controller will pack and return
        QuizResponseDTO dto1 = new QuizResponseDTO();
        dto1.setId(quiz1.getId());
        dto1.setTitle(quiz1.getTitle());
        dto1.setLastScore(quiz1.getLastScore());

        QuizResponseDTO dto2 = new QuizResponseDTO();
        dto2.setId(quiz2.getId());
        dto2.setTitle(quiz2.getTitle());
        dto2.setLastScore(quiz2.getLastScore());

        // Translating the expected DTO list into a single JSON Array string
        String expectedJsonArray = objectMapper.writeValueAsString(List.of(dto1, dto2));

        // 3. Act: Send a GET request to "/api/quizzes"
        // 4. Assert: Expect a 200 OK status
        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(content().json(expectedJsonArray))
                .andDo(print());

        /// NOTE: Sanity check (verify) is not needed here. For a GET request, the QuizService handles fetching the quizzes and their questions from the database in one big swoop. The Controller doesn't need to talk to the QuestionService at all
    }

    @Test
    public void shouldReturn200AndSingleQuizWhenGetByIdIsCalled() throws Exception {

        // 1. Arrange: Create the UUID and the fake quiz
        String fakeIdString = "123e4567-e89b-12d3-a456-426614174000";
        UUID testUuid = UUID.fromString(fakeIdString); // Converts the string to a strict Java UUID

        Quiz singleQuiz = new Quiz();
        singleQuiz.setId(testUuid);
        singleQuiz.setTitle("Java Basics Quiz");

        String expectedJson = objectMapper.writeValueAsString(singleQuiz);

        // 2. Arrange: Tell the Mock QuizService to return the fake quiz when asked for our exact UUID
        when(quizService.getQuizById(testUuid)).thenReturn(singleQuiz);

        // 3. Act: Send a GET request to the dynamic URL
        // 4. Assert: Expect a 200 OK status, check that the content matches expectedJson, and print the logs
        mockMvc.perform(get("/api/quizzes/" + fakeIdString))
                .andExpect(status().isOk()) // Expecting 200 OK
                .andExpect(content().json(expectedJson))
                .andDo(print());
    }

    @Test
    public void shouldReturn200AndUpdatedQuizWhenScoreIsUpdatedById() throws Exception {

        // 1. Arrange: The Setup
        String fakeIdString = "123e4567-e89b-12d3-a456-426614174000";
        UUID testUuid = UUID.fromString(fakeIdString);

        // Create the tiny JSON Request body (Hint: Map containing "score" -> 85)
        // 1. Arrange: Create the JSON Request
        Map<String, Integer> updateQuiz = Map.of(
                "lastScore", 85
        );

        // Translate that Map into a JSON string using objectMapper
        String jsonPayload = objectMapper.writeValueAsString(updateQuiz);


        // 2. Arrange: The Mock Entity
        // Create a real Quiz object, set its ID to testUuid, set Title, and set LastScore to 85.
        Quiz mockSavedQuiz = new Quiz();
        mockSavedQuiz.setId(testUuid);
        mockSavedQuiz.setTitle("Java Basics Quiz");
        mockSavedQuiz.setLastScore(85);

        // 3. Arrange: The Mockito Rule
        // (Note: We use eq() when mixing exact values with Mockito matchers!)
        when(quizService.updateQuizScore(eq(testUuid), eq(85))).thenReturn(mockSavedQuiz);

        // 4. Act: Send a PUT request
        // 5. Assert: Expect a 200 OK status, and check that $.lastScore is 85
        mockMvc.perform(put("/api/quizzes/" + fakeIdString + "/score")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(jsonPayload))
                .andExpect(status().isOk()) // 200 message
                .andExpect(jsonPath("$.title").value("Java Basics Quiz"))
                .andExpect(jsonPath("$.lastScore").value(85)) // Expect the safe DTO to contain an ID
                .andDo(print());
    }

    @Test
    public void shouldReturn204WhenQuizIsDeleted() throws Exception {

        // 1. Arrange: The Setup
        String fakeIdString = "123e4567-e89b-12d3-a456-426614174000";
        UUID testUuid = UUID.fromString(fakeIdString);


        // 2. Arrange: The Mockito Rule
        doNothing().when(quizService).deleteQuiz(testUuid);

        // 3. Act: Send a DELETE request
        // 4. Assert: Expect a 204 No Content status
        mockMvc.perform(delete("/api/quizzes/" + fakeIdString))
                .andExpect(status().isNoContent()) // 204 message
                .andDo(print());
    }
}