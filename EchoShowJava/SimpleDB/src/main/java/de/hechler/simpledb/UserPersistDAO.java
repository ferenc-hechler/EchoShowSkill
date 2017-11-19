package de.hechler.simpledb;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.mysql.jdbc.Statement;

public class UserPersistDAO {

	private final static Logger logger = Logger.getLogger(UserPersistDAO.class.getName());
	
	public static class UserInfo {
		private int userId;
		private String userName;
		private String app;
		private String data;
		public UserInfo(String app, String userName, String data) {
			this(0, app, userName, data);
		}
		private UserInfo(int userId, String app, String userName, String data) {
			this.userId = userId;
			this.app = app;
			this.userName = userName;
			this.data = data;
		}
		public int getUserId() {
			return userId;
		}
		private void setUserId(int userId) {
			this.userId = userId;
		}
		public String getUserName() {
			return userName;
		}
		public String getApp() {
			return app;
		}
		public String getData() {
			return data;
		}
		public void setData(String data) {
			this.data = data;
		}
		private void copyFrom(UserInfo newUserInfo) {
			this.userId = newUserInfo.getUserId();
			this.app = newUserInfo.getApp();
			this.userName = newUserInfo.getUserName();
			this.data = newUserInfo.getData();
		}
	}
	
	
	/* ============ */
	/* FIND USER-ID */
	/* ============ */

	
	public synchronized boolean lookupUserId(UserInfo userInfo) {
		int result = getUserId(userInfo.getApp(), userInfo.getUserName());
		if (result > 0) {
			userInfo.setUserId(result);
		}
		return (result > 0);
	}

	public synchronized int getUserId(String app, String userName) {
		int result = 0;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("SELECT ID FROM USERDATA WHERE APP = ? AND USERNAME = ?");
			pst.setString(1, app);
			pst.setString(2, userName);
			rs = pst.executeQuery();
			if (rs.next()) {
				result = rs.getInt(1);
			}
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return result;	
	}

	
	/* ============== */
	/* READ USER-INFO */
	/* ============== */

	
	public synchronized boolean reloadUserInfo(UserInfo userInfo) {
		UserInfo newUserInfo; 
		if (userInfo.getUserId() > 0) {
			newUserInfo = getUserInfo(userInfo.getUserId());
		}
		else {
			newUserInfo = getUserInfo(userInfo.getApp(), userInfo.getUserName());
		}
		if (newUserInfo != null) {
			userInfo.copyFrom(newUserInfo);
		}
		return (newUserInfo != null);
	}

	public synchronized UserInfo getUserInfo(int userId) {
		UserInfo result = null;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("SELECT APP, USERNAME, DATA FROM USERDATA WHERE ID = ?");
			pst.setInt(1, userId);
			rs = pst.executeQuery();
			if (rs.next()) {
				String app = rs.getString(1);
				String userName = rs.getString(2);
				String data = rs.getString(3);
				result = new UserInfo(userId, app, userName, data);
			}
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return result;	
	}
	
	public synchronized UserInfo getUserInfo(String app, String userName) {
		UserInfo result = null;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("SELECT ID, DATA FROM USERDATA WHERE APP = ? AND USERNAME = ?");
			pst.setString(1, app);
			pst.setString(2, userName);
			rs = pst.executeQuery();
			if (rs.next()) {
				int userId = rs.getInt(1);
				String data = rs.getString(2);
				result = new UserInfo(userId, app, userName, data);
			}
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return result;	
	}

	
	/* ============== */
	/* SAVE OR UPDATE */
	/* ============== */

	
	public synchronized boolean saveOrUpdate(UserInfo userInfo) {
		boolean result;
		if (userInfo.getUserId() > 0) {
			result = update(userInfo);
		}
		else {
			lookupUserId(userInfo);
			if (userInfo.getUserId() > 0) {
				result = update(userInfo);
			}
			else {
				result = save(userInfo);
			}
		}
		return result;
	}

