/**
 * Diese Datei ist Teil des Alexa Skills 'Vier in einer Reihe'. Copyright (C) 2016-2017
 * Ferenc Hechler (github@fh.anderemails.de)
 * 
 * Der Alexa Skill 'Vier in einer Reihe' ist Freie Software: Sie koennen es unter den
 * Bedingungen der GNU General Public License, wie von der Free Software
 * Foundation, Version 3 der Lizenz oder (nach Ihrer Wahl) jeder spaeteren
 * veroeffentlichten Version, weiterverbreiten und/oder modifizieren.
 * 
 * Der Alexa Skills 'Vier in einer Reihe' wird in der Hoffnung, dass es nuetzlich sein
 * wird, aber OHNE JEDE GEWAEHRLEISTUNG, bereitgestellt; sogar ohne die
 * implizite Gewaehrleistung der MARKTFAEHIGKEIT oder EIGNUNG FUER EINEN
 * BESTIMMTEN ZWECK. Siehe die GNU General Public License fuer weitere Details.
 * 
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
 */

/* App ID for the skill */
var APP_ID = process.env.APP_ID; // "amzn1.ask.skill.46c8454a-d474-4e38-a75e-c6c8017b1fe1"; 

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
var leftTopSpacer = "spacer_162x64";
var leftTopSpacerWidth = 162;


var TOKEN_TO_YESNOQUERY_MAPPING = {
		"TOK_HELP" : "HELP_REGELN",
		"TOK_INTRO": "HELP_REGELN",
		"TOK_WELCOME": "HELP_REGELN",
		"TOK_HELP_REGELN": "HELP_REGELN",
		"TOK_HELP_REGELN_NOGUI": "HELP_REGELN",

		"ACT_ActionHELP": "ActionHOME",
		"ACT_ActionHELP_REGELN": "ActionHOME",
		"ACT_ActionHELP_SPRACHSTEUERUNG": "ActionHOME",
		"ACT_ActionHELP_KOMMANDOS": "ActionHOME",
		"ACT_ActionHELP_WEITERES": "ActionHOME",

		"TOK_MAIN": undefined
}

var NEXT_MSG_KEY_FOR_YES = {
		"HELP": "HELP_REGELN",
		"INTRO": "HELP_REGELN",
		"WELCOME": "HELP_REGELN",
		"HELP_REGELN": "HELP_REGELN",
		"HELP_REGELN_NOGUI": "HELP_REGELN"
	}

var ANIMAL_MAPPING = {
		  "Affen":			"AFFE",
		  "Bär":			"BAER",
		  "Bären":			"BAER",
		  "Eichhörnchen":	"EICHHOERNCHEN",
		  "Elefanten":		"ELEFANT",
		  "Fish": 			"FISCH",
		  "Hasen": 			"HASE",
		  "Löwe": 			"LOEWE",
		  "Löwen": 			"LOEWE",
		  "Marienkäfer": 	"MARIENKAEFER",
		  "Möwe": 			"MOEWE",
		  "Schildkröte": 	"SCHILDKROETE",
}


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

ConnectFourSkill.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
	doLaunch(session, response);
};

