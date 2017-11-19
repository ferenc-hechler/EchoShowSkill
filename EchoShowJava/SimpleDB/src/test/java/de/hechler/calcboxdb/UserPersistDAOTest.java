package de.hechler.calcboxdb;

import static org.junit.Assert.*;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import de.hechler.simpledb.UserPersistDAO;
import de.hechler.simpledb.UserPersistDAO.UserInfo;

public class UserPersistDAOTest {

	private static UserPersistDAO userPersistDAO; 
	
	@BeforeClass
	public static void setUpBefore() throws Exception {
		System.setProperty("simpledb-conf", "localconf");
		userPersistDAO = new UserPersistDAO();
		userPersistDAO.save("JUNIT-2", "USER-A", "INITIAL DATA FOR JUNIT-2.USER-A");
		userPersistDAO.save("JUNIT-3", "USER-A", "INITIAL DATA FOR JUNIT-3.USER-A");
		userPersistDAO.save("JUNIT-3", "USER-B", "INITIAL DATA FOR JUNIT-3.USER-B");
	}

	@AfterClass
	public static void tearDownAfterClass() throws Exception {
		userPersistDAO.delete("JUNIT-1", "USER-A");
		userPersistDAO.delete("JUNIT-1", "USER-B");
		userPersistDAO.delete("JUNIT-1", "USER-C");
		userPersistDAO.delete("JUNIT-2", "USER-A");
		userPersistDAO.delete("JUNIT-2", "USER-B");
		userPersistDAO.delete("JUNIT-2", "USER-C");
		userPersistDAO.delete("JUNIT-3", "USER-A");
		userPersistDAO.delete("JUNIT-3", "USER-B");
		userPersistDAO.delete("JUNIT-3", "USER-C");
		userPersistDAO = null;
	}

	@Test
	public void testLookupUserId() {
		// user not found returns false and user id is 0
		UserInfo userInfo1A = new UserInfo("JUNIT-1", "USER-A", null);
		boolean found = userPersistDAO.lookupUserId(userInfo1A);
		assertFalse(found);
		assertEquals(0, userInfo1A.getUserId());
		
		// user found sets user id
		UserInfo userInfo2A = new UserInfo("JUNIT-2", "USER-A", null);
		found = userPersistDAO.lookupUserId(userInfo2A);
		assertTrue(found);
		int userId2A = userInfo2A.getUserId();
		assertTrue(userId2A > 0);
		
		// another user has another id
		UserInfo userInfo3A = new UserInfo("JUNIT-3", "USER-A", null);
		found = userPersistDAO.lookupUserId(userInfo3A);
		assertTrue(found);
		int userId3A = userInfo3A.getUserId();
		assertTrue(userId3A > 0);
		assertNotEquals(userId2A, userId3A);
		
		// second lookup with data returns same id, data is not changed
		UserInfo userInfo3A_b = new UserInfo("JUNIT-3", "USER-A", "changed data");
		found = userPersistDAO.lookupUserId(userInfo3A_b);
		assertTrue(found);
		assertEquals(userId3A, userInfo3A_b.getUserId());
		assertEquals("changed data", userInfo3A_b.getData());
	}

	@Test
	public void testGetUserId() {
		int userId1A = userPersistDAO.getUserId("JUNIT-1", "USER-A");
		assertEquals(0, userId1A);
		int userId2A = userPersistDAO.getUserId("JUNIT-2", "USER-A");
		assertNotEquals(0, userId2A);
		int userId3A = userPersistDAO.getUserId("JUNIT-3", "USER-A");
		assertNotEquals(0, userId3A);
		assertNotEquals(userId2A, userId3A);
		int userId3A_b = userPersistDAO.getUserId("JUNIT-3", "USER-A");
		assertNotEquals(0, userId3A);
		assertEquals(userId3A, userId3A_b);
	}

