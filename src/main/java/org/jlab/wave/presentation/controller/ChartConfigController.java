package org.jlab.wave.presentation.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import javax.json.Json;
import javax.json.stream.JsonGenerator;
import org.jlab.wave.business.service.ChartService;
import org.jlab.wave.persistence.model.Chart;
import org.jlab.wave.persistence.model.Series;

/**
 * @author ryans
 */
@WebServlet(
    name = "ChartConfigController",
    urlPatterns = {"/chart-config"})
public class ChartConfigController extends HttpServlet {

  /**
   * Handles the HTTP <code>GET</code> method. Get Chart.
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

    ChartService service = new ChartService();

    List<Chart> list = null;

    try {
      list = service.fetch();
    } catch (SQLException e) {
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
        for (Chart config : list) {
          gen.writeStartObject();
          gen.write("chart-id", config.getChartId());

          if (config.getUser() == null) {
            gen.writeNull("user");
          } else {
            gen.write("user", config.getUser());
          }

          gen.write("name", config.getName());

          if (config.getStart() == null) {
            gen.writeNull("start");
          } else {
            gen.write(
                "start",
                DateTimeFormatter.ISO_INSTANT.format(
                    config.getStart().truncatedTo(ChronoUnit.SECONDS)));
          }

          if (config.getEnd() == null) {
            gen.writeNull("end");
          } else {
            gen.write(
                "end",
                DateTimeFormatter.ISO_INSTANT.format(
                    config.getEnd().truncatedTo(ChronoUnit.SECONDS)));
          }

          gen.write("window-minutes", config.getWindowMinutes());

          gen.write("mya-deployment", config.getMyaDeployment());

          gen.write("mya-limit", config.getMyaLimit());

          gen.writeStartArray("series");

          for (Series series : config.getSeriesList()) {
            gen.writeStartObject();
            gen.write("series-id", series.getSeriesId());
            gen.write("pv", series.getPv());
            gen.write("weight", series.getWeight());

            if (series.getLabel() == null) {
              gen.writeNull("label");
            } else {
              gen.write("label", series.getLabel());
            }

            if (series.getColor() == null) {
              gen.writeNull("color");
            } else {
              gen.write("color", series.getColor());
            }

            if (series.getyAxisLabel() == null) {
              gen.writeNull("y-axis-label");
            } else {
              gen.write("y-axis-label", series.getyAxisLabel());
            }

            if (series.getyAxisMin() == null) {
              gen.writeNull("y-axis-min");
            } else {
              gen.write("y-axis-min", series.getyAxisMin());
            }

            if (series.getyAxisMax() == null) {
              gen.writeNull("y-axis-max");
            } else {
              gen.write("y-axis-max", series.getyAxisMax());
            }

            gen.write("y-axis-log-scale", series.isyAxisLogScale());

            if (series.getScaler() == null) {
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
   * Handles the HTTP <code>POST</code> method. Create Chart.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String errorReason = null;

    ChartService service = new ChartService();

    Chart chart = requestToChart(request);

    try {
      service.create(chart);
    } catch (SQLException e) {
      errorReason = e.getMessage();
    }

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

  /**
   * Handles the HTTP <code>PUT</code> method. Update Chart.
   *
   * @param request servlet request
   * @param response servlet response
   * @throws ServletException if a servlet-specific error occurs
   * @throws IOException if an I/O error occurs
   */
  @Override
  protected void doPut(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String errorReason = null;

    ChartService service = new ChartService();

    Chart chart = requestToChart(request);

    try {
      service.update(chart);
    } catch (SQLException e) {
      errorReason = e.getMessage();
    }

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

  private Chart requestToChart(HttpServletRequest request) {
    Chart chart = new Chart();

    // For new charts this will be null (and should be ignored if provided)
    chart.setChartId(parseLong(request.getParameter("chart-id")));

    chart.setUser(request.getRemoteUser());

    chart.setName(request.getParameter("name"));
    chart.setStart(parseInstant(request.getParameter("start")));
    chart.setEnd(parseInstant(request.getParameter("end")));
    chart.setWindowMinutes(parseInt(request.getParameter("window-minutes")));
    chart.setMyaDeployment(request.getParameter("mya-deployment"));
    chart.setMyaLimit(parseLong(request.getParameter("mya-limit")));

    List<Series> seriesList = new ArrayList<>();

    String[] seriesIdList = request.getParameterValues("series-id");
    String[] pvList = request.getParameterValues("pv");
    String[] weightList = request.getParameterValues("weight");
    String[] labelList = request.getParameterValues("label");
    String[] colorList = request.getParameterValues("color");
    String[] yAxisLabelList = request.getParameterValues("y-axis-label");
    String[] yAxisMinList = request.getParameterValues("y-axis-min");
    String[] yAxisMaxList = request.getParameterValues("y-axis-max");
    String[] yAxisLogScaleList = request.getParameterValues("y-axis-log-scale");
    String[] scalerList = request.getParameterValues("scaler");

    for (int i = 0; i < pvList.length; i++) {
      Series series = new Series();

      // For new series this will be null (and should be ignored if provided)
      series.setSeriesId(parseLong(seriesIdList[i]));

      series.setPv(pvList[i]);
      series.setWeight(parseShort(weightList[i]));
      series.setLabel(labelList[i]);
      series.setColor(colorList[i]);
      series.setyAxisLabel(yAxisLabelList[i]);
      series.setyAxisMin(parseFloatBox(yAxisMinList[i]));
      series.setyAxisMax(parseFloatBox(yAxisMaxList[i]));
      series.setyAxisLogScale(parseBoolean(yAxisLogScaleList[i]));
      series.setScaler(parseFloatBox(scalerList[i]));

      seriesList.add(series);
    }

    chart.setSeriesList(seriesList);

    return chart;
  }

  private Float parseFloatBox(String input) {
    Float output = null;

    if (input != null) {
      output = Float.parseFloat(input);
    }

    return output;
  }

  private boolean parseBoolean(String input) {
    boolean output = false;

    if (input != null) {
      output = "true".equals(input);
    }

    return output;
  }

  private long parseLong(String input) {
    long output = 0;

    if (input != null) {
      output = Long.parseLong(input);
    }

    return output;
  }

  private int parseInt(String input) {
    int output = 0;

    if (input != null) {
      output = Integer.parseInt(input);
    }

    return output;
  }

  private short parseShort(String input) {
    short output = 0;

    if (input != null) {
      output = Short.parseShort(input);
    }

    return output;
  }

  private Instant parseInstant(String input) {
    Instant output = null;

    if (input != null) {
      output = Instant.parse(input);
    }

    return output;
  }
}
