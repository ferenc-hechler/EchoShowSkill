/**
 * Diese Datei ist Teil des Alexa Skills 'Vier in einer Reihe'.
 * Copyright (C) 2016-2017 Ferenc Hechler (github@fh.anderemails.de)
 *
 * Der Alexa Skills 'Vier in einer Reihe' ist Freie Software: 
 * Sie koennen es unter den Bedingungen
 * der GNU General Public License, wie von der Free Software Foundation,
 * Version 3 der Lizenz oder (nach Ihrer Wahl) jeder spaeteren
 * veroeffentlichten Version, weiterverbreiten und/oder modifizieren.
 *
 * Der Alexa Skills 'Vier in einer Reihe' wird in der Hoffnung, 
 * dass es nuetzlich sein wird, aber
 * OHNE JEDE GEWAEHRLEISTUNG, bereitgestellt; sogar ohne die implizite
 * Gewaehrleistung der MARKTFAEHIGKEIT oder EIGNUNG FUER EINEN BESTIMMTEN ZWECK.
 * Siehe die GNU General Public License fuer weitere Details.
 * 
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
 */
package de.hechler.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TemporaryStore<K, V> {
	
	private static class TimeoutObject<O> implements Comparable<Object> {
		long timeout;
		O obj;
		public TimeoutObject(long timeout, O obj) {
			this.timeout = timeout;
			this.obj = obj;
		}
		public long getTimeout() {
			return timeout;
		}
		public O getObj() {
			return obj;
		}
		@Override
		public int compareTo(Object other) {
			if (other instanceof Long) {
				return Long.compare(timeout, ((Long) other).longValue());
			}
			if (other instanceof TimeoutObject<?>) {
				return Long.compare(timeout, ((TimeoutObject<?>) other).timeout);
			}
			return 0;
		}
		@Override
		public String toString() {
			long diff = System.currentTimeMillis() - timeout;
			return "T["+diff+"|"+obj+"]";
		}
	}
	
	private List<TimeoutObject<K>> keysWithTimeout;
	private Map<K, TimeoutObject<V>> store;
	private long defaultAliveTime;
	
	public TemporaryStore(long defaultAliveTime) {
		this.defaultAliveTime = defaultAliveTime;
		keysWithTimeout = new ArrayList<>();
		store = new HashMap<>();
	}
	
	public synchronized V put(K key, V value) {
		return put(key, value, defaultAliveTime);
	}
	
	public synchronized V put(K key, V value, long aliveTime) {
		timeout();
		V result = remove(key);
		long timeout = System.currentTimeMillis()+aliveTime;
		TimeoutObject<K> tKey = new TimeoutObject<K>(timeout, key);
		int pos = Collections.binarySearch(keysWithTimeout, timeout);
		if (pos < 0) {
			pos = -pos-1;
		}
		keysWithTimeout.add(pos, tKey);
		store.put(key, new TimeoutObject<V>(timeout, value));
		return result;
	}
	
	public synchronized V remove(K key) {
		timeout();
		TimeoutObject<V> tValue = store.remove(key);
		if (tValue == null) {
			return null;
		}
		V result = tValue.getObj();
		long timeout = tValue.getTimeout();
		int pos = Collections.binarySearch(keysWithTimeout, timeout);
		if (pos >= 0) {
			if (keysWithTimeout.get(pos).getObj().equals(key)) {
				keysWithTimeout.remove(pos);
				return result;
			}
			int fPos = pos+1;
			while ((fPos < keysWithTimeout.size()) && (keysWithTimeout.get(fPos).getTimeout() == timeout)) {
				if (keysWithTimeout.get(fPos).getObj().equals(key)) {
					keysWithTimeout.remove(fPos);
					return result;
				}
				fPos += 1;
			}
			int bPos = pos-1;
			while ((bPos >= 0) && (keysWithTimeout.get(bPos).getTimeout() == timeout)) {
				if (keysWithTimeout.get(bPos).getObj().equals(key)) {
					keysWithTimeout.remove(bPos);
					return result;
				}
				bPos -= 1;
			}
		}
		throw new RuntimeException("TemporaryStore inconsistent!");
	}

	public synchronized V get(K key) {
		timeout();
		TimeoutObject<V> timeoutResult = store.get(key);
		if (timeoutResult == null) {
			return null;
		}
		return timeoutResult.getObj();
	}

	private void timeout() {
		long now = System.currentTimeMillis();
		while ((!keysWithTimeout.isEmpty()) && keysWithTimeout.get(0).getTimeout() < now) {
			TimeoutObject<K> tKey = keysWithTimeout.remove(0);
			store.remove(tKey.getObj());
		}
	}

	public synchronized boolean containsKey(String key) {
		timeout();
		return store.containsKey(key);
	}
	
}
