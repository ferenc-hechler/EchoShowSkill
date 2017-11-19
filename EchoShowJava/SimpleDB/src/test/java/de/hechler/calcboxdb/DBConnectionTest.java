package de.hechler.calcboxdb;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Logger;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import de.hechler.simpledb.DBConnection;

public class DBConnectionTest {

	private final static Logger logger = Logger.getLogger(DBConnectionTest.class.getName());

	@Before
	public void setup() {
		System.setProperty("simpledb-conf", "localconf");
	}
	
	@Test
	public void showDBData() {
		logger.info("showDBData");
		StringBuffer result = new StringBuffer();
		Statement st = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = DBConnection.getInstance().getConnection();
			st = conn.createStatement();
			logger.info("ST="+st);
			rs = st.executeQuery("SELECT ID, APP, USERNAME, DATA FROM USERDATA");
			logger.info("RS"+rs);
			result.append("<p><table>\n");
			result.append("<tr><td>ID</td><td>name</td><td>status</td><td>text</td></tr>\n");
			while (rs.next()) {
				int id = rs.getInt("id");
				String status = rs.getString("app");
				String name = rs.getString("username");
				String solotext = rs.getString("data");
				result.append("<td>" + id + "</td>");
				result.append("<td>" + name + "</td>");
				result.append("<td>" + status+ "</td></tr>");
				result.append("<td>" + solotext+ "</td></tr>");
				
			}
			result.append("</table></p>\n");
		} catch (RuntimeException e) {
			throw e;
		} catch (SQLException e) {
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e) { e.printStackTrace(); }
			try { if (st != null) st.close(); } catch (SQLException e) { e.printStackTrace(); }
			try { if (conn != null) conn.close(); } catch (SQLException e) { e.printStackTrace(); }
		}
		System.out.println(result.toString());	
	}

	
	
//
//	// Prepare a statement to insert a record
//	String sql = "INSERT INTO TermsAndConditions (name,description,ownerID)  VALUES  (?,?,?)";
//	PreparedStatement pstmt = connection.prepareStatement(sql);
//
//	// Set the values
//	pstmt.setString(1, "bar condtions");
//	pstmt.setString(2, "Don't be stealin my stuff");
//	pstmt.setString(3, "2");
//
//	// Insert the row
//	pstmt.executeUpdate();
	
}
