package org.jlab.wave.presentation.controller;

import org.jlab.wave.business.service.ChartConfigService;
import org.jlab.wave.persistence.model.ChartConfig;
import org.jlab.wave.persistence.model.SeriesConfig;

import javax.json.Json;
import javax.json.stream.JsonGenerator;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 *
 * @author ryans
 */
@WebServlet(name = "ChartConfigController", urlPatterns = {"/chart-config"})
public class ChartConfigController extends HttpServlet {
    
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String errorReason = null;

        ChartConfigService service = new ChartConfigService();

        List<ChartConfig> list = null;

        try {
            list = service.fetch();
        } catch(SQLException e) {
            errorReason = e.getMessage();
        }

        response.setContentType("application/json");

        OutputStream out = response.getOutputStream();

        try (JsonGenerator gen = Json.createGenerator(out)) {
            gen.writeStartObject();

            if (errorReason != null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                gen.write("error", errorReason);
            } else {
                gen.writeStartArray("configs");
                for(ChartConfig config: list) {
                    gen.writeStartObject();
                    gen.write("chart-config-id", config.getChartConfigId());

                    if(config.getUser() == null) {
                        gen.writeNull("user");
                    } else {
                        gen.write("user", config.getUser());
                    }

                    gen.write("name", config.getName());

                    if(config.getStart() == null) {
                        gen.writeNull("start");
                    } else {
                        gen.write("start", DateTimeFormatter.ISO_INSTANT.format(config.getStart().truncatedTo(ChronoUnit.SECONDS)));
                    }

                    if(config.getEnd() == null) {
                        gen.writeNull("end");
                    } else {
                        gen.write("end", DateTimeFormatter.ISO_INSTANT.format(config.getEnd().truncatedTo(ChronoUnit.SECONDS)));
                    }

                    gen.write("window-minutes", config.getWindowMinutes());

                    gen.write("mya-deployment", config.getMyaDeployment());

                    gen.write("mya-limit", config.getMyaLimit());

                    gen.writeStartArray("series");

                    for(SeriesConfig series: config.getSeriesConfigList()) {
                        gen.writeStartObject();
                        gen.write("series_config_id", series.getSeriesConfigId());
                        gen.write("pv", series.getPv());
                        gen.write("weight", series.getWeight());

                        if(series.getLabel() == null) {
                            gen.writeNull("label");
                        } else {
                            gen.write("label", series.getLabel());
                        }

                        if(series.getColor() == null) {
                            gen.writeNull("color");
                        } else {
                            gen.write("color", series.getColor());
                        }

                        if(series.getyAxisLabel() == null) {
                            gen.writeNull("y-axis-label");
                        } else {
                            gen.write("y-axis-label", series.getyAxisLabel());
                        }

                        if(series.getyAxisMin() == null) {
                            gen.writeNull("y-axis-min");
                        } else {
                            gen.write("y-axis-min", series.getyAxisMin());
                        }

                        if(series.getyAxisMax() == null) {
                            gen.writeNull("y-axis-max");
                        } else {
                            gen.write("y-axis-max", series.getyAxisMax());
                        }

                        gen.write("y-axis-log-scale", series.isyAxisLogScale());

                        if(series.getScaler() == null) {
                            gen.writeNull("scaler");
                        } else {
                            gen.write("scaler", series.getScaler());
                        }

                        gen.writeEnd();
                    }

                    gen.writeEnd();

                    gen.writeEnd();
                }
                gen.writeEnd();
            }

            gen.writeEnd();
        }
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request  servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException      if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String errorReason = null;

        response.setContentType("application/json");

        OutputStream out = response.getOutputStream();

        try (JsonGenerator gen = Json.createGenerator(out)) {
            gen.writeStartObject();

            if (errorReason != null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                gen.write("error", errorReason);
            }

            gen.writeEnd();
        }
    }
}