ConnectFourSkill.prototype.intentHandlers = {

	"NewGameIntent" : function(intent, session, response) {
		doNewGame(intent, session, response);
	},

	"PlayerMoveIntent" : function(intent, session, response) {
		doPlayerMove(intent, session, response);
	},
    
	"AIStartsIntent" : function(intent, session, response) {
		doAIStarts(intent, session, response);
	},

	"ChangeAILevelIntent" : doChangeAILevel,
	
	"AnimalConnectIntent" : doAnimalConnect, 
		
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


ConnectFourSkill.prototype.actionHandlers = {
	"ActionHELP" : doShowAction,
	"ActionHELP_REGELN" : doShowAction,
	"ActionHELP_SPRACHSTEUERUNG" : doShowAction,
	"ActionHELP_KOMMANDOS" : doShowAction,
	"ActionHELP_WEITERES" : doShowAction,
	"ActionHOME" : doActionHOME
};


// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
	logObject("EVENT", event);
	// Create an instance of the ConnectFourSkill skill.
	var connectFourSkill = new ConnectFourSkill();
	removeSessionRequest(event.session);
	setRequestHasDisplay(event.session, hasEventDisplay(event));
	setRequestDisplayToken(event.session, getEventDisplayToken(event));
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
		if (!getUserHadIntro(session)) {
			execIntro(session, response);
		}
		else {
			if (getSessionGameMovesCount(session) === 0) {
				execWelcome(session, response);
			}
			else {
				msg = speech.createMsg("INTERN", "GAME_CONTINUED");
				execDisplayField(session, response, msg)
			}
		}
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

function doAIStarts(intent, session, response) {
	initUserAndConnect(session, response, function successFunc() {
		if (getSessionGameMovesCount(session) === 0) {
			execDoAIMove(session, response);
		}
		else {
			msg = speech.createMsg("INTERN", "AI_STARTS_NOT_ALLOWED");
			execDisplayField(session, response, msg)
		}
	});
}

function doChangeAILevel(intent, session, response) {
	initUserAndConnect(session, response, function successFunc() {
		execChangeAILevel(intent, session, response);
	});
}

function doAnimalConnect(intent, session, response) {
	initUserAndConnect(session, response, function successFunc() {
		execAnimalConnect(intent, session, response);
	});
}

function doActivateInstantAnswer(intent, session, response) {
	initUserAndConnect(session, response, function successFunc() {
		setUserInstantAnswer(session, true);
		execDisplayField(session, response);
	});
}

function doDeactivateInstantAnswer(intent, session, response) {
	initUserAndConnect(session, response, function successFunc() {
		setUserInstantAnswer(session, false);
		execDisplayField(session, response);
	});
}

function doHelpIntent(intent, session, response) {
	initUserAndConnect(session, response, function successFunc() {
		askYesNoText(session, response, "HELP");
	});
}

function doShowAction(actionName, session, response) {
	handleYesNoQuery(session);
	initUserAndConnect(session, response, function successFunc() {
		showAction(session, response, actionName);
	});
}

function doActionHOME(actionName, session, response) {
	handleYesNoQuery(session);
	execDisplayField(session, response);
}

function doStartOverIntent(intent, session, response) {
	doNewGame(session, response);
}

function doYesIntent(intent, session, response) {
	var yesNoQuery = handleYesNoQuery(session);
	initUserAndConnect(session, response, function successFunc() {
		if (yesNoQuery === undefined) {
			noQuestionAsked(session, response);
		}
		else if (yesNoQuery === "ActionHOME") {
			execDisplayField(session, response);
		}
		else {
			var MSG_KEY = NEXT_MSG_KEY_FOR_YES[yesNoQuery]; 
			MSG_KEY = mapNoGUIMsg(session, MSG_KEY);
			askYesNoText(session, response, MSG_KEY);
		}
	});
}

function mapNoGUIMsg(session, msgKey) {
	if (getRequestHasDisplay(session)) {
		return msgKey;
	}
	if (msgKey === "HELP_REGELN") {
		return "HELP_REGELN_NOGUI";
	}
	return msgKey;
}


function doNoIntent(intent, session, response) {
	var yesNoQuery = handleYesNoQuery(session);
	initUserAndConnect(session, response, function successFunc() {
		if (yesNoQuery === undefined) {
			noQuestionAsked(session, response);
		}
		else {
			execDisplayField(session, response)
		}
	});
}

function doPreviousIntent(intent, session, response) {
	var yesNoQuery = handleYesNoQuery(session);
	initUserAndConnect(session, response, function successFunc() {
		if (yesNoQuery === undefined) {
			didNotUnterstand(intent, session, response);
		}
		else {
			execDisplayField(session, response)
		}
	});
	
}


function handleYesNoQuery(session) {
	var yesNoQuery = getSessionYesNoQuery(session);
	var displayToken = getRequestDisplayToken(session);
	if (displayToken !== undefined) {
		yesNoQuery = TOKEN_TO_YESNOQUERY_MAPPING[displayToken];
	}
	setSessionYesNoQuery(session, "handled");
	logObject("YESNO", yesNoQuery);
	return yesNoQuery;
}

function checkUnhandledYesNoQuery(session) {
	var yesNoQuery = getSessionYesNoQuery(session);
	if (yesNoQuery === "handled") {
		removeSessionYesNoQuery(session);
		return undefined;
	}
	var displayToken = getRequestDisplayToken(session);
	if (displayToken !== undefined) {
		yesNoQuery = TOKEN_TO_YESNOQUERY_MAPPING[displayToken];
	}
	return yesNoQuery;
}


function noQuestionAsked(session, response) {
	var msg = speech.createMsg("INTERN", "NO_QUESTION_ASKED");
	execDisplayField(session, response, msg)
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
			var yesNoQuery = checkUnhandledYesNoQuery(session);
			if (yesNoQuery === undefined) {
				successCallback();
			}
			else {
				removeSessionYesNoQuery(session);
				var msg = speech.createMsg("INTERN", "NOT_YES_NO_ANSWER");
				execDisplayField(session, response, msg)
			}
		});
	});
}

