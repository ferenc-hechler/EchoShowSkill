package de.hechler.simpledb;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ConnectionMgmt {

	private final static Logger logger = Logger.getLogger(ConnectionMgmt.class.getName());
	
	// just the simplest possibility to manage connections, all share one instance :(
	private static Connection connection;

	public static synchronized Connection getConnection() {
		Connection conn = connection; 
		if (conn != null) {
			try {
				if (!conn.isValid(2)) {
					logger.log(Level.WARNING, "closing invalid connection"); 
					conn = null;
				}
			}
			catch (Exception e) {
				logger.log(Level.WARNING, "connection became invalid: "+e.toString(), e); 
				conn = null;
			}
		}
		if (conn == null) {
			conn = DBConnection.getInstance().getConnection();
			connection = conn;
		}
		return conn;
	}

	public static synchronized void releaseConnection(Connection conn) {
		// currently no pooling, so nothing to release.
	}

	public static synchronized void fail(Connection conn) {
		if (conn == connection) {
			closeConnection();
		}
	}

	public static synchronized void closeConnection() {
		Connection conn = connection;
		connection = null;
		if (conn != null) {
			try { 
				conn.close(); 
			} 
			catch (SQLException e)	{ 
				logger.log(Level.WARNING, "close connection failed: "+e.toString(), e); 
			}
		}
	}

	public static synchronized void shutdown() {
		closeConnection();
	}

	
	
}
