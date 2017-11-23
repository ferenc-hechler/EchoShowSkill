/**
 * Diese Datei ist Teil des Alexa Skills Vier-Gewinnt. Copyright (C) 2016-2017
 * Ferenc Hechler (github@fh.anderemails.de)
 * 
 * Der Alexa Skill Vier-Gewinnt ist Freie Software: Sie koennen es unter den
 * Bedingungen der GNU General Public License, wie von der Free Software
 * Foundation, Version 3 der Lizenz oder (nach Ihrer Wahl) jeder spaeteren
 * veroeffentlichten Version, weiterverbreiten und/oder modifizieren.
 * 
 * Der Alexa Skills Vier-Gewinnt wird in der Hoffnung, dass es nuetzlich sein
 * wird, aber OHNE JEDE GEWAEHRLEISTUNG, bereitgestellt; sogar ohne die
 * implizite Gewaehrleistung der MARKTFAEHIGKEIT oder EIGNUNG FUER EINEN
 * BESTIMMTEN ZWECK. Siehe die GNU General Public License fuer weitere Details.
 * 
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
 */

/* App ID for the skill */
var APP_ID = "amzn1.ask.skill.46c8454a-d474-4e38-a75e-c6c8017b1fe1"; // replace
																		// with
																		// "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

var endpoint = process.env.ENDPOINT; // 'http://calcbox.de/connfour/rest/c4';
var dbEndpoint = process.env.DBENDPOINT; // 'http://calcbox.de/simdb/rest/db';

var URL = require('url');
var authUsername = process.env.AUTH_USERNAME; // 'rest';
var authPassword = process.env.AUTH_PASSWORD; // 'geheim';

var AlexaSkill = require('./AlexaSkill');

var speech = require('./Speech');
speech.init_messages("DE");

var http = require('http');
var querystring = require("querystring");

var imgBaseUrl = "https://calcbox.de/c4imgs/64px/";
var imgBaseSize = 64;

/**
 * ConnectFourSkill is a child of AlexaSkill.
 */
var ConnectFourSkill = function() {
	AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
ConnectFourSkill.prototype = Object.create(AlexaSkill.prototype);
ConnectFourSkill.prototype.constructor = ConnectFourSkill;

ConnectFourSkill.prototype.eventHandlers.onSessionStarted = function(
		sessionStartedRequest, session) {
	console.log("ConnectFourSkill onSessionStarted requestId: "
			+ sessionStartedRequest.requestId + ", sessionId: "
			+ session.sessionId);
	// any initialization logic goes here
	clearSessionData(session);
};

ConnectFourSkill.prototype.eventHandlers.onSessionEnded = function(
		sessionEndedRequest, session) {
	console.log("ConnectFourSkill onSessionEnded requestId: "
			+ sessionEndedRequest.requestId + ", sessionId: "
			+ session.sessionId);
	// any cleanup logic goes here
	clearSessionData(session);
};

ConnectFourSkill.prototype.eventHandlers.onLaunch = function(launchRequest,
		session, response) {
	doLaunch(session, response);
};

ConnectFourSkill.prototype.intentHandlers = {

	"NewGameIntent" : function(intent, session, response) {
		doNewGame(intent, session, response);
	},

	"PlayerMoveIntent" : function(intent, session, response) {
		doPlayerMove(intent, session, response);
	},

	"ChangeAILevelIntent" : doChangeAILevel,
	"ActivateInstantAnswerIntent" : doActivateInstantAnswer,
	"DeactivateInstantAnswerIntent" : doDeactivateInstantAnswer,

	"AMAZON.HelpIntent" : doHelpIntent,

	"AMAZON.StartOverIntent" : doStartOverIntent,
	"AMAZON.YesIntent" : doYesIntent,
	"AMAZON.NoIntent" : doNoIntent,
	"AMAZON.PreviousIntent" : doPreviousIntent,
	"AMAZON.NextIntent" : doNextIntent,
	"AMAZON.ScrollUpIntent" : doScrollUpIntent,
	"AMAZON.ScrollLeftIntent" : doScrollLeftIntent,
	"AMAZON.ScrollDownIntent" : doScrollDownIntent,
	"AMAZON.ScrollRightIntent" : doScrollRightIntent,
	"AMAZON.PageUpIntent" : doPageUpIntent,
	"AMAZON.PageDownIntent" : doPageDownIntent,
	"AMAZON.MoreIntent" : doMoreIntent,
	"AMAZON.NavigateSettingsIntent" : doNavigateSettingsIntent,

	"AMAZON.StopIntent" : function(intent, session, response) {
		clearSessionData(session);
		speech.goodbye(intent.name, "*", response);
	}

};

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
	// Create an instance of the ConnectFourSkill skill.
	var connectFourSkill = new ConnectFourSkill();
	connectFourSkill.execute(event, context);
};

