/**
 * Diese Datei ist Teil des Alexa Skills Rollenspiel Soloabenteuer.
 * Copyright (C) 2016-2017 Ferenc Hechler (github@fh.anderemails.de)
 *
 * Der Alexa Skills Rollenspiel Soloabenteuer ist Freie Software: 
 * Sie koennen es unter den Bedingungen
 * der GNU General Public License, wie von der Free Software Foundation,
 * Version 3 der Lizenz oder (nach Ihrer Wahl) jeder spaeteren
 * veroeffentlichten Version, weiterverbreiten und/oder modifizieren.
 *
 * Der Alexa Skills Rollenspiel Soloabenteuer wird in der Hoffnung, 
 * dass es nuetzlich sein wird, aber
 * OHNE JEDE GEWAEHRLEISTUNG, bereitgestellt; sogar ohne die implizite
 * Gewaehrleistung der MARKTFAEHIGKEIT oder EIGNUNG FUER EINEN BESTIMMTEN ZWECK.
 * Siehe die GNU General Public License fuer weitere Details.
 * 
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
 */
package de.hechler.aigames.ai;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

//import de.hechler.aigames.UserPersistDAO;
//import de.hechler.aigames.UserPersistDAO.UserInfo;
import de.hechler.utils.RandUtils;

public class GameRepository<G extends AIGameIF> {

	public static Random testRandom;
	
	private static final int TIMEOUT_CHECK_INTERVAL_MS = 5000;
	private static final int TIMEOUT_4H = 4*60*60*1000;

	public static class GameState<G extends AIGameIF> {
		private String gameId;
		private long creationTimestamp;
		private long lastUpdate;
		private int version;
		private String userId;
		private G game;
		private long timeoutMillis;
		public GameState(String gameId, G game, long timeoutMillis) {
			this.gameId = gameId;
			this.game = game;
			this.timeoutMillis = timeoutMillis;
			this.creationTimestamp = System.currentTimeMillis();
			this.lastUpdate = this.creationTimestamp;
			this.version = 0;
		}
		public String getGameId() {
			return gameId;
		}
		public G getGame() {
			return game;
		}
		public long getCreationTimestamp() {
			return creationTimestamp;
		}
		public long getLastUpdate() {
			return lastUpdate;
		}
		public long getTimeoutMillis() {
			return timeoutMillis;
		}
		public int getVersion() {
			return version;
		}
		public void update() { 
			lastUpdate = System.currentTimeMillis(); 
			version += 1; 
		}
		public boolean isExpired(long now) {
			boolean expired = now > lastUpdate + timeoutMillis;
			return expired;
		}
		public void setUserId(String userId) {
			this.userId = userId;
		}
		public String getUserId() {
			return userId;
		}
		@Override public String toString() { return "GS["+getGameId()+"]"; }
	}

	private Class<G> gameClazz;


	private Map<String, GameState<G>> gameId2gameMap = new HashMap<String, GameState<G>>();
	private Map<String, String> userId2gameIdMap = new HashMap<String, String>();
	
	
	public GameRepository(Class<G> gameClazz) {
		this.gameClazz = gameClazz;
	}

	public synchronized GameState<G> getGameStateByGameIdNoFallback(String gameId) {
		checkTimeout();
		return gameId2gameMap.get(gameId);
	}

	public synchronized GameState<G> getGameStateByGameId(String gameId) {
		GameState<G> result = getGameStateByGameIdNoFallback(gameId);
		return result;
	}

	public synchronized void connectUser(String gameId, String userId) {
		if ((userId == null) || userId.isEmpty()) {
			return;
		}
		GameState<G> gameState = getGameStateByGameIdNoFallback(gameId);
		if (gameState == null) {
			return;
		}
		gameState.setUserId(userId);
		userId2gameIdMap.put(userId, gameId);
	}

	public synchronized String getGameIdByUserId(String userId) {
		if ((userId == null) || userId.isEmpty()) {
			return null;
		}
		String gameId = userId2gameIdMap.get(userId);
		return gameId;
	}
	
	public synchronized GameState<G> getGameStateByUserId(String userId) {
		if ((userId == null) || userId.isEmpty()) {
			return null;
		}
		String gameId = userId2gameIdMap.get(userId);
		if (gameId == null) {
			return null;
		}
		GameState<G> gameState = getGameStateByGameId(gameId);
		if (gameState == null) {
			return null;
		}
		if (!userId.equals(gameState.getUserId())) {
			gameState = null;
		}
		if (gameState == null) {
			userId2gameIdMap.remove(userId);
		}
		return gameState;
	}

	public synchronized GameState<G> createNewGame() {
		return createNewGame(TIMEOUT_4H);
	}
	public synchronized GameState<G> createNewGame(long timeoutMillis) {
		String gameId = generateGameId();
		G game;
		try {
			game = gameClazz.newInstance();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
		GameState<G> gameState = new GameState<G>(gameId, game, timeoutMillis);
		gameId2gameMap.put(gameId, gameState);
		return gameState;
	}

	public synchronized void removeGame(String gameId) {
		GameState<G> gameState = gameId2gameMap.get(gameId);
		if (gameState != null) {
			if (gameState.getUserId() != null) {
				userId2gameIdMap.remove(gameState.getUserId());
			}
			gameId2gameMap.remove(gameId);
			gameState.getGame().close();
		}
	}

	public synchronized String generateGameId() {
		while (true) {
			String gameId = RandUtils.randomLetter(testRandom);
			gameId = gameId + Integer.toString(1+RandUtils.randomInt(testRandom, 2*(gameId2gameMap.size()+4)));
			if (!gameId2gameMap.containsKey(gameId)) {
				return gameId;
			}
		}
	}
	
	public synchronized void close() {
		List<GameState<G>> gameStates = new ArrayList<GameState<G>>(gameId2gameMap.values());
		for (GameState<G> gameState:gameStates) {
			removeGame(gameState.gameId);
		}
	}

	private long nextTimeoutCheck = 0;
	
	private void checkTimeout() {
		if (System.currentTimeMillis() < nextTimeoutCheck) {
			return;
		}
		timeoutGameStates();
		nextTimeoutCheck = System.currentTimeMillis() + TIMEOUT_CHECK_INTERVAL_MS;
	}

	private synchronized void timeoutGameStates() {
		long now = System.currentTimeMillis();
		List<GameState<G>> gameStates = new ArrayList<GameState<G>>(gameId2gameMap.values());
		for (GameState<G> gameState:gameStates) {
			if (gameState.isExpired(now)) {
				removeGame(gameState.gameId);
			}
		}
	}


	public void changeGameId(GameState<G> gameState, String newGameId) {
		String oldGameId = gameState.getGameId();
		gameState.gameId = newGameId;
		gameId2gameMap.remove(oldGameId);
		gameId2gameMap.put(newGameId, gameState);
		String userId = gameState.getUserId();
		if (userId != null) {
			userId2gameIdMap.put(userId, newGameId);
		}
	}



}
