package net.cbdweb;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Params extends HttpServlet {
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    PrintWriter out = resp.getWriter();
    out.println("<html>");
    out.println("<center><table>");
    out.println("<tr>");
    out.println("<td>Method</td>");
    out.println("<td>" + req.getMethod() + "</td>");
    out.println("</tr>");

    out.println("<tr>");
    out.println("<td>Client</td>");
    out.println("<td>" + req.getRemoteHost() + "</td>");
    out.println("</tr>");

    out.println("<tr>");
    out.println("<td>Protocol</td>");
    out.println("<td>" + req.getProtocol() + "</td>");
    out.println("</tr>");

    java.util.Enumeration e = req.getHeaderNames();
    while (e.hasMoreElements()) {
      String name = (String) e.nextElement();
      out.println("<tr>");
      out.println("<td>header '" + name + "'</td>");
      out.println("<td>" + req.getHeader(name) + "</td>");
      out.println("</tr>");
    }

    out.println("</table></center><br><hr><br>");

    out.println("<h2><center>");
    out.println("Server Properties</center></h2>");
    out.println("<br>");

    out.println("<center><table>");

    java.util.Properties props = System.getProperties();
    e = props.propertyNames();

    while (e.hasMoreElements()) {
      String name = (String) e.nextElement();
      out.println("<tr>");
      out.println("<td>" + name + "</td>");
      out.println("<td>" + props.getProperty(name) + "</td>");
      out.println("</tr>");
    }
    out.println("</table></center>");

    out.println("</html>");
    out.flush();
  }

  public void init() throws ServletException {
    ServletConfig config = getServletConfig();
  }

  public void destroy() {
  }
}