// initialize tests
exports.initTests = function(url, param, callback) {
	endpoint = url;
	sendCommand([], "?", "initTests", param, "", function callbackFunc(result) {
		console.log(result);
		callback();
	});
}

/* ============== */
/* ENTRY METHODEN */
/* ============== */

function doLaunch(session, response) {
	initUserAndConnect(session, response, function successFunc() {
		execDisplayField(session, response);
	});
}

function doNewGame(intent, session, response) {
	// TODO: confirm with yes / no
	initUserAndConnect(session, response, function successFunc() {
		execDoNewGame(intent, session, response);
	});
}

function doPlayerMove(intent, session, response) {
	initUserAndConnect(session, response, function successFunc() {
		execDoMove(intent, session, response);
	});
}

function doChangeAILevel(intent, session, response) {
	initUserAndConnect(session, response, function successFunc() {
		execChangeAILevel(intent, session, response);
	});
}

function doActivateInstantAnswer(intent, session, response) {
	initUser(session, response, function successFunc() {
		setUserProperty("instantAnswer", true);
		doLaunch(session, response);
	});
}

function doDeactivateInstantAnswer(intent, session, response) {
	initUser(session, response, function successFunc() {
		setUserProperty("instantAnswer", true);
		doLaunch(session, response);
	});
}

function doHelpIntent(intent, session, response) {
	initUser(session, response, function successFunc() {
		var helpCalls = getUserProperty("helpCalls", 1);
		setUserProperty("helpCalls", 1 + helpCalls);
		msg = speech.createMsg("INTERN", "HELP", response);
		execDisplayField(session, response, msg)
	});
}

function doStartOverIntent(intent, session, response) {
	doNewGame(session, response);
}

function doYesIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doYesIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doNoIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doPreviousIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doNextIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doScrollUpIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doScrollLeftIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doScrollDownIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doScrollRightIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doPageUpIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doPageDownIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doMoreIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doNavigateSettingsIntent(intent, session, response) {
	changeSettings(intent, session, response);
}

/* ============= */
/* SEND METHODEN */
/* ============= */

function initUserAndConnect(session, response, successCallback) {
	initUser(session, response, function successFunc1() {
		connect(session, response, function successFunc2() {
			successCallback();
		});
	});
}

function connect(session, response, successCallback) {
	if (isConnectedToGame(session)) {
		successCallback();
	} else {
		var amzUserId = getAmzUserIdFromSession(session);
		send(session, response, "", "connect", amzUserId, "",
				function callbackFunc(result) {
					console.log("Connectet with GameId: " + result.gameId);
					setSessionGameId(session, result.gameId);
					successCallback();
				});
	}
}

function execDoNewGame(intent, session, response) {
	var gameId = getSessionGameId(session);
	sendCommand(session, gameId, "closeGame", "", "", function callbackFunc(
			result) {
		clearSessionData(session);
		doLaunch(session, response);
	});
}

function execDoMove(intent, session, response) {
	send(session, response, getSessionGameId(session), "doMove",
			getSlot(intent), "", function successFunc(result) {
				if (result.code === "S_OK") {
					execDoAIMove(session, response);
				} else {
					execDisplayField(session, response);
				}
			});
}

function execDoAIMove(session, response) {
	send(session, response, getSessionGameId(session), "doAIMove", "", "",
			function successFunc(result) {
				setSessionLastAIMove(session, result.move.slot);
				execDisplayField(session, response);
			});
}

function execDisplayField(session, response, msg) {
	var gameId = getSessionGameId(session);
	send(session, response, gameId, "getGameData", "", "",
			function callbackFunc(result) {
				respondField(session, response, result, msg);
			});
}

function execChangeAILevel(intent, session, response) {
	var aiLevel = getAILevel(intent);
	send(session, response, getSessionGameId(session), "setAILevel", aiLevel,
			"", function successFunc(result) {
				execDisplayField(session, response);
			});
}

