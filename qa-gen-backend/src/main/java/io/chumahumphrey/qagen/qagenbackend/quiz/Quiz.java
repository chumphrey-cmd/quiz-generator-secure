package io.chumahumphrey.qagen.qagenbackend.quiz;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import io.chumahumphrey.qagen.qagenbackend.question.Question;
import io.chumahumphrey.qagen.qagenbackend.user.User;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private Integer lastScore;

    /**
     * @CreationTimestamp is a Hibernate specific annotation that automatically populates
     * this field with the current server time exactly once when the record is first inserted.
     * updatable = false ensures we never accidentally overwrite the creation date.
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * @UpdateTimestamp automatically updates this timestamp every time the record is modified.
     * This allows the frontend to sort dashboards by "Recently Played" easily.
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * @ManyToOne defines the inverse of the User's @OneToMany.
     * FetchType.LAZY is a performance optimization: it prevents Hibernate from fetching the
     * entire User object from the database unless we explicitly call quiz.getUser().
     * @JoinColumn explicitly names the foreign key column in the PostgreSQL table.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // Stop the User loop or recursive calls and hides the password!
    private User user;

    // Cascades deletes downward: deleting a Quiz deletes all of its associated Questions.
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getLastScore() {
        return lastScore;
    }

    public void setLastScore(Integer lastScore) {
        this.lastScore = lastScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }
}
