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

var http = require('http');
var querystring = require("querystring");

var imgBaseUrl = "https://calcbox.de/c4imgs/64px/";
var imgBaseSize = 64;
var leftTopSpacer = "spacer_162x64";
var leftTopSpacerWidth = 162;

var imgBaseUrlSpot = "https://calcbox.de/c4imgs/50px/";
var imgBaseSizeSpot = 50;
var imgLeftSize = 13;


var QUESTION_TO_INTENTS_MAPPING = {
		"ASK_DEVICE"	: ["DeviceTypeIntent"],
		"ASK_DEVICE.2"	: ["DeviceTypeIntent"],
		
		"INTRO"    : ["AMAZON.YesIntent", "AMAZON.NoIntent"],
		
		"WELCOME"  		: ["AMAZON.YesIntent", "AMAZON.NoIntent"],
		"HELP"  		: ["AMAZON.YesIntent", "AMAZON.NoIntent"],
		"HELP_DETAIL"  	: ["AMAZON.YesIntent", "AMAZON.NoIntent"],
}


var ANIMAL_MAPPING = {

		  // LOCAL de-DE
		  "affe":			"AFFE",
		  "affen":			"AFFE",
		  "ameise":			"AMEISE",
		  "bär":			"BAER",
		  "bären":			"BAER",
		  "biene": 			"BIENE",
		  "dachs": 			"DACHS",
		  "delfin": 		"DELFIN",
		  "delphin": 		"DELFIN",
		  "eichhörnchen":	"EICHHOERNCHEN",
		  "elefant": 		"ELEFANT",
		  "elefanten":		"ELEFANT",
		  "ente": 			"ENTE",
		  "esel": 			"ESEL",
		  "fisch": 			"FISCH",
		  "fliege": 		"FLIEGE",
		  "frosch": 		"FROSCH",
		  "gans": 			"GANS",
		  "giraffe": 		"GIRAFFE",
		  "hahn": 			"HAHN",
		  "hai": 			"HAI",
		  "hase": 			"HASE",
		  "hasen": 			"HASE",
		  "hirsch": 		"HIRSCH",
		  "hund": 			"HUND",
		  "igel": 			"IGEL",
		  "kamel": 			"KAMEL",
		  "katze": 			"KATZE",
		  "krokodil": 		"KROKODIL",
		  "kuh": 			"KUH",
		  "löwe": 			"LOEWE",
		  "löwen": 			"LOEWE",
		  "marienkäfer": 	"MARIENKAEFER",
		  "maus": 			"MAUS",
		  "möwe": 			"MOEWE",
		  "nashorn": 		"NASHORN",
		  "panda": 			"PANDA",
		  "papagei": 		"PAPAGEI",
		  "pfau": 			"PFAU",
		  "pferd":			"PFERD",
		  "pinguin": 		"PINGUIN",
		  "raupe": 			"RAUPE",
		  "schaf": 			"SCHAF",
		  "schildkröte": 	"SCHILDKROETE",
		  "schlange": 		"SCHLANGE",
		  "schmetterling": 	"SCHMETTERLING",
		  "schnecke": 		"SCHNECKE",
		  "schwan": 		"SCHWAN",
		  "schwein": 		"SCHWEIN",
		  "spinne": 		"SPINNE",
		  "storch": 		"STORCH",
		  "tiger": 			"TIGER",
		  "wal": 			"WAL",
		  "wolf": 			"WOLF",
		  "wurm": 			"WURM",
		  "zebra": 			"ZEBRA",
		  
		  // LOCALE en-US
		  "monkey": 		"AFFE",
		  "ant": 			"AMEISE",
		  "bear": 			"BAER",
		  "bee": 			"BIENE",
		  "badger": 		"DACHS",
		  "dolphin": 		"DELFIN",
		  "squirrel": 		"EICHHOERNCHEN",
		  "elephant": 		"ELEFANT",
		  "duck": 			"ENTE",
		  "donkey": 		"ESEL",
		  "fish": 			"FISCH",
		  "fly": 			"FLIEGE",
		  "frog": 			"FROSCH",
		  "goose": 			"GANS",
		  "giraffe": 		"GIRAFFE",
		  "cock": 			"HAHN",
		  "shark": 			"HAI",
		  "rabbit": 		"HASE",
		  "deer": 			"HIRSCH",
		  "dog": 			"HUND",
		  "hedgehog": 		"IGEL",
		  "camel": 			"KAMEL",
		  "cat": 			"KATZE",
		  "crocodile": 		"KROKODIL",
		  "cow": 			"KUH",
		  "lion": 			"LOEWE",
		  "ladybug": 		"MARIENKAEFER",
		  "mouse": 			"MAUS",
		  "gull": 			"MOEWE",
		  "rhino": 			"NASHORN",
		  "panda": 			"PANDA",
		  "parrot": 		"PAPAGEI",
		  "peacock": 		"PFAU",
		  "horse":			"PFERD",
		  "penguin": 		"PINGUIN",
		  "caterpillar": 	"RAUPE",
		  "sheep": 			"SCHAF",
		  "turtle": 		"SCHILDKROETE",
		  "snake": 			"SCHLANGE",
		  "butterfly": 		"SCHMETTERLING",
		  "snail": 			"SCHNECKE",
		  "swan": 			"SCHWAN",
		  "pig": 			"SCHWEIN",
		  "spider": 		"SPINNE",
		  "stork": 			"STORCH",
		  "tiger": 			"TIGER",
		  "whale": 			"WAL",
		  "wolf": 			"WOLF",
		  "worm": 			"WURM",
		  "zebra": 			"ZEBRA"
		  
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

	"NewGameIntent" : doNewGame,
	"PlayerMoveIntent" : doPlayerMove,
	"AIStartsIntent" : doAIStarts,
	"ChangeAILevelIntent" : doChangeAILevel,
	"ChangeDeviceIntent" : doChangeDeviceIntent,
	
	"DeviceTypeIntent" : doDeviceTypeIntent,
	
	"AnimalConnectIntent" : doAnimalConnect, 
		
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
	logObject("EVENT", event);
	
	speech.set_locale(getEventLocale(event)); 
	
	// Create an instance of the ConnectFourSkill skill.
	var connectFourSkill = new ConnectFourSkill();
	removeSessionRequest(event.session);
	setRequestHasDisplay(event.session, hasEventDisplay(event));
	setRequestDeviceId(event.session, getEventDeviceId(event));
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

/* =========== */
/* DO METHODEN */
/* =========== */

function doLaunch(session, response) {
	initUserAndConnect("LAUNCH", session, response, function successFunc() {
		var phase = getUserPhase(session);
		logObject("phase", phase);
		if ((!phase) || (phase === "INTRO")) {
			execIntro(session, response);
		}
		else {
			if (getSessionGameMovesCount(session) === 0) {
				execWelcome(session, response);
			}
			else {
				addRequestMsg(session, speech.createMsg("INTERN", "GAME_CONTINUED"));
				execDisplayField(session, response)
			}
		}
	});
}

function doStartOverIntent(intent, session, response) {
	doNewGame(intent, session, response);
}
function doNewGame(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		execDoNewGame(session, response);
	});
}

