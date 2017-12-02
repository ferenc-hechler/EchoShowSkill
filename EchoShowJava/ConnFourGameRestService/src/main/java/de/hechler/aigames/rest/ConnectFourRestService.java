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
package de.hechler.aigames.rest;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;

import de.hechler.aigames.ai.AIGame;
import de.hechler.aigames.ai.GameRepository;
import de.hechler.aigames.ai.connectfour.ConnectFourField;
import de.hechler.aigames.ai.connectfour.ConnectFourGame;
import de.hechler.aigames.ai.connectfour.ConnectFourImpl;
import de.hechler.aigames.api.GenericResult;
import de.hechler.aigames.api.GetGameDataResult;
import de.hechler.aigames.api.GetGameParameterResult;
import de.hechler.aigames.api.NewGameResult;
import de.hechler.aigames.api.ResultCodeEnum;
import de.hechler.aigames.api.fieldview.ConnectFourFieldView;
import de.hechler.aigames.api.move.ConnectFourMove;
import de.hechler.aigames.rest.ImageRegistry.ImageEnum;
import de.hechler.aigames.rest.ImageRegistry.SessionEntry;
import de.hechler.utils.RandUtils;

//@WebServlet(urlPatterns = "/main", loadOnStartup = 1) 
public class ConnectFourRestService extends HttpServlet {
	
	/** the svuid */ private static final long serialVersionUID = -3679002890645814953L;

	private final static Logger logger = Logger.getLogger(ConnectFourRestService.class.getName());

	private static final int DEFAULT_AI_LEVEL = 2;

	private static boolean debugloggingEnabled = Boolean.getBoolean("cfrest.debugging");
	
	public static ConnectFourImpl connectFourImpl = new ConnectFourImpl();

	public Gson gson;
	
	@Override
	public void init() throws ServletException {
		super.init();
		gson = new Gson();
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
	        throws ServletException, IOException {
	    doPost(request, response);
	}
	 
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
	        throws ServletException, IOException {
		try {
			String responseString;
			
		    PrintWriter writer = response.getWriter();

		    if (!checkAuth(request)) {
				responseString = unauthResponse(response);
				writer.println(responseString);
				return;
			}
			
			String gameId = normalizeGameId(request.getParameter("gameId"));
			String cmd = request.getParameter("cmd");
			String param1 = request.getParameter("param1");
			String param2 = request.getParameter("param2");
			
			switch(cmd) {
			case "enableDebugLogging": {
				responseString = enableDebugLogging(param1);
				break;
			}
			case "connect": {
				responseString = connect(param1, param2);
				break;
			}
			case "doMove": {
				responseString = doMove(gameId, param1);
				break;
			}
			case "doAIMove": {
				responseString = doAIMove(gameId);
				break;
			}
			case "getGameData": {
				responseString = getGameData(gameId);
				break;
			}
			case "restartGame": {
				responseString = restartGame(gameId);
				break;
			}
			case "closeGame": {
				responseString = closeGame(gameId);
				break;
			}
			case "initTests": {
				responseString = initTests(param1);
				break;
			}
			case "hasChanges": {
				responseString = hasChanges(gameId, param1);
				break;
			}
			case "setPlayerNames": {
				responseString = setPlayerNames(gameId, param1, param2);
				break;
			}
			case "setAILevel": {
				responseString = setAILevel(gameId, param1);
				break;
			}
			case "connectImage": {
				responseString = connectImage(gameId, param1);
				break;
			}

			// CLIENT
			case "clearSession": {
				responseString = clearSession(request.getSession());
				break;
			}
			case "getImage": {
				responseString = getImage(request.getSession(true), param1);
				break;
			}
			
			default: {
				responseString = gson.toJson(GenericResult.genericUnknownCommandResult);
				response.setStatus(500);
				break;
			}
			}

			response.setCharacterEncoding(StandardCharsets.UTF_8.name());
			response.setContentType("application/json");
			
			response.setHeader("Expires", "Sat, 6 May 1995 12:00:00 GMT");
			response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
			response.addHeader("Cache-Control", "post-check=0, pre-check=0");
			response.setHeader("Pragma", "no-cache");
			
		    responseString = encode(responseString); 
	    	writer.println(responseString);
	    	if (debugloggingEnabled) {
	    		if (!(responseString.contains("S_NO_CHANGES") || cmd.equals("getGameId"))) {
	    			logger.info("RQ[cmd="+cmd+",gid="+gameId+",p1="+param1+",p2="+param2+"] -> "+responseString);
	    		}
	    	}
	    }
		catch (RuntimeException | IOException e) {
			logger.log(Level.SEVERE, e.toString(), e);
			throw e;
		}
	}

	
	private String normalizeGameId(String gameId) {
		if (gameId == null) {
			return null;
		}
		return gameId.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]*", "");
	}

