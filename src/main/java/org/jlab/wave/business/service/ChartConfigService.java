package org.jlab.wave.business.service;

import org.jlab.wave.persistence.model.ChartConfig;
import org.jlab.wave.persistence.model.SeriesConfig;
import org.jlab.wave.persistence.util.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ChartConfigService {
    public List<ChartConfig> fetch() throws SQLException {
        List<ChartConfig> list = new ArrayList<>();

        SeriesConfigService seriesService = new SeriesConfigService();

        try(Connection con = DatabaseManager.getConnection()) {
            try(PreparedStatement stmt = con.prepareStatement("select * from wave.chart_config")) {
                try(ResultSet rs = stmt.executeQuery()) {
                    while(rs.next()) {
                        ChartConfig config = new ChartConfig();

                        long chartConfigId = rs.getLong("chart_config_id");
                        String user = rs.getString("user");
                        String name = rs.getString("name");
                        Timestamp start = rs.getTimestamp("start");
                        Timestamp end = rs.getTimestamp("end");
                        int windowMinutes = rs.getInt("window_minutes");
                        String myaDeployment = rs.getString("mya_deployment");
                        long myaLimit = rs.getLong("mya_limit");

                        config.setChartConfigId(chartConfigId);
                        config.setUser(user);
                        config.setName(name);
                        config.setStart(start == null ? null : start.toInstant());
                        config.setEnd(end == null ? null : end.toInstant());
                        config.setWindowMinutes(windowMinutes);
                        config.setMyaDeployment(myaDeployment);
                        config.setMyaLimit(myaLimit);

                        List<SeriesConfig> seriesConfigList = seriesService.fetch(con, chartConfigId);

                        config.setSeriesConfigList(seriesConfigList);

                        list.add(config);
                    }
                }
            }
        }

        return list;
    }
}