function didNotUnterstand(intent, session, response) {
	msg = speech.createMsg("INTERN", "DID_NOT_UNDERSTAND", response);
	execDisplayField(session, response, msg)
}

function changeSettings(intent, session, response) {
	msg = speech.createMsg("INTERN", "CHANGE_SETTINGS", response);
	execDisplayField(session, response, msg)
}

/* ============= */
/* FIELD DISPLAY */
/* ============= */

function respondField(session, response, gameData, msg) {
	var lastAIMove = getSessionLastAIMove(session);
	removeSessionLastAIMove(session);
	if (!msg) {
		msg = createStatusMsg(gameData.winner, lastAIMove);
	}
	var statusMsg = createStatusMsg(gameData.winner, lastAIMove);
	var hintMsg = createHintMsg(gameData.winner);
	var fieldText = createFieldText(gameData.fieldView.field);
	// console.log("fieldText="+fieldText);
	var directives = [ {
		"type" : "Display.RenderTemplate",
		"template" : {
			"type" : "BodyTemplate1",
			"title" : msg.display,
			"textContent" : {
				"primaryText" : {
					"type" : "RichText",
					"text" : "<font size = '2'>" // statusMsg.display+"<br/>"
							+ fieldText + "</font>"
				}
			},
			"backButton" : "HIDDEN",
			"hint" : {
				"type" : "PlainText",
				"text" : hintMsg.display
			}
		}
	} ];
	if (gameData.winner != 0) {
		outputMsgWithDirectives(session, response, msg, directives);
	} else {
		var instantAnswer = getSessionInstantAnswer(session);
		if (instantAnswer) {
			respondMsgWithDirectives(session, response, msg, directives,
					instantAnswer);
		} else {
			outputMsgWithDirectives(session, response, msg, directives);
		}
	}
}

function outputMsgWithDirectives(session, response, msg, directives) {
	saveUserData(session, response, function successCallback() {
		speech.outputMsgWithDirectives(response, msg, directives)
	});
}

function respondMsgWithDirectives(session, response, msg, directives,
		instantAnswer) {
	saveUserData(session, response, function successCallback() {
		speech.respondMsgWithDirectives(response, msg, directives,
				instantAnswer);
	});
}

function createStatusMsg(winner, lastAIMove) {
	var msg;
	var status = !lastAIMove ? "STATUS" : "STATUS_AIMOVE";
	if (winner == 1) {
		msg = speech.createMsg(status, "PLAYER_WINS", lastAIMove);
	} else if (winner == 2) {
		msg = speech.createMsg(status, "AI_PLAYER_WINS", lastAIMove);
	} else if (winner == -1) {
		msg = speech.createMsg(status, "DRAW", lastAIMove);
	} else {
		msg = speech.createMsg(status, "MAKE_YOUR_MOVE", lastAIMove);
	}
	return msg;
}

function createHintMsg(winner) {
	var msg;
	if (winner == 1) {
		msg = speech.createMsg("HINT", "PLAYER_WINS");
	} else if (winner == 2) {
		msg = speech.createMsg("HINT", "AI_PLAYER_WINS");
	} else if (winner == -1) {
		msg = speech.createMsg("HINT", "DRAW");
	} else {
		msg = speech.createMsg("HINT", "MAKE_YOUR_MOVE");
	}
	return msg;
}

function createFieldText(field) {
	var result = "";
	result = result + addImage("space_3", 3);
	result = result + addImage("frameset_top", 7);
	for (var y = 0; y < 6; y++) {
		result = result + "<br/>";
		result = result + addImage("space_3", 3);
		for (var x = 0; x < 7; x++) {
			var col = field[y][x]; // col = 0..4
			result = result + addImage("circle-" + col, 1);
		}
	}
	return result;
}

function addImage(imgName, size) {
	var result = "<img src='" + imgBaseUrl + imgName + ".png' width='"
			+ (size * imgBaseSize) + "' height='" + imgBaseSize + "'/>";
	return result;
}

/* ============= */
/* INTENT-ACCESS */
/* ============= */

function getSlot(intent) {
	return getFromIntent(intent, "slot", "?");
}

function getAILevel(intent) {
	return getFromIntent(intent, "aiLevel", "?");
}

function getFromIntent(intent, attribute_name, defaultValue) {
	var result = intent.slots[attribute_name];
	if (!result || !result.value) {
		return defaultValue;
	}
	return result.value;
}

/* ======================== */
/* SESSION VARIABLES ACCESS */
/* ======================== */

