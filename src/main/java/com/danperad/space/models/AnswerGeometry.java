package com.danperad.space.models;

public class AnswerGeometry extends Geometry{
    public final String url;
    public AnswerGeometry(Point[] points, String type, String url) {
        super(points, type);
        this.url = url;
    }
}
