package org.jlab.wave.business.service;

import org.jlab.wave.persistence.model.Chart;
import org.jlab.wave.persistence.model.Series;
import org.jlab.wave.persistence.util.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.TimeZone;

public class ChartService {
    public List<Chart> fetch() throws SQLException {
        List<Chart> list = new ArrayList<>();

        SeriesService seriesService = new SeriesService();

        try(Connection con = DatabaseManager.getConnection()) {
            try(PreparedStatement stmt = con.prepareStatement("select * from wave.chart")) {
                try(ResultSet rs = stmt.executeQuery()) {
                    while(rs.next()) {
                        Chart config = new Chart();

                        long chartId = rs.getLong("chart_id");
                        String user = rs.getString("user");
                        String name = rs.getString("name");
                        Timestamp start = rs.getTimestamp("start");
                        Timestamp end = rs.getTimestamp("end");
                        int windowMinutes = rs.getInt("window_minutes");
                        String myaDeployment = rs.getString("mya_deployment");
                        long myaLimit = rs.getLong("mya_limit");

                        config.setChartId(chartId);
                        config.setUser(user);
                        config.setName(name);
                        config.setStart(start == null ? null : start.toInstant());
                        config.setEnd(end == null ? null : end.toInstant());
                        config.setWindowMinutes(windowMinutes);
                        config.setMyaDeployment(myaDeployment);
                        config.setMyaLimit(myaLimit);

                        List<Series> seriesList = seriesService.fetch(con, chartId);

                        config.setSeriesList(seriesList);

                        list.add(config);
                    }
                }
            }
        }

        return list;
    }

    public void create(Chart chart) throws SQLException {
        try(Connection con = DatabaseManager.getConnection()) {
            try (PreparedStatement stmt = con.prepareStatement("insert (name, user) into wave.chart values(?, ?)")) {
                stmt.setString(1, chart.getName());
                stmt.setString(2, chart.getUser());

                Timestamp startStamp = null;
                if(chart.getStart() != null) {
                    startStamp = Timestamp.from(chart.getStart());
                }
                stmt.setTimestamp(3, startStamp, Calendar.getInstance(TimeZone.getTimeZone("UTC")));

                Timestamp endStamp = null;
                if(chart.getEnd() != null) {
                    endStamp = Timestamp.from(chart.getEnd());
                }
                stmt.setTimestamp(4, endStamp, Calendar.getInstance(TimeZone.getTimeZone("UTC")));


                stmt.executeUpdate();
            }
        }
    }

    public void update(Chart chart) throws SQLException {
    }
}
