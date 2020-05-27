package org.jlab.wave.business.service;

import org.jlab.wave.persistence.model.ChartConfig;
import org.jlab.wave.persistence.util.DatabaseManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ChartConfigService {
    public List<ChartConfig> fetch() throws SQLException {
        List<ChartConfig> list = new ArrayList<>();

        try(Connection con = DatabaseManager.getConnection()) {
            try(PreparedStatement stmt = con.prepareStatement("select * from wave.chart_config")) {
                try(ResultSet rs = stmt.executeQuery()) {
                    while(rs.next()) {
                        ChartConfig config = new ChartConfig();

                        int chartConfigId = rs.getInt("chart_config_id");
                        String user = rs.getString("user");
                        String name = rs.getString("name");

                        config.setChartConfigId(chartConfigId);
                        config.setUser(user);
                        config.setName(name);

                        list.add(config);
                    }
                }
            }
        }

        return list;
    }
}
