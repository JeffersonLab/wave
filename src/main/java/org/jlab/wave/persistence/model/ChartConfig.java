package org.jlab.wave.persistence.model;

import java.time.Instant;
import java.util.List;

public class ChartConfig {
    long chartConfigId;
    String name;
    String user;
    Instant start;
    Instant end;
    long windowMinutes;
    String myaDeployment;
    long myaLimit;
    String title;
    LayoutMode layoutMode;
    ViewerMode viewerMode;
    List<SeriesConfig> seriesConfigList;

    public long getChartConfigId() {
        return chartConfigId;
    }

    public void setChartConfigId(long chartConfigId) {
        this.chartConfigId = chartConfigId;
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

    public long getWindowMinutes() {
        return windowMinutes;
    }

    public void setWindowMinutes(long windowMinutes) {
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

    public List<SeriesConfig> getSeriesConfigList() {
        return seriesConfigList;
    }

    public void setSeriesConfigList(List<SeriesConfig> seriesConfigList) {
        this.seriesConfigList = seriesConfigList;
    }
}
