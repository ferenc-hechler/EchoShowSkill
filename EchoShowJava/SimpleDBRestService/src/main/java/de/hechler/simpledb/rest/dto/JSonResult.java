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
package de.hechler.simpledb.rest.dto;

import de.hechler.simpledb.UserPersistDAO.UserInfo;

public class JSonResult {

	public enum CodeEnum {
		S_OK,
		S_CREATED,
		S_NO_CHNGES,
		E_NOT_FOUND,
		E_UNKNOWN_COMMAND,
		E_INVALID_PARAM,
		E_DB_ERROR
	}		

	public final static JSonResult JR_S_OK = new JSonResult(CodeEnum.S_OK);
	public final static JSonResult JR_S_NO_CHNGES = new JSonResult(CodeEnum.S_NO_CHNGES);
	public final static JSonResult JR_E_NOT_FOUND = new JSonResult(CodeEnum.E_NOT_FOUND);
	public final static JSonResult JR_E_DB_ERROR = new JSonResult(CodeEnum.E_DB_ERROR);
	public final static JSonResult JR_E_INVALID_PARAM = new JSonResult(CodeEnum.E_INVALID_PARAM);
	public final static JSonResult JR_E_UNKNOWN_COMMAND = new JSonResult(CodeEnum.E_UNKNOWN_COMMAND);

	public CodeEnum code;
	public UserInfo user;
	
	public JSonResult(CodeEnum code) {
		this(code, null);
	}
	public JSonResult(CodeEnum code, UserInfo user) {
		this.code = code;
		this.user = user;
	}

	public CodeEnum getCode() {
		return code;
	}
	
	public UserInfo getUser() {
		return user;
	}
	
}