package org.jlab.wave.business.service;

import org.jlab.wave.persistence.model.SeriesConfig;
import org.jlab.wave.persistence.util.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SeriesConfigService {

    public List<SeriesConfig> fetch(long chartConfigId) throws SQLException {
        try(Connection con = DatabaseManager.getConnection()) {
            return fetch(con, chartConfigId);
        }
    }

    public List<SeriesConfig> fetch(Connection con, long chartConfigId) throws SQLException {
        List<SeriesConfig> list = new ArrayList<>();

            try(PreparedStatement stmt = con.prepareStatement("select * from wave.series_config where chart_config_id = ? order by weight")) {
                stmt.setLong(1, chartConfigId);
                try(ResultSet rs = stmt.executeQuery()) {
                    while(rs.next()) {
                        SeriesConfig config = new SeriesConfig();

                        long seriesConfigId = rs.getLong("series_config_id");
                        String pv = rs.getString("pv");
                        short weight = rs.getShort("weight");
                        String label = rs.getString("label");
                        String color = rs.getString("color");
                        String yAxisLabel = rs.getString("y_axis_label");
                        Float yAxisMin = rs.getFloat("y_axis_min");

                        if(rs.wasNull()) {
                            yAxisMin = null;
                        }

                        Float yAxisMax = rs.getFloat("y_axis_max");

                        if(rs.wasNull()) {
                            yAxisMax = null;
                        }

                        boolean yAxisLogScale = rs.getBoolean("y_axis_log_scale");

                        Float scaler = rs.getFloat("scaler");

                        if(rs.wasNull()) {
                            scaler = null;
                        }

                        config.setSeriesConfigId(seriesConfigId);
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