	@Test
	public void testReloadUserInfo() {
		UserInfo userInfo2A = userPersistDAO.getUserInfo("JUNIT-2", "USER-A");
		assertNotNull(userInfo2A);
		String oldData = userInfo2A.getData();
		assertNotEquals("new data 2A", oldData);
			
		try { 
			// change data in db
			userPersistDAO.update("JUNIT-2", "USER-A", "new data 2A");
	
			// data is not changed in already loaded user-info
			assertEquals(oldData, userInfo2A.getData());
	
			boolean reloaded = userPersistDAO.reloadUserInfo(userInfo2A);
			assertTrue(reloaded);
			assertEquals("new data 2A", userInfo2A.getData());
		}
		finally {
			// restore old state
			userPersistDAO.update("JUNIT-2", "USER-A", oldData);
		}
	}

	@Test
	public void testGetUserInfoInt() {
		// non existing id returns null
		UserInfo userInfo = userPersistDAO.getUserInfo(-1);
		assertNull(userInfo);

		int userId = userPersistDAO.getUserId("JUNIT-2", "USER-A");
		userInfo = userPersistDAO.getUserInfo(userId);
		assertNotNull(userInfo);
		assertEquals(userId, userInfo.getUserId());
		assertEquals("JUNIT-2", userInfo.getApp());
		assertEquals("JUNIT-2", userInfo.getApp());
		assertEquals("USER-A", userInfo.getUserName());
		assertEquals("INITIAL DATA FOR JUNIT-2.USER-A", userInfo.getData());
	}

	@Test
	public void testGetUserInfoStringString() {
		// non existing id returns null
		UserInfo userInfo = userPersistDAO.getUserInfo("JUNIT-1", "USER-A");
		assertNull(userInfo);

		int userId = userPersistDAO.getUserId("JUNIT-2", "USER-A");
		userInfo = userPersistDAO.getUserInfo("JUNIT-2", "USER-A");
		assertNotNull(userInfo);
		assertEquals(userId, userInfo.getUserId());
		assertEquals("JUNIT-2", userInfo.getApp());
		assertEquals("USER-A", userInfo.getUserName());
		assertEquals("INITIAL DATA FOR JUNIT-2.USER-A", userInfo.getData());
	}

	@Test
	public void testSaveOrUpdateUserInfo() {
		try {
			UserInfo userInfo = new UserInfo("JUNIT-1", "USER-B", "Data 2B");
			boolean ok = userPersistDAO.saveOrUpdate(userInfo);
			assertTrue(ok);
			
			UserInfo userInfoCheck = userPersistDAO.getUserInfo("JUNIT-1", "USER-B");
			assertNotNull(userInfoCheck);
			assertEquals("Data 2B", userInfoCheck.getData());
			
			userInfo.setData("Changed Data 2B");
			ok = userPersistDAO.saveOrUpdate(userInfo);
			assertTrue(ok);
			
			userInfoCheck = userPersistDAO.getUserInfo("JUNIT-1", "USER-B");
			assertNotNull(userInfoCheck);
			assertEquals("Changed Data 2B", userInfoCheck.getData());
		}
		finally {
			userPersistDAO.delete("JUNIT-1", "USER-B");
		}
	}

	@Test
	public void testSaveOrUpdateStringStringString() {
		try {
			boolean ok = userPersistDAO.saveOrUpdate("JUNIT-1", "USER-B", "Data 2B");
			assertTrue(ok);
			
			UserInfo userInfo = userPersistDAO.getUserInfo("JUNIT-1", "USER-B");
			assertNotNull(userInfo);
			assertEquals("Data 2B", userInfo.getData());
			
			ok = userPersistDAO.saveOrUpdate("JUNIT-1", "USER-B", "Changed Data 2B");
			assertTrue(ok);

			userInfo = userPersistDAO.getUserInfo("JUNIT-1", "USER-B");
			assertEquals("Changed Data 2B", userInfo.getData());
		}
		finally {
			userPersistDAO.delete("JUNIT-1", "USER-B");
		}
	}

	@Test
	public void testSaveUserInfo() {
		try {
			UserInfo userInfo = new UserInfo("JUNIT-1", "USER-B", "Data 2B");
			boolean ok = userPersistDAO.save(userInfo);
			assertTrue(ok);
		
			int userId = userPersistDAO.getUserId("JUNIT-1", "USER-B");
			userInfo = userPersistDAO.getUserInfo(userId);
			assertNotNull(userInfo);
			assertEquals(userId, userInfo.getUserId());
			assertEquals("JUNIT-1", userInfo.getApp());
			assertEquals("USER-B", userInfo.getUserName());
			assertEquals("Data 2B", userInfo.getData());
		}
		finally {
			userPersistDAO.delete("JUNIT-1", "USER-B");
		}
	}

