package org.jlab.wave.persistence.model;

import java.time.Instant;
import java.util.List;

public class ChartConfig {
    long id;
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
}
