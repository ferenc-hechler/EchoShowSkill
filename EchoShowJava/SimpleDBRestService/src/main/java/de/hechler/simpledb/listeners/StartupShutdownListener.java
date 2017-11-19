package de.hechler.simpledb.listeners;

import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import de.hechler.simpledb.ConnectionMgmt;
import de.hechler.simpledb.DBConnection;;

public class StartupShutdownListener implements ServletContextListener {

	@Override
	public void contextInitialized(ServletContextEvent sce) {
		checkRuntime();
	}
	
	@Override
	public void contextDestroyed(ServletContextEvent sce) {
		ConnectionMgmt.shutdown();
	}
	
	
	private void checkRuntime() {
		if (DBConnection.getInstance().isActive()) {
			Connection connection = DBConnection.getInstance().getConnection();
			if (connection != null) {
				try {
					connection.close();
				} catch (SQLException e) {
					throw new RuntimeException(e);
				}
			}
		}
	}
	
}