	/* ======== */
	/* COMMANDS */
	/* ======== */

	
	private String enableDebugLogging(String value) {
		debugloggingEnabled = Boolean.parseBoolean(value);
		return gson.toJson(GenericResult.genericOkResult);
	}

	
	private String initTests(String initParams) {
		if (initParams.matches("SEED[(]([0-9]+)[)]")) {
			long seed = Long.parseLong(initParams.replaceFirst("SEED[(]([0-9]+)[)]", "$1"));
			System.out.println("setPRNG("+seed+")");
			connectFourImpl.shutdown();
			RandUtils.setPRNG(seed);
			ConnectFourField.testRandom = RandUtils.createPRNG(seed);
			ConnectFourGame.testRandom = RandUtils.createPRNG(seed);
			AIGame.testRandom = RandUtils.createPRNG(seed);
			GameRepository.testRandom = RandUtils.createPRNG(seed);
			String rand9999 = Integer.toString(RandUtils.randomInt(10000));
			return gson.toJson(new GetGameParameterResult(ResultCodeEnum.S_OK, rand9999));
		}
		return gson.toJson(GenericResult.genericInvalidParameterResult);
	}
	
	private String restartGame(String gameId) {
		return gson.toJson(connectFourImpl.restart(gameId)); 
	}

	private String closeGame(String gameId) {
		return gson.toJson(connectFourImpl.closeGame(gameId));
	}

	private String clearSession(HttpSession session) {
		if (session != null) {
			session.invalidate();
		}
		return gson.toJson(GenericResult.genericOkResult);
	}

	private String connectImage(String gameId, String imageName) {
		ImageEnum image;
		try {
			image = ImageEnum.valueOf(imageName.toUpperCase());
		} catch (Exception e) {
			return gson.toJson(GenericResult.genericInvalidParameterResult);
		}
		SessionEntry entry = ImageRegistry.getInstance().getSessionEntry(image);
		if (entry == null) {
			return gson.toJson(new GenericResult(ResultCodeEnum.E_IMAGE_NOT_FOUND));
		}
		entry.gameId = gameId;
		return gson.toJson(GenericResult.genericOkResult);
	}
	
	private String getImage(HttpSession session, String cntStr) {
		int cnt;
		try {
			cnt = Integer.parseInt(cntStr);
		} catch (NumberFormatException | NullPointerException e) {
			return gson.toJson(GenericResult.genericInvalidParameterResult);
		}
		String sessionId = session.getId();
		if (cnt >= 30) {
			ImageRegistry.getInstance().freeSession(sessionId);
			return gson.toJson(GenericResult.genericTimeoutResult);
		}
		Object sessionImageName = session.getAttribute("IMAGE");
		SessionEntry entry = ImageRegistry.getInstance().getSessionEntry(sessionId);
		if (entry.gameId != null) {
			ImageRegistry.getInstance().freeSession(sessionId);
			return gson.toJson(new NewGameResult(ResultCodeEnum.S_ACTIVATED, entry.gameId));
		}
		if (entry.image.name().equals(sessionImageName)) {
			return gson.toJson(GenericResult.genericNoChangeResult);
		}
		return gson.toJson(new GetImageResult(ResultCodeEnum.S_OK, entry.image));
	}

