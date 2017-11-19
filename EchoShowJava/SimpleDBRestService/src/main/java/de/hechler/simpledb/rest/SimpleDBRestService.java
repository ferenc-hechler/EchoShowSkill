/**
 * Diese Datei ist Teil des Alexa Skills Vier Gewinnt.
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
package de.hechler.simpledb.rest;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import de.hechler.simpledb.UserPersistDAO;
import de.hechler.simpledb.UserPersistDAO.UserInfo;
import de.hechler.simpledb.rest.dto.JSonResult;
import de.hechler.simpledb.rest.dto.JSonResult.CodeEnum;
import de.hechler.simpledb.util.TextUtil;


//@WebServlet(urlPatterns = "/soloadv", loadOnStartup = 1)
public class SimpleDBRestService extends HttpServlet {
	
	/** the svuid */
	private static final long serialVersionUID = 8061743525332962614L;

	private final static Logger logger = Logger.getLogger(SimpleDBRestService.class.getName());

	private static boolean debugloggingEnabled = Boolean.getBoolean("simpledb.debugging");
	
	private UserPersistDAO userPersistentDAO;
	
	public Gson gson;
	
	@Override
	public void init() throws ServletException {
		super.init();
		gson = new Gson();
		userPersistentDAO = new UserPersistDAO();
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
	        throws ServletException, IOException {
	    doPost(request, response);
	}
	 
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
	        throws ServletException, IOException {
		String cmd = null;
		String param1 = null;
		String param2 = null;
		String param3 = null;
		String param4 = null;
		String responseString;
		
		try {
		    response.setCharacterEncoding("UTF-8");
		    response.setContentType("application/json; charset=UTF-8");
		    
			response.setHeader("Expires", "Sat, 6 May 1995 12:00:00 GMT");
			response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
			response.addHeader("Cache-Control", "post-check=0, pre-check=0");
			response.setHeader("Pragma", "no-cache");
	
//			logger.info("encoding : " + response.getCharacterEncoding());
		    PrintWriter writer = response.getWriter();
			
		    if (!checkAuth(request)) {
				responseString = unauthResponse(response);
				writer.println(responseString);
				return;
			}
		    
			cmd = request.getParameter("cmd");
			param1 = request.getParameter("param1");
			param2 = request.getParameter("param2");
			param3 = request.getParameter("param3");
			param4 = request.getParameter("param4");
			
			switch(cmd) {
			case "initTests": {
				responseString = initTests();
				break;
			}
			case "enableDebugLogging": {
				responseString = enableDebugLogging(param1);
				break;
			}
			case "getUserByAppAndName": {
				responseString = getUserByAppAndName(param1, param2);
				break;
			}
			case "getOrCreateUserByAppAndName": {
				responseString = getOrCreateUserByAppAndName(param1, param2);
				break;
			}
			case "updateUserData": {
				responseString = updateUserData(param1, param2);
				break;
			}
			default: {
				responseString = gson.toJson(JSonResult.JR_E_UNKNOWN_COMMAND);
				response.setStatus(500);
				break;
			}
			}


		    responseString = TextUtil.encodeRest(responseString); 
	    	writer.println(responseString);
	    	
	    	if (debugloggingEnabled) {
	    		if (!(responseString.contains("S_NO_CHANGES"))) {
	    			logger.info("RQ[cmd="+cmd+",p1="+param1+",p2="+param2+",p3="+param3+",p4="+param4+"] -> "+responseString);
	    		}
	    	}
	    }
		catch (RuntimeException | IOException e) {
			logger.log(Level.SEVERE, "RQ[cmd="+cmd+",p1="+param1+",p2="+param2+",p3="+param3+",p4="+param4+"] -> "+e.toString(), e);
			throw e;
		}
	}

	/* ======== */
	/* COMMANDS */
	/* ======== */

	
	private String initTests() {
		return gson.toJson(JSonResult.JR_S_OK);
	}

	private String enableDebugLogging(String value) {
		debugloggingEnabled = Boolean.parseBoolean(value);
		return gson.toJson(JSonResult.JR_S_OK);
	}

	
	private String updateUserData(String userIdString, String data) {
		int userId;
		try {
			userId = Integer.parseInt(userIdString);
		} catch (NumberFormatException e) {
			return gson.toJson(JSonResult.JR_E_INVALID_PARAM);
		}
		boolean ok = userPersistentDAO.updateData(userId, data);
		if (!ok) {
			return gson.toJson(JSonResult.JR_E_NOT_FOUND);
		}
		return gson.toJson(JSonResult.JR_S_OK);
	}

	private String getOrCreateUserByAppAndName(String app, String userName) {
		String result;
		UserInfo userInfo = userPersistentDAO.getUserInfo(app, userName);
		if (userInfo == null) {
			userInfo = new UserInfo(app, userName, null); 
			boolean ok = userPersistentDAO.save(userInfo);
			if (!ok) {
				return gson.toJson(JSonResult.JR_E_DB_ERROR);
			}
			result = gson.toJson(new JSonResult(CodeEnum.S_CREATED, userInfo));
		}
		else {
			result = gson.toJson(new JSonResult(CodeEnum.S_OK, userInfo));
		}
		return result;
	}

	private String getUserByAppAndName(String app, String userName) {
		UserInfo userInfo = userPersistentDAO.getUserInfo(app, userName);
		if (userInfo == null) {
			return gson.toJson(JSonResult.JR_E_NOT_FOUND);
		}
		String result = gson.toJson(new JSonResult(CodeEnum.S_OK, userInfo));
		return result;
	}


	/* ==== */
	/* AUTH */
	/* ==== */
	
	private boolean checkAuth(HttpServletRequest request) throws IOException {
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
		boolean result = userpass.equals("rest:geheim");
		return result;
	}

	private String unauthResponse(HttpServletResponse response) {
		response.setStatus(401);
		response.setHeader("WWW-Authenticate", "Basic realm=\"solo-rest-service\"");
		return "";
	}

	

}
