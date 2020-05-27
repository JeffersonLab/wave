package org.jlab.wave.persistence.model;

public class SeriesConfig {
    long id;
    short weight;
    String pv;
    String label;
    String color;
    String yAxisLabel = null;
    Float yAxisMin = null;
    Float yAxisMax = null;
    boolean yAxisLog = false;
    Float scaler = null;
}
