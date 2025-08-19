package org.jlab.wave.persistence.model;

public class Series {
  long seriesId;
  short weight;
  String pv;
  String label;
  String color;
  String yAxisLabel = null;
  Float yAxisMin = null;
  Float yAxisMax = null;
  boolean yAxisLogScale = false;
  Float scaler = null;

  public long getSeriesId() {
    return seriesId;
  }

  public void setSeriesId(long seriesConfigId) {
    this.seriesId = seriesId;
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

  public boolean isyAxisLogScale() {
    return yAxisLogScale;
  }

  public void setyAxisLogScale(boolean yAxisLogScale) {
    this.yAxisLogScale = yAxisLogScale;
  }

  public Float getScaler() {
    return scaler;
  }

  public void setScaler(Float scaler) {
    this.scaler = scaler;
  }
}
