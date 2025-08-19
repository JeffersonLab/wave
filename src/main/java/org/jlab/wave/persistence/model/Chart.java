package org.jlab.wave.persistence.model;

import java.time.Instant;
import java.util.List;

public class Chart {
  long chartId;
  String name;
  String user;
  Instant start;
  Instant end;
  int windowMinutes;
  String myaDeployment;
  long myaLimit;
  String title;
  LayoutMode layoutMode;
  ViewerMode viewerMode;
  List<Series> seriesList;

  public long getChartId() {
    return chartId;
  }

  public void setChartId(long chartId) {
    this.chartId = chartId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getUser() {
    return user;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public Instant getStart() {
    return start;
  }

  public void setStart(Instant start) {
    this.start = start;
  }

  public Instant getEnd() {
    return end;
  }

  public void setEnd(Instant end) {
    this.end = end;
  }

  public int getWindowMinutes() {
    return windowMinutes;
  }

  public void setWindowMinutes(int windowMinutes) {
    this.windowMinutes = windowMinutes;
  }

  public String getMyaDeployment() {
    return myaDeployment;
  }

  public void setMyaDeployment(String myaDeployment) {
    this.myaDeployment = myaDeployment;
  }

  public long getMyaLimit() {
    return myaLimit;
  }

  public void setMyaLimit(long myaLimit) {
    this.myaLimit = myaLimit;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public LayoutMode getLayoutMode() {
    return layoutMode;
  }

  public void setLayoutMode(LayoutMode layoutMode) {
    this.layoutMode = layoutMode;
  }

  public ViewerMode getViewerMode() {
    return viewerMode;
  }

  public void setViewerMode(ViewerMode viewerMode) {
    this.viewerMode = viewerMode;
  }

  public List<Series> getSeriesList() {
    return seriesList;
  }

  public void setSeriesList(List<Series> seriesList) {
    this.seriesList = seriesList;
  }
}
