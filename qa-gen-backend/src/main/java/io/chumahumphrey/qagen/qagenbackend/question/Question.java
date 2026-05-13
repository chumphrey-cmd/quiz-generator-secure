package io.chumahumphrey.qagen.qagenbackend.question;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import io.chumahumphrey.qagen.qagenbackend.quiz.Quiz;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Integer questionNumber;

    /**
     * columnDefinition = "TEXT" forces PostgreSQL to use the TEXT data type instead of
     * the default VARCHAR(255), preventing crashes if a question is a long paragraph.
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    /**
     * @JdbcTypeCode is a modern Hibernate 6 feature.
     * Instead of creating a separate SQL table just to hold options, this tells Hibernate
     * to serialize this Java List directly into a PostgreSQL JSONB column.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    // Removed the explicit definition here, we will allow H2/Hibernate to pick the JSON type needed here.
//    @Column(columnDefinition = "jsonb")
    private List<String> options;

    @JdbcTypeCode(SqlTypes.JSON)
//    @Column(columnDefinition = "jsonb")
    private List<String> correctAnswers;

    // Caches the LLM response. Uses TEXT to accommodate potentially long AI-generated explanations.
    @Column(columnDefinition = "TEXT")
    private String explanation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore // Tells Spring to stop the infinite loop during our http testing
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(Integer questionNumber) {
        this.questionNumber = questionNumber;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public List<String> getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(List<String> correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }
}