function doPlayerMove(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		var slot = getSlot(intent);
		execDoMove(session, response, slot);
	});
}

function doAIStarts(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		if (getSessionGameMovesCount(session) === 0) {
			execDoAIMove(session, response);
		}
		else {
			addRequestMsg(session, speech.createMsg("INTERN", "AI_STARTS_NOT_ALLOWED"));
			execDisplayField(session, response)
		}
	});
}

function doChangeDeviceIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		execChangeDeviceIntent(session, response);
	});
}

function doChangeAILevel(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		var aiLevel = getAILevel(intent);
		execChangeAILevel(session, response, aiLevel);
	});
}

function doDeviceTypeIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		didNotUnterstand(intent, session, response);
	});
}

function doAnimalConnect(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		var animal = getMappedAnimal(intent);
		execAnimalConnect(session, response, animal);
	});
}

function doHelpIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		askQuestion(session, response, "HELP");
	});
}

function doYesIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		noQuestionAsked(session, response);
	});
}

function doNoIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		noQuestionAsked(session, response);
	});
}

function doPreviousIntent(intent, session, response) {
	var question = getSessionQuestion(session);
	initUserAndConnect(intent, session, response, function successFunc() {
		if (question === undefined) {
			didNotUnterstand(intent, session, response);
		}
		else {
			execDisplayField(session, response)
		}
	});
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
	didNotUnterstand(intent, session, response);
}


	// ============= //
	// EXEC METHODEN //
	// ============= //

