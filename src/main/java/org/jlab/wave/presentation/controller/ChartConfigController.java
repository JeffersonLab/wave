package org.jlab.wave.presentation.controller;

import javax.json.Json;
import javax.json.stream.JsonGenerator;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;

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

        response.setContentType("application/json");

        OutputStream out = response.getOutputStream();

        try (JsonGenerator gen = Json.createGenerator(out)) {
            gen.writeStartObject();

            if (errorReason != null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                gen.write("error", errorReason);
            } else {

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