function connect(session, response, successCallback) {
	if (isConnectedToGame(session)) {
		successCallback();
	} else {
		var userId = getDBUserIdFromSession(session);
		var userAILevel = getUserAILevel(session, 2);
		send(session, response, "", "connect", userId, userAILevel,
				function callbackFunc(result) {
					console.log("Connected with GameId: " + result.gameId);
					setSessionGameId(session, result.gameId);
					setSessionGameMovesCount(session, result.movesCount);
					successCallback();
				});
	}
}

function execDoNewGame(intent, session, response) {
	var gameId = getSessionGameId(session);
	sendCommand(session, gameId, "restartGame", "", "", function callbackFunc(result) {
		clearSessionData(session);
		initUserAndConnect(session, response, function successCallback() {
			msg = speech.createMsg("INTERN", "NEW_GAME_STARTED");
			execDisplayField(session, response, msg);
		});
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

function execIntro(session, response) {
	setUserHadIntro(session, true);
	askYesNoText(session, response, "INTRO");
}

function execWelcome(session, response) {
	askYesNoText(session, response, "WELCOME");
}

function askYesNoText(session, response, MSG_KEY) {
	var msg = speech.createMsg("TEXT", MSG_KEY);
	setSessionYesNoQuery(session, MSG_KEY);
	respondText(session, response, msg, "TOK_" + MSG_KEY, true);
}


function showAction(session, response, ACTION_KEY) {
	var msg = speech.createMsg("TEXT", ACTION_KEY);
	respondText(session, response, msg, "ACT_"+ACTION_KEY, false);
}


function execDisplayField(session, response, msg) {
	var gameId = getSessionGameId(session);
	send(session, response, gameId, "getGameData", "", "",
			function callbackFunc(result) {
				setSessionGameMovesCount(session, result.movesCount);
				respondField(session, response, result, msg);
			});
}

function execChangeAILevel(intent, session, response) {
	var aiLevel = getAILevel(intent);
	send(session, response, getSessionGameId(session), "setAILevel", aiLevel, "", function successFunc(result) {
		setUserAILevel(session, aiLevel);
		msg = speech.createMsg("INTERN", "AI_LEVEL_CHANGED", aiLevel);
		execDisplayField(session, response, msg);
	});
}

function execAnimalConnect(intent, session, response) {
	var animal = getMappedAnimal(intent);
	send(session, response, getSessionGameId(session), "connectImage", animal, "", function successFunc(result) {
		msg = speech.createMsg("INTERN", "ANIMAL_CONNECTED", animal);
		execDisplayField(session, response, msg);
	});
}

function didNotUnterstand(intent, session, response) {
	msg = speech.createMsg("INTERN", "DID_NOT_UNDERSTAND");
	execDisplayField(session, response, msg)
}

function changeSettings(intent, session, response) {
	msg = speech.createMsg("INTERN", "CHANGE_SETTINGS");
	execDisplayField(session, response, msg)
}

function closeGame(session, response, successCallback) {
	send(session, response, getSessionGameId(session), "closeGame", "", "", function callbackFunc(result) {
		successCallback();
	});
}


/* ============ */
/* TEXT DISPLAY */
/* ============ */

function respondText(session, response, msg, token, instantAnswer) {
	var directives = createTextDirective(session, msg, token);
	if (instantAnswer) {
		respondMsgWithDirectives(session, response, msg, directives);
	}
	else {
		outputMsgWithDirectives(session, response, msg, directives);
	}
}

function createTextDirective(session, msg, token) {
	if (!getRequestHasDisplay(session)) {
		return undefined;
	}
	var directives = [ {
		"type" : "Display.RenderTemplate",
		"template" : {
			"type" : "BodyTemplate3",
			"token" : token,
			"title" : msg.title,
			"image": {
				"sources": [ { "url": "https://calcbox.de/c4imgs/help/viergewinnt_help-340.png" } ]
			},
			"textContent" : {
				"primaryText" : {
					"type" : "RichText",
					"text" : msg.richText
				}
			},
			"backButton" : "VISIBLE",
		}
	} ];
	return directives;
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
	var gameStatusInfo = createGameStatusInfo(gameData);
	var directives = createFieldDirectives(session, gameData, msg, lastAIMove, gameStatusInfo);
	if (gameData.winner != 0) {
		closeGame(session, response, function closedCallback() {
			outputMsgWithDirectives(session, response, msg, directives);
		});
	} else {
		var instantAnswer = getUserInstantAnswer(session, true);
		if (instantAnswer) {
			respondMsgWithDirectives(session, response, msg, directives);
		} else {
			outputMsgWithDirectives(session, response, msg, directives);
		}
	}
}

function createFieldDirectives(session, gameData, msg, lastAIMove, gameStatusInfo) {
	if (!getRequestHasDisplay(session)) {
		logObject("createFieldDirectives-session", session)
		return undefined;
	}
	var hintMsg = createHintMsg(gameData.winner, lastAIMove);
	var fieldText = createFieldText(gameData.fieldView.field);
	var directives = [ {
		"type" : "Display.RenderTemplate",
		"template" : {
			"type" : "BodyTemplate1",
			"token" : "TOK_MAIN",
			"title" : gameStatusInfo + msg.display,
			"textContent" : {
				"primaryText" : {
					"type" : "RichText",
					"text" : fieldText
				}
			},
			"backButton" : "HIDDEN",
			"hint" : {
				"type" : "PlainText",
				"text" : hintMsg.display
			}
		}
	} ];
	return directives;
}

function outputMsgWithDirectives(session, response, msg, directives) {
	saveUserData(session, response, function successCallback() {
		removeSessionRequest(session);
		speech.outputMsgWithDirectives(response, msg, directives)
	});
}

function respondMsgWithDirectives(session, response, msg, directives) {
	saveUserData(session, response, function successCallback() {
		removeSessionRequest(session);
		speech.respondMsgWithDirectives(response, msg, directives);
	});
}

function createGameStatusInfo(gameData) {
	if (!gameData) {
		return "";
	}
	return "[Zug:"+(gameData.movesCount+1)+"/AI:"+gameData.aiLevel+"] - ";
}

function createStatusMsg(winner, lastAIMove) {
	var msg;
	var status = !lastAIMove ? "STATUS" : "STATUS_AIMOVE";
	if ((winner === 1) || (winner === 2)) {
		if (!lastAIMove) {
			msg = speech.createMsg(status, "PLAYER_WINS", lastAIMove);
		}
		else {
			msg = speech.createMsg(status, "AI_PLAYER_WINS", lastAIMove);
		}
	} else if (winner === -1) {
		msg = speech.createMsg(status, "DRAW", lastAIMove);
	} else {
		msg = speech.createMsg(status, "MAKE_YOUR_MOVE", lastAIMove);
	}
	return msg;
}

function createHintMsg(winner, lastAIMove) {
	var msg;
	if ((winner === 1) || (winner === 2)) {
		if (!lastAIMove) {
			msg = speech.createMsg("HINT", "PLAYER_WINS");
		} else {
			msg = speech.createMsg("HINT", "AI_PLAYER_WINS");
		}
	} else if (winner === -1) {
		msg = speech.createMsg("HINT", "DRAW");
	} else {
		msg = speech.createMsg("HINT", "MAKE_YOUR_MOVE");
	}
	return msg;
}

function createFieldText(field) {
	var result = "";
	result = result + "<font size='3'><action token='ActionHELP'>(?)</action></font><font size='2'>";
	result = result + addImageWH("space_162x64", 162, 64);
	result = result + addImage("frameset_top", 7);
	for (var y = 0; y < 6; y++) {
		
		result = result + "<br/>";
//		result = result + addImage("space_3", 3);  // use this as linebreak to avoid a gap between lines. Does not work on simulator (no 1024px width?)
		
		result = result + addImage("space_3", 3);
		for (var x = 0; x < 7; x++) {
			var col = field[y][x]; // col = 0..4
			result = result + addImage("circle-" + col, 1);
		}
	}
	result = result + "</font>";
	return result;
}

function addImage(imgName, size) {
	return addImageWH(imgName, size * imgBaseSize, imgBaseSize);
}

function addImageWH(imgName, width, height) {
	return "<img src='" + imgBaseUrl + imgName + ".png' width='" + width + "' height='" + height + "'/>";
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

function getMappedAnimal(intent) {
	var animal = getFromIntent(intent, "animal", "?");
	var mappedAnimal = ANIMAL_MAPPING[animal];
	if (mappedAnimal !== undefined) {
		return mappedAnimal;
	}
	return animal.toUpperCase();
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

function isConnectedToGame(session) {
	return getSessionGameId(session) !== undefined;
}

function getAmzUserId(session) {
	if (!session || (!session.user)) {
		return undefined;
	}
	return session.user.userId;
}


function clearSessionData(session) {
	session.attributes = {};
}

function getSessionGameId(session, defaultValue) {
	return getFromSession(session, "gameId", defaultValue);
}
function getSessionGameMovesCount(session, defaultValue) {
	return getFromSession(session, "gameMovesCount", defaultValue);
}
function getSessionLastAIMove(session, defaultValue) {
	return getFromSession(session, "lastAIMove", defaultValue);
}
function getSessionYesNoQuery(session, defaultValue) {
	return getFromSession(session, "yesNoQuery", defaultValue);
}
function getRequestDisplayToken(session, defaultValue) {
	return getFromSessionRequest(session, "displayToken", defaultValue);
}
function getRequestHasDisplay(session, defaultValue) {
	return getFromSessionRequest(session, "hasDisplay", defaultValue);
}

function setSessionGameId(session, gameId) {
	setInSession(session, "gameId", gameId);
}
function setSessionGameMovesCount(session, gameMovesCount) {
	setInSession(session, "gameMovesCount", gameMovesCount);
}
function setSessionLastAIMove(session, lastAIMove) {
	setInSession(session, "lastAIMove", lastAIMove);
}
function setSessionYesNoQuery(session, lastAIMove) {
	setInSession(session, "yesNoQuery", lastAIMove);
}
function setRequestDisplayToken(session, displayToken) {
	setInSessionRequest(session, "displayToken", displayToken);
}
function setRequestHasDisplay(session, hasDisplay) {
	setInSessionRequest(session, "hasDisplay", hasDisplay);
}

function removeSessionLastAIMove(session) {
	removeFromSession(session, "lastAIMove");
}
function removeSessionYesNoQuery(session) {
	removeFromSession(session, "yesNoQuery");
}


function getFromSession(session, key, defaultValue) {
	if (!session || (!session.attributes)) {
		return defaultValue;
	}
	var result = session.attributes[key];
	if (result === undefined) {
		result = defaultValue;
	}
	return result;
}
function setInSession(session, key, value) {
	if (value === undefined) {
		removeFromSession(session, key);
		return;
	}
	if (!session) {
		return;
	}
	if (!session.attributes) {
		session.attributes = {};
	}
	session.attributes[key] = value;
}
function removeFromSession(session, key) {
	if (!session || (!session.attributes) || (!session.attributes[key])) {
		return;
	}
	delete session.attributes[key];
}

function getFromSessionRequest(session, key, defaultValue) {
	if (!session || (!session.request)) {
		return defaultValue;
	}
	var result = session.request[key];
	if (result === undefined) {
		result = defaultValue;
	}
	return result;
}
function setInSessionRequest(session, key, value) {
	if (value === undefined) {
		removeFromSessionRequest(session, key);
		return;
	}
	if (!session) {
		return;
	}
	if (!session.request) {
		session.request = {};
	}
	session.request[key] = value;
}
function removeFromSessionRequest(session, key) {
	if (!session || (!session.request) || (!session.request[key])) {
		return;
	}
	delete session.request[key];
}
function removeSessionRequest(session) {
	if (!session || (!session.request)) {
		return;
	}
	delete session.request;
}


function hasEventDisplay(event) {
	if (!event || (!event.context) || (!event.context.Display)) {
		return false;
	}
	return true;
}

function getEventDisplayToken(event) {
	if (!event || (!event.context) || (!event.context.Display)) {
		return undefined;
	}
	return event.context.Display.token;
}



/* ======= */
/* USER DB */
/* ======= */

function initUser(session, response, successCallback) {
	if (hasDBUserInSession(session)) {
		successCallback();
	} else {
		var amzUserId = getAmzUserId(session);
		if (!amzUserId) {
			speech.respond("INTERN", "NO_AMZ_USERID", response);
		} else {
			sendDB(session, response, "getOrCreateUserByAppAndName", "C4.USER", amzUserId, function callback(result) {
						var dbUser = result.user;
						var userDataOk = unmarshallUserData(dbUser);
						if (!userDataOk) {
							speech.respond("INTERN", "INVALID_USERDATA", response);
						} else {
							setDBUserInSession(session, dbUser);
							console.log("User initialized: " + dbUser.userId);
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

function getUserInstantAnswer(session, defaultValue) {
	return getUserProperty(session, "instantAnswer", defaultValue);
}
function getUserHadIntro(session, defaultValue) {
	return getUserProperty(session, "hadIntro", defaultValue);
}

function getUserAILevel(session, defaultValue) {
	return getUserProperty(session, "aiLevel", defaultValue);
}

function setUserAILevel(session, value) {
	return setUserProperty(session, "aiLevel", value);
}
function setUserHadIntro(session, value) {
	return setUserProperty(session, "hadIntro", value);
}
function setUserInstantAnswer(session, value) {
	return setUserProperty(session, "instantAnswer", value);
}


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
	if (result === undefined) {
		result = defaultValue;
	}
	return result;
}

/* user data changed flag */

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
