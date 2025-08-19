package org.jlab.wave.business.service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import org.jlab.wave.persistence.model.Series;
import org.jlab.wave.persistence.util.DatabaseManager;

public class SeriesService {

  public List<Series> fetch(long chartId) throws SQLException {
    try (Connection con = DatabaseManager.getConnection()) {
      return fetch(con, chartId);
    }
  }

  public List<Series> fetch(Connection con, long chartId) throws SQLException {
    List<Series> list = new ArrayList<>();

    try (PreparedStatement stmt =
        con.prepareStatement("select * from wave.series where chart_id = ? order by weight")) {
      stmt.setLong(1, chartId);
      try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) {
          Series config = new Series();

          long seriesId = rs.getLong("series_id");
          String pv = rs.getString("pv");
          short weight = rs.getShort("weight");
          String label = rs.getString("label");
          String color = rs.getString("color");
          String yAxisLabel = rs.getString("y_axis_label");
          Float yAxisMin = rs.getFloat("y_axis_min");

          if (rs.wasNull()) {
            yAxisMin = null;
          }

          Float yAxisMax = rs.getFloat("y_axis_max");

          if (rs.wasNull()) {
            yAxisMax = null;
          }

          boolean yAxisLogScale = rs.getBoolean("y_axis_log_scale");

          Float scaler = rs.getFloat("scaler");

          if (rs.wasNull()) {
            scaler = null;
          }

          config.setSeriesId(seriesId);
          config.setPv(pv);
          config.setWeight(weight);
          config.setLabel(label);
          config.setColor(color);
          config.setyAxisLabel(yAxisLabel);
          config.setyAxisMin(yAxisMin);
          config.setyAxisMax(yAxisMax);
          config.setyAxisLogScale(yAxisLogScale);
          config.setScaler(scaler);

          list.add(config);
        }
      }
    }

    return list;
  }
}