function clearSessionData(session) {
	session.attributes = {};
}

function setSessionGameId(session, gameId) {
	if (!session || (!session.attributes)) {
		return;
	}
	session.attributes.gameId = gameId;
}
function getSessionGameId(session) {
	if (!session || (!session.attributes)) {
		return undefined;
	}
	return session.attributes.gameId;
}

function setSessionLastAIMove(session, lastAIMove) {
	if (!session || (!session.attributes)) {
		return;
	}
	session.attributes.lastAIMove = lastAIMove;
}

function getSessionLastAIMove(session) {
	if (!session || (!session.attributes)) {
		return undefined;
	}
	return session.attributes.lastAIMove;
}

function removeSessionLastAIMove(session) {
	if (!session || (!session.attributes)) {
		return;
	}
	delete session.attributes.lastAIMove;
}

function setSessionInstantAnswer(session, flag) {
	if (!session || (!session.attributes)) {
		return;
	}
	session.attributes.instantAnswer = flag;
}
function getSessionInstantAnswer(session) {
	if (!session || (!session.attributes)
			|| (!session.attributes.instantAnswer)) {
		return true;
	}
	return session.attributes.instantAnswer;
}

function isConnectedToGame(session) {
	var gameId = getSessionGameId(session);
	if (!gameId) {
		return false;
	}
	return true;
}

function getAmzUserIdFromSession(session) {
	if (!session || (!session.user)) {
		return undefined;
	}
	return session.user.userId;
}

/* ======= */
/* USER DB */
/* ======= */

function initUser(session, response, successCallback) {
	if (hasDBUserInSession(session)) {
		successCallback();
	} else {
		var amzUserId = getAmzUserIdFromSession(session);
		if (!amzUserId) {
			speech.respond("INTERN", "NO_AMZ_USERID", response);
		} else {
			sendDB(session, response, "getOrCreateUserByAppAndName", "C4.USER", amzUserId, function callback(result) {
						var dbUser = result.user;
						logObject("dbUser", dbUser);
						var userDataOk = unmarshallUserData(dbUser);
						if (!userDataOk) {
							speech.respond("INTERN", "INVALID_USERDATA",
									response);
						} else {
							logObject("dbUser-unmarsh", dbUser);
							setDBUserInSession(session, dbUser);
							successCallback();
						}
					});
		}
	}
}

/* save / load */

function saveUserData(session, response, callbackSuccess) {
	if (!hasUserDataChanged(session)) {
		callbackSuccess();
	} else {
		clearUserDataChanged(session);
		updateUserDataInDB(session, response, function callback() {
			callbackSuccess();
		});

	}
}

function unmarshallUserData(dbUser) {
	if (!dbUser) {
		return false;
	}
	if (!dbUser.data) {
		dbUser.data = {};
		return true;
	}
	try {
		var unmarshalledData = JSON.parse(dbUser.data);
		dbUser.data = unmarshalledData;
		return true;
	} catch (e) {
		return false;
	}
}

function updateUserDataInDB(session, response, callbackSuccess) {
	var userId = getDBUserIdFromSession(session);
	var marshalledUserData = getMarshalledUserData(session);
	sendDB(session, response, "updateUserData", userId, marshalledUserData, function callback(result) {
		callbackSuccess();
	});
}

function getMarshalledUserData(session) {
	var data = getUserDataFromSession(session);
	if (!data) {
		return undefined;
	}
	var result = JSON.stringify(data);
	return result;
}

/* user properties */

function setUserProperty(session, key, value) {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return;
	}
	userData[key] = value;
	userData.changed = true;
}
function getUserProperty(session, key, defaultValue) {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return defaultValue;
	}
	var result = userData[key];
	if (!result) {
		result = defaultValue;
	}
	return;
}

/* user data changed flag */

function setUserDataChanged(session) {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return;
	}
	userData.changed = true;
}

function hasUserDataChanged(session) {
	var userData = getUserDataFromSession(session);
	if (!userData || (!userData.changed)) {
		return false;
	}
	return true;
}

function clearUserDataChanged(session) {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return;
	}
	delete userData.changed;
}

/* user data */

function getDBUserIdFromSession(session) {
	var dbUser = getDBUserFromSession(session);
	if (!dbUser) {
		return undefined;
	}
	return dbUser.userId;
}

function getUserDataFromSession(session) {
	var dbUser = getDBUserFromSession(session);
	if (!dbUser) {
		return undefined;
	}
	return dbUser.data;
}

