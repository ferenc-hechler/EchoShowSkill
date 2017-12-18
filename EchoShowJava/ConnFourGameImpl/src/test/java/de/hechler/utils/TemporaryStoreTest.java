package de.hechler.utils;

import static org.junit.Assert.*;

import org.junit.Test;

public class TemporaryStoreTest {

	private final static long WAIT_TIME = 50;
	
	@Test
	public void testPut() {
		TemporaryStore<String, Integer> tStore = new TemporaryStore<>(3*WAIT_TIME);
		tStore.put("null", 0);
		sleep(WAIT_TIME);
		tStore.put("eins", 1);
		tStore.put("zwei", 2);
		sleep(WAIT_TIME);
		tStore.put("drei", 3);
		Integer iNull = tStore.get("null");
		assertEquals(0, iNull.intValue());
		Integer iEins = tStore.get("eins");
		assertEquals(1, iEins.intValue());
		Integer iZwei = tStore.get("zwei");
		assertEquals(2, iZwei.intValue());
		Integer iDrei = tStore.get("drei");
		assertEquals(3, iDrei.intValue());
		sleep(WAIT_TIME);
		tStore.put("eins", 99);
		sleep(WAIT_TIME/2);
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertEquals(99, iEins.intValue());
		iZwei = tStore.get("zwei");
		assertEquals(2, iZwei.intValue());
		iDrei = tStore.get("drei");
		assertEquals(3, iDrei.intValue());
		sleep(WAIT_TIME);
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertEquals(99, iEins.intValue());
		iZwei = tStore.get("zwei");
		assertNull(iZwei);
		iDrei = tStore.get("drei");
		assertEquals(3, iDrei.intValue());
		sleep(WAIT_TIME);
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertEquals(99, iEins.intValue());
		iZwei = tStore.get("zwei");
		assertNull(iZwei);
		iDrei = tStore.get("drei");
		assertNull(iDrei);
		sleep(WAIT_TIME);
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertNull(iEins);
		iZwei = tStore.get("zwei");
		assertNull(iZwei);
		iDrei = tStore.get("drei");
		assertNull(iDrei);
	}
	
	@Test
	public void testPutTimeout() {
		TemporaryStore<String, Integer> tStore = new TemporaryStore<>(3*WAIT_TIME);
		tStore.put("null", 0, WAIT_TIME);
		tStore.put("eins", 1, 99*WAIT_TIME);
		tStore.put("zwei", 2, 2*WAIT_TIME);
		tStore.put("drei", 3, 3*WAIT_TIME);
		Integer iNull = tStore.get("null");
		assertEquals(0, iNull.intValue());
		Integer iEins = tStore.get("eins");
		assertEquals(1, iEins.intValue());
		Integer iZwei = tStore.get("zwei");
		assertEquals(2, iZwei.intValue());
		Integer iDrei = tStore.get("drei");
		assertEquals(3, iDrei.intValue());
		sleep(WAIT_TIME);
		tStore.put("eins", 99, 3*WAIT_TIME);
		sleep(WAIT_TIME/2);
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertEquals(99, iEins.intValue());
		iZwei = tStore.get("zwei");
		assertEquals(2, iZwei.intValue());
		iDrei = tStore.get("drei");
		assertEquals(3, iDrei.intValue());
		sleep(WAIT_TIME);
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertEquals(99, iEins.intValue());
		iZwei = tStore.get("zwei");
		assertNull(iZwei);
		iDrei = tStore.get("drei");
		assertEquals(3, iDrei.intValue());
		sleep(WAIT_TIME);
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertEquals(99, iEins.intValue());
		iZwei = tStore.get("zwei");
		assertNull(iZwei);
		iDrei = tStore.get("drei");
		assertNull(iDrei);
		sleep(WAIT_TIME);
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertNull(iEins);
		iZwei = tStore.get("zwei");
		assertNull(iZwei);
		iDrei = tStore.get("drei");
		assertNull(iDrei);
	}

	@Test
	public void testRemove() {
		TemporaryStore<String, Integer> tStore = new TemporaryStore<>(3*WAIT_TIME);
		tStore.put("null", 0);
		sleep(WAIT_TIME);
		tStore.put("eins", 1);
		tStore.put("zwei", 2);
		sleep(WAIT_TIME);
		tStore.put("drei", 3);
		Integer iNull = tStore.remove("null");
		assertEquals(0, iNull.intValue());
		Integer iEins = tStore.remove("eins");
		assertEquals(1, iEins.intValue());
		Integer iZwei = tStore.remove("zwei");
		assertEquals(2, iZwei.intValue());
		Integer iDrei = tStore.remove("drei");
		assertEquals(3, iDrei.intValue());
		iNull = tStore.get("null");
		assertNull(iNull);
		iEins = tStore.get("eins");
		assertNull(iEins);
		iZwei = tStore.get("zwei");
		assertNull(iZwei);
		iDrei = tStore.get("drei");
		assertNull(iDrei);
	}
	


	private void sleep(long millis) {
		try {
			Thread.sleep(millis);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
	}

}
