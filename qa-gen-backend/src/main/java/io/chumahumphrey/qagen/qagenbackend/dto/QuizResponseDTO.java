package io.chumahumphrey.qagen.qagenbackend.dto;
import java.util.UUID;

public class QuizResponseDTO {
    private UUID id;
    private String title;
    private Integer lastScore;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getLastScore() {
        return lastScore;
    }
    public void setLastScore(Integer lastScore) {
        this.lastScore = lastScore;
    }
}