/* dbUser */

function hasDBUserInSession(session) {
	if (!getDBUserFromSession(session)) {
		return false;
	}
	return true;
}
function getDBUserFromSession(session) {
	if (!session || (!session.attributes)) {
		return undefined;
	}
	return session.attributes.dbUser;
}
function setDBUserInSession(session, dbUser) {
	if (!session || (!session.attributes)) {
		return;
	}
	session.attributes.dbUser = dbUser;
}

/* ========= */
/* REST CALL */
/* ========= */

function send(session, response, gameId, cmd, param1, param2, successCallback) {
	sendCommand(session, gameId, cmd, param1, param2, function callbackFunc(
			result) {
		var code = ((!result) || (!result.code)) ? "?" : result.code;
		if (code.startsWith("S_")) {
			successCallback(result);
		} else {
			speech.respond("SEND_" + cmd, code, response);
		}
	});
}

function sendCommand(session, gameId, cmd, param1, param2, callback) {

	var result = "";

	var query = querystring.stringify({
		"gameId" : gameId,
		"cmd" : cmd,
		"param1" : param1,
		"param2" : param2
	});
	var url = endpoint + "?" + query;
	console.log('CALL: ' + url);

	var urlObj = URL.parse(url);
	var options = {
		protocol : urlObj.protocol,
		host : urlObj.hostname,
		port : urlObj.port,
		path : urlObj.path,
		auth : authUsername + ':' + authPassword
	};

	http.get(options, function(res) {
		var responseString = '';
		if (res.statusCode != 200) {
			console.log("ERROR HTTP STATUS " + res.statusCode);
			result = {
				code : "E_CONNECT",
				errmsg : "h.t.t.p. Status " + res.statusCode
			};
			callback(result);
		}
		res.on('data', function(data) {
			responseString += data;
		});
		res.on('end', function() {
			console.log("get-end: " + responseString);
			var responseObject;
			try {
				responseObject = JSON.parse(responseString);
			} catch (e) {
				console.log("E_CONNECT INVALID JSON-FORMAT: " + e.message);
				responseObject = {
					code : "E_CONNECT",
					errmsg : "Die Serverantwort ist nicht valide."
				};
			}
			callback(responseObject);

		});
	}).on('error', function(e) {
		console.log("E_CONNECT: " + e.message);
		result = {
			code : "E_CONNECT",
			errmsg : e.message
		};
		callback(result);
	});
}

function sendDB(session, response, cmd, param1, param2, successCallback) {
	sendDBCommand(session, cmd, param1, param2, function callbackFunc(result) {
		var code = ((!result) || (!result.code)) ? "?" : result.code;
		if (code.startsWith("S_")) {
			successCallback(result);
		} else {
			speech.respond("SENDDB_" + cmd, code, response);
		}
	});
}

function sendDBCommand(session, cmd, param1, param2, callback) {

	var result = "";

	var query = querystring.stringify({
		"cmd" : cmd,
		"param1" : param1,
		"param2" : param2
	});
	var url = dbEndpoint + "?" + query;
	console.log('CALL: ' + url);

	var urlObj = URL.parse(url);
	var options = {
		protocol : urlObj.protocol,
		host : urlObj.hostname,
		port : urlObj.port,
		path : urlObj.path,
		auth : authUsername + ':' + authPassword
	};

	http.get(options, function(res) {
		var responseString = '';
		if (res.statusCode != 200) {
			console.log("ERROR HTTP STATUS " + res.statusCode);
			result = {
				code : "E_CONNECT",
				errmsg : "h.t.t.p. Status " + res.statusCode
			};
			callback(result);
		}
		res.on('data', function(data) {
			responseString += data;
		});
		res.on('end', function() {
			console.log("get-end: " + responseString);
			var responseObject;
			try {
				responseObject = JSON.parse(responseString);
			} catch (e) {
				console.log("E_CONNECT INVALID JSON-FORMAT: " + e.message);
				responseObject = {
					code : "E_CONNECT",
					errmsg : "Die Serverantwort ist nicht valide."
				};
			}
			callback(responseObject);

		});
	}).on('error', function(e) {
		console.log("E_CONNECT: " + e.message);
		result = {
			code : "E_CONNECT",
			errmsg : e.message
		};
		callback(result);
	});
}

function logObject(prefix, object) {
	console.log(prefix + ": " + JSON.stringify(object));
}
