package com.danperad.space.models;

public class Geometry {
    public final Point[] points;
    public final String type;
    public Geometry(Point[] points, String type) {
        this.points = points;
        this.type = type;
    }

    @Override
    public String toString() {
        StringBuilder b = new StringBuilder("POLYGON((");
        switch (type) {
            case "POINT":
                b.append(points[0].getX()).append(" ").append(points[0].getY()).append(", ");
                b.append(points[0].getX()+0.00001).append(" ").append(points[0].getY()).append(", ");
                b.append(points[0].getX()+0.00001).append(" ").append(points[0].getY()+0.00001).append(", ");
                b.append(points[0].getX()).append(" ").append(points[0].getY()+0.00001).append(", ");
                b.append(points[0].getX()).append(" ").append(points[0].getY());
                b.append("))");
                break;
            case "POLYGON":
                for (Point point : points) {
                    b.append(point.getX()).append(" ").append(point.getY()).append(", ");
                }
                b.setLength(b.length() - 2);
                b.append("))");
                break;
        }
        return b.toString();
    }
}
