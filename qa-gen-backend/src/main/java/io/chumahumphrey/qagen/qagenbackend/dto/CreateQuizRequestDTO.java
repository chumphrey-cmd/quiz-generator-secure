package io.chumahumphrey.qagen.qagenbackend.dto;

import java.util.List;

public class CreateQuizRequestDTO {

    private String title;
    private List<QuestionDTO> questions;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<QuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDTO> questions) { this.questions = questions; }
}