function execDoNewGame(session, response) {
	var gameId = getSessionGameId(session);
	sendCommand(session, gameId, "restartGame", "", "", function callbackFunc(result) {
		clearSessionData(session);
		initUserAndConnect(undefined, session, response, function successCallback() {
			addRequestMsg(session, speech.createMsg("INTERN", "NEW_GAME_STARTED"));
			execDisplayField(session, response);
		});
	});
}

function execDoMove(session, response, slot) {
	send(session, response, getSessionGameId(session), "doMove",
			slot, "", function successFunc(result) {
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

function execIntro(session, response, phase) {
	setUserPhase(session, "INTRO");
	askQuestion(session, response, "INTRO");
}

function execWelcome(session, response) {
	askQuestion(session, response, "WELCOME");
}

function execChangeDeviceIntent(session, response) {
	if (!getRequestHasDisplay(session)) {
		addRequestMsg(session, speech.createMsg("INTERN", "DEVICE_HAS_NO_DISPLAY"));
		execDisplayField(session, response);
	}
	else {
		askQuestion(session, response, "ASK_DEVICE");
	}
}

function execChangeAILevel(session, response, aiLevel) {
	send(session, response, getSessionGameId(session), "setAILevel", aiLevel, "", function successFunc(result) {
		setUserAILevel(session, aiLevel);
		msg = speech.createMsg("INTERN", "AI_LEVEL_CHANGED", aiLevel);
		execDisplayField(session, response, msg);
	});
}

function execAnimalConnect(session, response, animal) {
	send(session, response, getSessionGameId(session), "connectImage", animal, "", function successFunc(result) {
		msg = speech.createMsg("INTERN", "ANIMAL_CONNECTED", animal);
		execDisplayField(session, response, msg);
	});
}

	// ============ //
	// ERR-RESPONSE //
	// ============ //


function didNotUnterstand(intent, session, response) {
	msg = speech.createMsg("INTERN", "DID_NOT_UNDERSTAND");
	execDisplayField(session, response, msg)
}


function noQuestionAsked(session, response) {
	addRequestMsg(session, speech.createMsg("INTERN", "NO_QUESTION_ASKED"));
	execDisplayField(session, response);
}


	/* ========= */
	/* QUESTIONS */
	/* ========= */


function handleSessionQuestion(intent, session, response) {
	var question = getSessionQuestion(session);
	if (!question) { 
		// no question set in session
		return false;
	}
	// check if intent is valid for question
	var validIntents = QUESTION_TO_INTENTS_MAPPING[question];
	if (!validIntents) {
		return false;
	}
	if (validIntents.indexOf(intent.name) === -1) {
		if (!question.endsWith(".RETRY")) {
			question = question + ".RETRY";
		}
	}
	execAnswer(question, intent, session, response);
	return true;
}

function execAnswer(question, intent, session, response) {
	removeSessionQuestion(session);
	switch (question) {

	// ASK_DEVICE
	case "ASK_DEVICE":
	case "ASK_DEVICE.2": {
		var deviceType = getFromIntent(intent, "device");
		deviceType = (deviceType===undefined) ? "" : deviceType.toLowerCase(); 
		if ((deviceType !== "show") && (deviceType !== "spot") && (deviceType !== "anderes")) {
			askQuestion(session, response, "ASK_DEVICE.2");
		}
		else {
			deviceTypeText = deviceType;
			if ((deviceType === "show") || (deviceType === "spot")) {
				deviceTypeText = "echo " + deviceTypeText;
			}
			setDeviceType(session, deviceType);
			addRequestMsg(session, speech.createMsg("INTERN", "DEVICE_SELECTED", deviceTypeText));
			doLaunch(session, response);
		}
		break;
	}

	// INTRO
	case "INTRO": {
		setUserPhase(session, "PLAY");
		var detailedHelp = (intent.name === "AMAZON.YesIntent");
		if (detailedHelp) {
			askQuestion(session, response, "HELP_DETAIL");
		}
		else {
			addRequestMsg(session, speech.createMsg("INTERN", "LETS_GO"));
			execDisplayField(session, response);
		}
		break;
	}
	case "INTRO.RETRY": {
		addRequestMsg(session, speech.createMsg("INTERN", "NOT_YES_NO_ANSWER"));
		execDisplayField(session, response);
		break;
	}
	
	// HELP / WELCOME
	case "WELCOME":
	case "HELP": {
		var detailHelp = (intent.name === "AMAZON.YesIntent");
		if (detailHelp) {
			askQuestion(session, response, "HELP_DETAIL");
		}
		else {
			addRequestMsg(session, speech.createMsg("INTERN", "LETS_GO"));
			execDisplayField(session, response);
		}
		break;
	}
	case "WELCOME.RETRY":
	case "HELP.RETRY": {
		addRequestMsg(session, speech.createMsg("INTERN", "NOT_YES_NO_ANSWER"));
		execDisplayField(session, response);
		break;
	}
	case "HELP_DETAIL": {
		var detailHelp = (intent.name === "AMAZON.YesIntent");
		if (detailHelp) {
			askQuestion(session, response, "HELP_DETAIL");
		}
		else {
			addRequestMsg(session, speech.createMsg("INTERN", "LETS_GO"));
			execDisplayField(session, response);
		}
		break;
	}
	case "HELP_DETAIL.RETRY": {
		addRequestMsg(session, speech.createMsg("INTERN", "NOT_YES_NO_ANSWER"));
		execDisplayField(session, response);
		break;
	}
	
	// handle RETRIES 
	default: {
		if (question.endsWith(".RETRY")) {
			askQuestion(session, response, question);
		} 
		else {
			speech.respond("Generic", "E_QUESTION", response, question);
		}
		break;
	}
	}
}



	/* ===================== */
	/* INIT/CONNECT METHODEN */
	/* ===================== */


function initUserAndConnect(intent, session, response, successCallback) {
	initDevice(intent, session, response, function successFunc1() {
		initUser(intent, session, response, function successFunc2() {
			connect(session, response, function successFunc3() {
				var handled = handleSessionQuestion(intent, session, response);
				if (!handled) {
					successCallback();
				};
			});
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

function initUser(intent, session, response, successCallback) {
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

function initDevice(intent, session, response, successCallback) {
	if (!getRequestHasDisplay(session)) {
		speech.setDeviceType("none");
		successCallback();
	}
	else if (hasDBDeviceInSession(session)) {
		var handled = handleDeviceQuestion(intent, session, response);
		if (!handled) {
			speech.setDeviceType(getDeviceType(session));
			successCallback();
		};
	} else {
		var amzDeviceId = getRequestDeviceId(session);
		if (!amzDeviceId) {
			// simulator
			successCallback();
		} else {
			sendDB(session, response, "getOrCreateUserByAppAndName", "C4.DEVICE", amzDeviceId, function callback(result) {
						var dbDevice = result.user;
						var deviceDataOk = unmarshallUserData(dbDevice);
						if (!deviceDataOk) {
							speech.respond("INTERN", "INVALID_DEVICEDATA", response);
						} else {
							setDBDeviceInSession(session, dbDevice);
							console.log("Device initialized: " + dbDevice.userId);
							logObject("Device", dbDevice)
							var handled = handleDeviceQuestion(intent, session, response);
							if (!handled) {
								speech.setDeviceType(getDeviceType(session));
								successCallback();
							};
						}
					});
		}
	}
}

function handleDeviceQuestion(intent, session, response) {
	if (intent && intent.name === "DeviceTypeIntent") {
		return false;
	}
	if (getSessionQuestion(session)) {
		return false;
	}
	var deviceType = getDeviceType(session);
	logObject("deviceType", deviceType)
	if (deviceType) {
		return false;
	}
	askQuestion(session, response, "ASK_DEVICE");
	return true;
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


function execDisplayField(session, response) {
	var msg = getRequestMsg(session);
	var gameId = getSessionGameId(session);
	send(session, response, gameId, "getGameData", "", "",
			function callbackFunc(result) {
				setSessionGameMovesCount(session, result.movesCount);
				respondField(session, response, result, msg);
			});
}

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
		var instantAnswer = true;
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
	var title = createTitle(session, gameStatusInfo, msg.display);
	var fieldText = createFieldText(session, gameData.fieldView.field);
	var directives = [ {
		"type" : "Display.RenderTemplate",
		"template" : {
			"type" : "BodyTemplate1",
			"token" : "TOK_MAIN",
			"title" : title,
			"textContent" : {
				"primaryText" : {
					"type" : "RichText",
					"text" : fieldText
				}
			},
			"backButton" : "HIDDEN"
		}
	} ];
	return directives;
}

function createGameStatusInfo(gameData) {
	if (!gameData) {
		return "";
	}
	return "[Zug:"+(gameData.movesCount+1)+"/AI:"+gameData.aiLevel+"]";
}

function createTitle(session, gameStatusInfo, displayMsg) {
	var deviceType = getDeviceType(session);
	var result; 
	if (deviceType === "spot") {
		if (gameStatusInfo !== undefined) {
			result = gameStatusInfo;
		}
		else {
			result = displayMsg;
		}
	}
	else {
		var result = displayMsg;
		if (gameStatusInfo !== undefined) {
			result = gameStatusInfo + " - " + result;
		}
	}
	return result;
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

function createFieldText(session, field) {
	var deviceType = getDeviceType(session);
	if (deviceType === "show") {
		return createFieldTextShow(field);
	}
	if (deviceType === "spot") {
		return createFieldTextSpot(field);
	}
	return createFieldTextDefault(field);
}


function createFieldTextSpot(field) {
	var result = "";
	result = result + "<font size='2'>";
	for (var y = 0; y < 6; y++) {
		result = result + addImageSpotW("left", 13);
		for (var x = 0; x < 7; x++) {
			var col = field[y][x]; // col = 0..4
			result = result + addImageSpot("circle-" + col, 1);
		}
		result = result + addImageSpotW("left", 13);
	}
	result = result + addImageSpotW("left", 13);
	result = result + addImageSpot("frameset_top", 7);
	result = result + "</font>";
	return result;
}

function createFieldTextShow(field) {
	var result = "";
	result = result + "<font size='2'>";
	result = result + addImage("space_3", 3);
	result = result + addImage("frameset_top", 7);
	for (var y = 0; y < 6; y++) {
		result = result + addImage("space_3", 3);  // use this as linebreak to avoid a gap between lines. Does not work on simulator (no 880px width?)
		
		result = result + addImage("space_3", 3);
		for (var x = 0; x < 7; x++) {
			var col = field[y][x]; // col = 0..4
			result = result + addImage("circle-" + col, 1);
		}
	}
	result = result + "</font>";
	return result;
}

function createFieldTextDefault(field) {
	var result = "";
	result = result + "<font size='2'>";
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
	result = result + "</font>";
	return result;
}

function addImage(imgName, size) {
	return addImageWH(imgBaseUrl, imgName, size * imgBaseSize, imgBaseSize);
}

function addImageSpot(imgName, size) {
	return addImageWH(imgBaseUrlSpot, imgName, size * imgBaseSizeSpot, imgBaseSizeSpot);
}

function addImageSpotW(imgName, pxSize) {
	return addImageWH(imgBaseUrlSpot, imgName, pxSize, imgBaseSizeSpot);
}

function addImageWH(baseUrl, imgName, width, height) {
	return "<img src='" + baseUrl + imgName + ".png' width='" + width + "' height='" + height + "'/>";
}


	/* ================== */
	/* RESPONSE WITH SAVE */
	/* ================== */


function outputMsgWithDirectives(session, response, msg, directives) {
saveUserData(session, response, function successCallback1() {
	saveDeviceData(session, response, function successCallback2() {
		removeSessionRequest(session);
		speech.outputMsgWithDirectives(response, msg, directives);
	});
});
}

function respondMsgWithDirectives(session, response, msg, directives) {
saveUserData(session, response, function successCallback1() {
	saveDeviceData(session, response, function successCallback2() {
		removeSessionRequest(session);
		speech.respondMsgWithDirectives(response, msg, directives);
	});
});
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
	if (animal === undefined) {
		return '?';
	}
	animal = animal.toLowerCase();
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
	/* REQUEST VARIABLES ACCESS */
	/* ======================== */

function addRequestMsg(session, msg) {
	var prefixMsg = getRequestMsg(session);
	if (prefixMsg !== undefined) {
		addPrefixMsg(msg, prefixMsg);
	}
	setRequestMsg(session, msg);
}

function getRequestDisplayToken(session, defaultValue) {
	return getFromSessionRequest(session, "displayToken", defaultValue);
}
function getRequestDeviceId(session, defaultValue) {
	return getFromSessionRequest(session, "deviceId", defaultValue);
}
function getRequestHasDisplay(session, defaultValue) {
	return getFromSessionRequest(session, "hasDisplay", defaultValue);
}
function getRequestMsg(session, defaultValue) {
	return getFromSessionRequest(session, "msg", defaultValue);
}

function setRequestDisplayToken(session, displayToken) {
	setInSessionRequest(session, "displayToken", displayToken);
}
function setRequestDeviceId(session, deviceId) {
	setInSessionRequest(session, "deviceId", deviceId);
}
function setRequestHasDisplay(session, hasDisplay) {
	setInSessionRequest(session, "hasDisplay", hasDisplay);
}
function setRequestMsg(session, msg) {
	setInSessionRequest(session, "msg", msg);
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



	/* ======================== */
	/* SESSION VARIABLES ACCESS */
	/* ======================== */
	

function clearSessionData(session) {
	session.attributes = {};
}

function isConnectedToGame(session) {
	return getSessionGameId(session) !== undefined;
}

function getAmzUserId(session) {
	if (!session || (!session.user)) {
		return undefined;
	}
	return session.user.userId;
}

function getSessionQuestion(session, defaultValue) {
	return getFromSession(session, "question", defaultValue);
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

function setSessionQuestion(session, question) {
	setInSession(session, "question", question);
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

function removeSessionQuestion(session) {
	removeFromSession(session, "question");
}
function removeSessionLastAIMove(session) {
	removeFromSession(session, "lastAIMove");
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


	/* ============== */
	/* GET EVENT INFO */
	/* ============== */


function hasEventDisplay(event) {
	if (!event || (!event.context) || (!event.context.Display)) {
		return false;
	}
	return true;
}

function getEventLocale(event) {
	if (!event || (!event.request)) {
		return undefined;
	}
	return event.request.locale;
}

function getEventDisplayToken(event) {
	if (!event || (!event.context) || (!event.context.Display)) {
		return undefined;
	}
	return event.context.Display.token;
}

function getEventDeviceId(event) {
	if (!event || (!event.context) || (!event.context.System) || (!event.context.System.device)) {
		return undefined;
	}
	return event.context.System.device.deviceId;
}


    // ========= //
	// QUESTIONS //
	// ========= //


function askQuestion(session, response, MSG_KEY) {
	var prefixMsg = getRequestMsg(session);
	var msg = speech.createMsg("TEXT", MSG_KEY);
	logObject("MSG_KEY: ", MSG_KEY)
	if (MSG_KEY.endsWith(".RETRY")) {
		MSG_KEY = MSG_KEY.substring(0, MSG_KEY.length - 6);
	}
	addPrefixMsg(msg, prefixMsg);
	setSessionQuestion(session, MSG_KEY);
	respondText(session, response, msg, "TOK_" + MSG_KEY, true);
}


	// ====== //
	// HELPER //
	// ====== //


function addPrefixMsg(baseMsg, prefixMsg) {
	if (!prefixMsg) {
		return;
	}
	if (prefixMsg.speechOut && baseMsg.speechOut) {
		baseMsg.speechOut = prefixMsg.speechOut + " " + baseMsg.speechOut;
	}
	if (prefixMsg.display && baseMsg.display) {
		baseMsg.display = prefixMsg.display + " " + baseMsg.display;
	}
}


	// ===================== //
	// SAVE / LOAD USER DATA //
	// ===================== //


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

function updateUserDataInDB(session, response, callbackSuccess) {
	var userId = getDBUserIdFromSession(session);
	var marshalledUserData = getMarshalledUserData(session);
	sendDB(session, response, "updateUserData", userId, marshalledUserData, function callback(result) {
		callbackSuccess();
	});
}


	// ==================== //
	// USER DATA IN SESSION //
	// ==================== //


function hasDBUserInSession(session) {
	if (!getDBUserFromSession(session)) {
		return false;
	}
	return true;
}

function getUserDataFromSession(session) {
	var dbUser = getDBUserFromSession(session);
	if (!dbUser) {
		return undefined;
	}
	return dbUser.data;
}

function getDBUserIdFromSession(session) {
	var dbUser = getDBUserFromSession(session);
	if (!dbUser) {
		return undefined;
	}
	return dbUser.userId;
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


// =============== //
// USER PROPERTIES //
// =============== //


function getUserPhase(session, defaultValue) {
	return getUserProperty(session, "phase", defaultValue);
}
function getUserAILevel(session, defaultValue) {
	return getUserProperty(session, "aiLevel", defaultValue);
}

function setUserAILevel(session, value) {
	return setUserProperty(session, "aiLevel", value);
}
function setUserPhase(session, value) {
	return setUserProperty(session, "phase", value);
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

// ================= //
// USER DATA CHANGES //
// ================= //

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



	// ======================= //
	// SAVE / LOAD DEVICE DATA //
	// ======================= //


function saveDeviceData(session, response, callbackSuccess) {
	if (!hasDeviceDataChanged(session)) {
		callbackSuccess();
	} else {
		clearDeviceDataChanged(session);
		updateDeviceDataInDB(session, response, function callback() {
			callbackSuccess();
		});
	}
}

function updateDeviceDataInDB(session, response, callbackSuccess) {
	var deviceId = getDBDeviceIdFromSession(session);
	var marshalledDeviceData = getMarshalledDeviceData(session);
	sendDB(session, response, "updateUserData", deviceId, marshalledDeviceData, function callback(result) {
		callbackSuccess();
	});
}


	// ====================== //
	// DEVICE DATA IN SESSION //
	// ====================== //
	

function hasDBDeviceInSession(session) {
	if (!getDBDeviceFromSession(session)) {
		return false;
	}
	return true;
}

function getDeviceDataFromSession(session) {
	var dbDevice = getDBDeviceFromSession(session);
	if (!dbDevice) {
		return undefined;
	}
	return dbDevice.data;
}

function getDBDeviceFromSession(session) {
	if (!session || (!session.attributes)) {
		return undefined;
	}
	return session.attributes.dbDevice;
}

function setDBDeviceInSession(session, dbDevice) {
	if (!session || (!session.attributes)) {
		return;
	}
	session.attributes.dbDevice = dbDevice;
}


	// ================= //
	// DEVICE PROPERTIES //
	// ================= //


function getDBDeviceIdFromSession(session) {
	var dbDevice = getDBDeviceFromSession(session);
	if (!dbDevice) {
		return undefined;
	}
	return dbDevice.userId;
}

function setDeviceType(session, value) {
	setDeviceProperty(session, "type", value);
}
function getDeviceType(session, defaultValue) {
	return getDeviceProperty(session, "type", defaultValue);
}

function setDeviceProperty(session, key, value) {
	var deviceData = getDeviceDataFromSession(session);
	if (!deviceData) {
		return;
	}
	deviceData[key] = value;
	deviceData.changed = true;
}
function getDeviceProperty(session, key, defaultValue) {
	var deviceData = getDeviceDataFromSession(session);
	if (!deviceData) {
		return defaultValue;
	}
	var result = deviceData[key];
	if (result === undefined) {
		result = defaultValue;
	}
	return result;
}


	// =================== //
	// DEVICE DATA CHANGES //
	// =================== //


function hasDeviceDataChanged(session) {
	var deviceData = getDeviceDataFromSession(session);
	if (!deviceData || (!deviceData.changed)) {
		return false;
	}
	return true;
}

function clearDeviceDataChanged(session) {
	var deviceData = getDeviceDataFromSession(session);
	if (!deviceData) {
		return;
	}
	delete deviceData.changed;
}


//================= //
//UN-/MARSHALL JSON //
//================= //


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


function getMarshalledUserData(session) {
	var data = getUserDataFromSession(session);
	if (!data) {
		return undefined;
	}
	var result = JSON.stringify(data);
	return result;
}

function getMarshalledDeviceData(session) {
	var data = getDeviceDataFromSession(session);
	if (!data) {
		return undefined;
	}
	var result = JSON.stringify(data);
	return result;
}



	/* ========= */
	/* REST CALL */
	/* ========= */


function closeGame(session, response, successCallback) {
	send(session, response, getSessionGameId(session), "closeGame", "", "", function callbackFunc(result) {
		successCallback();
	});
}



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


	// ============ //
	// REST CALL DB //
	// ============ //


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


	// ======= //
	// LOGGING //
	// ======= //

function logObject(prefix, object) {
	console.log(prefix + ": " + JSON.stringify(object));
}
