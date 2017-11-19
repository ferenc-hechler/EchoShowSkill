package de.hechler.simpledb;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DBConnection {

	private final static Logger logger = Logger.getLogger(DBConnection.class.getName());
	
	private static DBConnection instance;
	public static DBConnection getInstance() {
		if (instance == null) {
			instance = new DBConnection();
		}
		return instance;
	}
	
	private final String driverClassName;
	private final String jdbcUrl;
	private final String user;
	private final String password;
	
	private DBConnection() {
		try {
			Properties dbProps = getDBProperties();
			driverClassName = dbProps.getProperty("db.driverClassName");
			jdbcUrl = dbProps.getProperty("db.jdbcUrl");
			user = dbProps.getProperty("db.user");
			password = dbProps.getProperty("db.password");
			Class<?> clazz = Class.forName(driverClassName);
			logger.info("DRIVER="+clazz);
					
		} catch (Exception e) {
			logger.log(Level.SEVERE, e.toString(), e);
			throw new RuntimeException(e);
		}
	}
	
	private Properties getDBProperties() throws FileNotFoundException, IOException {
		String seed = getClass().getSimpleName();
		Properties result = new Properties();
		String configFolder = System.getProperty("simpledb-conf", "/etc");
		File dbPropsFile = Paths.get(configFolder).resolve("simpledb.properties").toFile().getAbsoluteFile();
		result.load(new FileInputStream(dbPropsFile));
		String pw = result.getProperty("db.password");
		if (pw != null) {
			String enc = SimpleCrypto.encrypt(seed, pw);
			throw new RuntimeException("remove db.password from '"+dbPropsFile.getAbsolutePath()+"' and use db.password.enc="+enc);
		}
		String encPW = result.getProperty("db.password.enc");
		pw = SimpleCrypto.decrypt(seed, encPW);
		result.setProperty("db.password", pw);
		return result;
	}

	public Connection getConnection() {
		logger.info("getting connection");
		if (user.equals("NODB")) {
			return null;
		}
		Connection conn = null;
		try {
			conn = DriverManager.getConnection(jdbcUrl, user, password);
			logger.info("CONN="+conn+"\n");

		} catch (Exception ex) {
			logger.log(Level.SEVERE, ex.toString(), ex);
			throw new RuntimeException(ex);
		} 
		return conn;	
	}

	public boolean isActive() {
		if (user.equals("NODB")) {
			return false;
		}
		return true;
	}
}
