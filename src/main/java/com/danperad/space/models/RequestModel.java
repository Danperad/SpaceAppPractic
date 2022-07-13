package com.danperad.space.models;

public class RequestModel {
    private final String[] date;
    private final int[] cloud;
    private final int[] angle;
    private final String[] sensors;
    private final Geometry geometry;

    public RequestModel(String[] date, int[] cloud, int[] angle, String[] sensors, Geometry geometry) {
        this.date = date;
        this.cloud = cloud;
        this.angle = angle;
        this.sensors = sensors;
        this.geometry = geometry;
    }
    public String getSensorsString() {
        StringBuilder sb = new StringBuilder();
        for (String sensor : sensors) {
            sb.append(sensor).append(",");
        }
        sb.setLength(sb.length()-1);
        return sb.toString();
    }
    public String[] getDate() {
        return date;
    }

    public int[] getCloud() {
        return cloud;
    }

    public int[] getAngle() {
        return angle;
    }

    public String[] getSensors() {
        return sensors;
    }

    public Geometry getGeometry() {
        return geometry;
    }
}
