package io.chumahumphrey.qagen.qagenbackend.dto;

import java.util.List;

public class QuestionDTO {

    private Integer questionNumber;

    private String text;
    private List<String> options;
    private List<String> correctAnswers;

    // ADD GETTER & SETTER
    public Integer getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(Integer questionNumber) { this.questionNumber = questionNumber; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public List<String> getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(List<String> correctAnswers) { this.correctAnswers = correctAnswers; }
}