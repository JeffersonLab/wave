package org.jlab.wave.persistence.model;

public class SeriesConfig {
    long seriesConfigId;
    short weight;
    String pv;
    String label;
    String color;
    String yAxisLabel = null;
    Float yAxisMin = null;
    Float yAxisMax = null;
    boolean yAxisLog = false;
    Float scaler = null;

    public long getSeriesConfigId() {
        return seriesConfigId;
    }

    public void setSeriesConfigId(long seriesConfigId) {
        this.seriesConfigId = seriesConfigId;
    }

    public short getWeight() {
        return weight;
    }

    public void setWeight(short weight) {
        this.weight = weight;
    }

    public String getPv() {
        return pv;
    }

    public void setPv(String pv) {
        this.pv = pv;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getyAxisLabel() {
        return yAxisLabel;
    }

    public void setyAxisLabel(String yAxisLabel) {
        this.yAxisLabel = yAxisLabel;
    }

    public Float getyAxisMin() {
        return yAxisMin;
    }

    public void setyAxisMin(Float yAxisMin) {
        this.yAxisMin = yAxisMin;
    }

    public Float getyAxisMax() {
        return yAxisMax;
    }

    public void setyAxisMax(Float yAxisMax) {
        this.yAxisMax = yAxisMax;
    }

    public boolean isyAxisLog() {
        return yAxisLog;
    }

    public void setyAxisLog(boolean yAxisLog) {
        this.yAxisLog = yAxisLog;
    }

    public Float getScaler() {
        return scaler;
    }

    public void setScaler(Float scaler) {
        this.scaler = scaler;
    }
}
