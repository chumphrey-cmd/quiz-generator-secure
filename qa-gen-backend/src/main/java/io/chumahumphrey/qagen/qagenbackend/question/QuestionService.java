package io.chumahumphrey.qagen.qagenbackend.question;

import io.chumahumphrey.qagen.qagenbackend.quiz.Quiz;
import io.chumahumphrey.qagen.qagenbackend.quiz.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public QuestionService(QuestionRepository questionRepository, QuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    /**
     * Processes a bulk list of questions, validating them and attaching them to a Quiz.
     * Returns a list containing ONLY the questions that were successfully saved.
     */
    public List<Question> saveQuestions(List<Question> incomingQuestions, UUID quizId, UUID userId){

        // Checks if the list is empty or null and returns an empty list (Test 5)
        if (incomingQuestions == null || incomingQuestions.isEmpty()){
            return new ArrayList<>();
        }

        /// Test 3:
        // Check 1: Does the Quiz exist
        Quiz targetQuiz = quizRepository.findById(quizId).orElseThrow(() -> new IllegalArgumentException("Quiz not found."));

        /// Test 4:
        // Check 2: Does the user who is making the request actually own the Quiz??
        if(!targetQuiz.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized: You do not have permission to add questions to this quiz.");
        }

        // Filtering questions one by one...
        List<Question> successfullySavedQuestions = new ArrayList<>();

        for (Question question : incomingQuestions) {

            // Basic data validation: must have >= 2 options and >= 1 correct answer
            if (question.getOptions() == null || question.getOptions().size() < 2) {
                continue; // Skipping over these bad questions
            }

            if (question.getCorrectAnswers() == null || question.getCorrectAnswers().isEmpty()) {
                continue; // Skipping over these bad questions
            }

            // Ensuring that the correct answer actually exists in our options
            boolean hasValidAnswer = false;
            for (String correctAnswer : question.getCorrectAnswers()) {
                if (question.getOptions().contains(correctAnswer)){
                    hasValidAnswer = true;
                    break;
                }
            }

            if (!hasValidAnswer){
                continue;
            }

            // Finally, if it survived all filters above, link it to the quiz and save it
            question.setQuiz(targetQuiz);
            Question savedQuestion = questionRepository.save(question);
            successfullySavedQuestions.add(savedQuestion);
        }

        return successfullySavedQuestions;

    }

    // Fetches a single question by its ID, used by our AiController to only send one question to our front end.
    public Question getQuestionById(UUID id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found."));
    }

    public void saveQuestion(Question question){
        questionRepository.save(question);
    }
}
