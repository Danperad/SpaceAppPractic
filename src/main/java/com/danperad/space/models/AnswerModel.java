package com.danperad.space.models;

public class AnswerModel {
    public boolean status;
    public AnswerApiModel object;
    public String error;

    public AnswerModel(boolean status, AnswerApiModel object, String error) {
        this.status = status;
        this.object = object;
        this.error = error;
    }
}