	@Test
	public void testSaveStringStringString() {
		try {
			int userId = userPersistDAO.save("JUNIT-1", "USER-B", "Data 2B");
			assertNotEquals(0, userId);

			try {
				userPersistDAO.save("JUNIT-1", "USER-B", "Data 2B");
				fail("saving duplicate entrys did not fail.");
			}
			catch (Exception e) {
				assertTrue(e.toString().toLowerCase().contains("constraint"));
			}
			
			UserInfo userInfo = userPersistDAO.getUserInfo(userId);
			assertNotNull(userInfo);
			assertEquals(userId, userInfo.getUserId());
			assertEquals("JUNIT-1", userInfo.getApp());
			assertEquals("USER-B", userInfo.getUserName());
			assertEquals("Data 2B", userInfo.getData());
			
		}
		finally {
			userPersistDAO.delete("JUNIT-1", "USER-B");
		}
	}

	@Test
	public void testUpdateUserInfo() {
		UserInfo userInfo = userPersistDAO.getUserInfo("JUNIT-3", "USER-B");
		assertNotNull(userInfo);
		assertNotEquals("changed data 3B", userInfo.getData());
		String oldData = userInfo.getData();
		try {
			userInfo.setData("changed data 3B");
			userPersistDAO.update(userInfo);
			UserInfo updatedUserInfo = userPersistDAO.getUserInfo("JUNIT-3", "USER-B");
			assertEquals(userInfo.getUserId(), updatedUserInfo.getUserId());
			assertEquals("JUNIT-3", updatedUserInfo.getApp());
			assertEquals("USER-B", updatedUserInfo.getUserName());
			assertEquals("changed data 3B", updatedUserInfo.getData());
		}
		finally {
			userPersistDAO.update("JUNIT-3", "USER-B", oldData);
		}
	}

	@Test
	public void testUpdateStringStringString() {
		UserInfo userInfo = userPersistDAO.getUserInfo("JUNIT-3", "USER-B");
		assertNotNull(userInfo);
		assertNotEquals("changed data 3B", userInfo.getData());
		String oldData = userInfo.getData();
		try {
			userPersistDAO.update("JUNIT-3", "USER-B", "changed data 3B");
			UserInfo updatedUserInfo = userPersistDAO.getUserInfo("JUNIT-3", "USER-B");
			assertEquals(userInfo.getUserId(), updatedUserInfo.getUserId());
			assertEquals("JUNIT-3", updatedUserInfo.getApp());
			assertEquals("USER-B", updatedUserInfo.getUserName());
			assertEquals("changed data 3B", updatedUserInfo.getData());
		}
		finally {
			userPersistDAO.update("JUNIT-3", "USER-B", oldData);
		}
	}

	@Test
	public void testDeleteUserInfo() {
		UserInfo userInfo = new UserInfo("JUNIT-1", "USER-B", "Data 2B");
		boolean ok = userPersistDAO.save(userInfo);
		assertTrue(ok);
		
		ok = userPersistDAO.delete(userInfo);
		assertTrue(ok);

		ok = userPersistDAO.delete(userInfo);
		assertFalse(ok);

	}

	@Test
	public void testDeleteInt() {
		UserInfo userInfo = new UserInfo("JUNIT-1", "USER-B", "Data 2B");
		boolean ok = userPersistDAO.save(userInfo);
		assertTrue(ok);
		
		ok = userPersistDAO.delete(userInfo.getUserId());
		assertTrue(ok);

		ok = userPersistDAO.delete(userInfo.getUserId());
		assertFalse(ok);
	}

	@Test
	public void testDeleteStringString() {
		UserInfo userInfo = new UserInfo("JUNIT-1", "USER-B", "Data 2B");
		boolean ok = userPersistDAO.save(userInfo);
		assertTrue(ok);
		
		ok = userPersistDAO.delete("JUNIT-1", "USER-B");
		assertTrue(ok);

		ok = userPersistDAO.delete("JUNIT-1", "USER-B");
		assertFalse(ok);
	}

}
