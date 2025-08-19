package org.jlab.wave.persistence.util;

import java.sql.Connection;
import java.sql.SQLException;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

public class DatabaseManager {
  private static final DataSource ds;

  static {
    try {
      final Context initCtx = new InitialContext();
      final Context envCtx = (Context) initCtx.lookup("java:comp/env");
      ds = (DataSource) envCtx.lookup("jdbc/wave");
    } catch (NamingException e) {
      throw new ExceptionInInitializerError(e);
    }
  }

  public static Connection getConnection() throws SQLException {
    return ds.getConnection();
  }
}