	public boolean saveOrUpdate(String app, String userName, String data) {
		int cnt = update(app, userName, data);
		if (cnt == 0) {
			int auto_id = save(app, userName, data);
			if (auto_id > 0) {
				cnt = 1;
			}
		}
		return cnt == 1;
	}
	

	/* ==== */
	/* SAVE */
	/* ==== */


	public boolean save(UserInfo userInfo) {
		int auto_id = save(userInfo.getApp(), userInfo.getUserName(), userInfo.getData());
		if (auto_id > 0) {
			userInfo.setUserId(auto_id);
		}
		return (auto_id > 0);
		
	}

	public int save(String app, String userName, String data) {
		int auto_id = 0;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("INSERT INTO USERDATA(APP, USERNAME, DATA, LASTUPDATE) VALUES(?,?,?,NOW())", Statement.RETURN_GENERATED_KEYS);
			pst.setString(1, app);
			pst.setString(2, userName);
			pst.setString(3, data);
			int cnt = pst.executeUpdate();
			if (cnt == 1) {
				rs = pst.getGeneratedKeys();
			    rs.next();
			    auto_id = rs.getInt(1);
			}
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return auto_id;
	}

	
	/* ====== */
	/* UPDATE */
	/* ====== */

	
	public boolean update(UserInfo userInfo) {
		int cnt;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("UPDATE USERDATA SET APP = ?, USERNAME = ?, DATA = ?, LASTUPDATE = NOW() WHERE ID = ?");
			pst.setString(1, userInfo.getApp());
			pst.setString(2, userInfo.getUserName());
			pst.setString(3, userInfo.getData());
			pst.setInt(4, userInfo.getUserId());
			cnt = pst.executeUpdate();
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return cnt == 1;
	}

	public boolean updateData(int userId, String data) {
		int cnt;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("UPDATE USERDATA SET DATA = ?, LASTUPDATE = NOW() WHERE ID = ?");
			pst.setString(1, data);
			pst.setInt(2, userId);
			cnt = pst.executeUpdate();
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return cnt == 1;
	}

	public int update(String app, String userName, String data) {
		int cnt;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("UPDATE USERDATA SET DATA = ?, LASTUPDATE = NOW() WHERE APP = ? AND USERNAME = ?");
			pst.setString(1, data);
			pst.setString(2, app);
			pst.setString(3, userName);
			cnt = pst.executeUpdate();
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return cnt;
	}

	
	/* ====== */
	/* DELETE */
	/* ====== */


	public synchronized boolean delete(UserInfo userInfo) {
		if (userInfo.getUserId() > 0) {
			return delete(userInfo.getUserId());
		}
		return delete(userInfo.getApp(), userInfo.getUserName());
	}

	public synchronized boolean delete(int userId) {
		int cnt = 0;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("DELETE FROM USERDATA WHERE ID = ?");
			pst.setInt(1, userId);
			cnt = pst.executeUpdate();
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return cnt == 1;
	}

	public synchronized boolean delete(String app, String userName) {
		int cnt = 0;
		PreparedStatement pst = null;
		ResultSet rs = null;
		Connection conn = null;
		try {
			conn = ConnectionMgmt.getConnection();
			pst = conn.prepareStatement("DELETE FROM USERDATA WHERE APP = ? AND USERNAME = ?");
			pst.setString(1, app);
			pst.setString(2, userName);
			cnt = pst.executeUpdate();
		} catch (RuntimeException e) {
			ConnectionMgmt.fail(conn);
			throw e;
		} catch (SQLException e) {
			ConnectionMgmt.fail(conn);
			throw new RuntimeException(e);
		} finally {
			try { if (rs != null) rs.close(); } catch (SQLException e)		{ logger.log(Level.SEVERE, e.toString(), e); }
			try { if (pst != null) pst.close(); } catch (SQLException e) 	{ logger.log(Level.SEVERE, e.toString(), e); }
			ConnectionMgmt.releaseConnection(conn);
		}
		return cnt == 1;
	}
	

}
