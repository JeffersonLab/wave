package org.jlab.wave;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author ryans
 */
@WebServlet(name = "ChartController", urlPatterns = {"/chart"})
public class ChartController extends HttpServlet {

    public static final String MYGET_URL;
    
    static {
        String mygetUrl = System.getenv("WAVE_MYGET_URL");
        
        if(mygetUrl == null) {
            mygetUrl = "/myget";
        }
        
        MYGET_URL = mygetUrl;
    }
    
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
        
        request.setAttribute("mygetUrl", MYGET_URL);
        
        request.getRequestDispatcher("/WEB-INF/views/chart.jsp").forward(request, response);
    }
}