	private String hasChanges(String gameId, String versionName) {
		try { 
			int version = Integer.parseInt(versionName);
			return gson.toJson(connectFourImpl.hasChanges(gameId, version));
		}
		catch (NumberFormatException e) {
			return gson.toJson(GenericResult.genericInvalidParameterResult);
		}
	}

	private String setPlayerNames(String gameId, String player1Name, String player2Name) {
		return gson.toJson(connectFourImpl.setPlayerNames(gameId, player1Name, player2Name));
	}

	private String setAILevel(String gameId, String aiLevelName) {
		try { 
			int aiLevel = Integer.parseInt(aiLevelName);
			return gson.toJson(connectFourImpl.setAILevel(gameId, aiLevel));
		}
		catch (NumberFormatException e) {
			return gson.toJson(GenericResult.genericInvalidParameterResult);
		} 
	}

	private String doMove(String gameId, String slotName) {
		try { 
			int slot = Integer.parseInt(slotName);
			return gson.toJson(connectFourImpl.doMove(gameId, new ConnectFourMove(slot)));
		}
		catch (NumberFormatException e) {
			return gson.toJson(GenericResult.genericInvalidParameterResult);
		}
	}

	private String doAIMove(String gameId) {
		return gson.toJson(connectFourImpl.doAIMove(gameId));
	}

	private String getGameData(String gameId) {
		return gson.toJson(connectFourImpl.getGameData(gameId));
	}

	private String connect(String userId, String aiLevelStr) {
		int aiLevel = DEFAULT_AI_LEVEL;
		if ((aiLevelStr!=null) && aiLevelStr.matches("[1-7]")) {
			aiLevel = Integer.parseInt(aiLevelStr);
		}
		GetGameDataResult<ConnectFourFieldView> getGameDataResult = connectFourImpl.getGameDataByUserId(userId);
		if (getGameDataResult.code != ResultCodeEnum.S_OK) {
			NewGameResult newGameResult = connectFourImpl.createNewGame(userId, aiLevel, true);
			String gameId = newGameResult.gameId;
			getGameDataResult = connectFourImpl.getGameData(gameId);
		}
		else {
			String gameId = getGameDataResult.gameId;
			if (aiLevel != getGameDataResult.aiLevel) {
				connectFourImpl.setAILevel(gameId, aiLevel);
				getGameDataResult.aiLevel = aiLevel;
			}
		}
		return gson.toJson(getGameDataResult);
	}

	
	/* ==== */
	/* AUTH */
	/* ==== */


	private final static String DEFAULT_AUTH = System.getProperty("c4.rest.auth", "rest:geheim");

	private boolean checkAuth(HttpServletRequest request) throws IOException {
		String cmd = request.getParameter("cmd");
		if ("clearSession".equals(cmd) || "getImage".equals(cmd)) {
			// allow client queries without auth
			return true;
		}

		String auth = request.getHeader("Authorization");
		if ((auth == null) || !auth.startsWith("Basic ")) {
			return false;
		}
		String userpass;
		try {
			userpass = new String(java.util.Base64.getDecoder().decode(auth.substring(6)), StandardCharsets.ISO_8859_1);   // ISO-8859-1 is the standard for basic auth.
		}
		catch (Exception e) {
			System.out.println("basic auth decode failed: "+e);
			return false;
		}
		boolean result = userpass.equals(DEFAULT_AUTH);
		return result;
	}

	private String unauthResponse(HttpServletResponse response) {
		response.setStatus(401);
		response.setHeader("WWW-Authenticate", "Basic realm=\"c4-rest-service\"");
		return "";
	}


	/* ======================= */
	/* INTERNAL HELPER METHODS */
	/* ======================= */
	

	private String encode(String text) {
		// TODO: look for encoding in REST Service.
		return text;
	}


}
