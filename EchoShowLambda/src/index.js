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
 * Der Alexa Skills Vier Gewinnt wird in der Hoffnung, 
 * dass es nuetzlich sein wird, aber
 * OHNE JEDE GEWAEHRLEISTUNG, bereitgestellt; sogar ohne die implizite
 * Gewaehrleistung der MARKTFAEHIGKEIT oder EIGNUNG FUER EINEN BESTIMMTEN ZWECK.
 * Siehe die GNU General Public License fuer weitere Details.
 * 
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
 */

/* App ID for the skill */
var APP_ID = "amzn1.ask.skill.46c8454a-d474-4e38-a75e-c6c8017b1fe1"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

var endpoint = 'https://calcbox.de/conn4/rest';   // process.env.ENDPOINT;
var dbEndpoint = 'https://calcbox.de/simdb/rest';   // process.env.ENDPOINT;

var URL = require('url');
var authUsername = process.env.AUTH_USERNAME;   // 'rest';
var authPassword = process.env.AUTH_PASSWORD;   // 'geheim';

var AlexaSkill = require('./AlexaSkill');

var speech = require('./Speech');
speech.init_messages("DE");

var http = require('http');
var querystring = require("querystring");


var imgBaseUrl = "https://calcbox.de/c4imgs/48px/";
var imgBaseSize = 48;


/**
 * ConnectFourSkill is a child of AlexaSkill.
 */
var ConnectFourSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
ConnectFourSkill.prototype = Object.create(AlexaSkill.prototype);
ConnectFourSkill.prototype.constructor = ConnectFourSkill;

ConnectFourSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("ConnectFourSkill onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
    clearSessionData(session);
};

ConnectFourSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
	execRestart(session, response);
};



function execRestart(session, response) {
    initUser(session, response, function callbackFunc() {
		execShowStatus(session, response);
    });
};


function execShowStatus(session, response) {
	var phase = getPhaseFromUserData(session, "init");
	if (phase === "init") {
		execWelcome(session, response);
	}
	else if (phase === "play") {
		execShowCurrentBoard(session, response);
	} 
	else {
		// unexpected phase?
		execWelcome(session, response);
	}
}

function execShowCurrentBoard(session, response) {
	var msg = speech.createMsg("INTERN", "YOUR_MOVE");
	execRespondWithDisplay(msg, session, response);
}

function execWelcome(session, response) {
	sendCommand(session, "", "createSessionlessGame", "", "", function callbackFunc(result) {
        console.log("createSessionlessGame: sessionId: " + session.sessionId+", res: "+result.code);
        if (result.code === "S_OK") {
        	setGameIdInUserData(result.gameId);
            console.log("Start BlindGame with GameId: " + result.gameId);
            setSessionGameId(session, result.gameId);
//        	setPhase("name", session);
        	setPhase("play", session);
        }
    	var msg = speech.createMsg("SEND_createSessionlessGame", result.code);
    	execRespondWithDisplay(msg, session, response);
    });
}




function initUser(session, response, successCallback) {
	if (hasDBUserInSession(session)) {
		successCallback();
	}
	else {
		var amzUserId = getAmzUserIdFromSession(session);
		if (!amzUserId) {
        	speech.respond("INTERN", "NO_AMZ_USERID", response);
		}
		else {
			sendDBCommand(session, "getOrCreateUserByAppAndName", amzUserId, function (result) {
		        if ((result.code === "S_OK") || (result.code === "S_CREATED")) {
		        	var dbUser = result.user;
		        	console.log(dbUser);
		        	var userDataOk = unmarshallUserData(dbUser); 
		        	if (!userDataOk) {
			        	speech.respond("INTERN", "INVALID_USERDATA", response);
		        	}
		        	else {
			        	console.log(dbUser);
		        		setDBUserInSession(session, dbUser);
		        		successCallback();
		        	}
		        }
		        else {
		        	speech.respond("SEND_getOrCreateUserByAppAndName", result.code, response);
		        }
			});
		}
	}
} 

function execStartBlindGame(session, response) {
	if (!checkPhase("init", session, response)) {
		return;
	}
};


ConnectFourSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("ConnectFourSkill onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
    clearSessionData(session);
};

ConnectFourSkill.prototype.intentHandlers = {
		
    "ConnectGameIntent": function (intent, session, response) {
    	if (!checkPhase("init", session, response)) {
    		return;
    	}
    	var gameId = getGameId(intent);
    	sendCommand(session, gameId, "activateGame", "", "", function callbackFunc(result) {
            console.log(intent.name+": gid: "+ gameId + ", sessionId: " + session.sessionId+", res: "+result.code);
            if (result.code === "S_OK") {
	            console.log("Start Game with GameId: " + result.gameId);
            	setSessionGameId(session, result.gameId);
//            	setPhase("name", session);
            	setPhase("play", session);
            }
            speech.respond(intent.name, result.code, response);
        });
    },
    
    "BlindGameIntent": function (intent, session, response) {
    	execStartBlindGame(session, response);
    },

    "SetPlayerNameIntent": function (intent, session, response) {
    	if (!checkPhase("name", session, response)) {
    		return;
    	}
    	var playerName = getPlayerName(intent);
    	sendCommand(session, getSessionGameId(session), "setPlayerNames", playerName, "Alexa", function callbackFunc(result) {
            console.log(intent.name+": sessionId: " + session.sessionId+", res: "+result.code);
            if (result.code === "S_OK") {
            	setSessionPlayername(session, playerName);
            	setPhase("play", session);
            }
            else if (result.code === "E_UNKNOWN_GAMEID") {
            	clearSessionData(session);
            	setPhase("init", session);
            }
            speech.respond(intent.name, result.code, response, playerName);
        });
    },

    "PlayerMoveIntent": function (intent, session, response) {
    	if (!checkPhase("play", session, response)) {
    		return;
    	}
    	var slot = getSlot(intent);
    	sendCommand(session, getSessionGameId(session), "doMove", slot, "", function callbackFunc(result) {
            console.log(intent.name+": sessionId: slot: " + slot + session.sessionId+", res: "+result.code);
            if (result.code === "S_OK") {
            	sendCommand(session, getSessionGameId(session), "doAIMove", "", "", function callbackFunc(result2) {
                    console.log(intent.name+": sessionId: "+ session.sessionId+", res: "+result2.code);
                    if ((result2.code === "S_AI_PLAYER_WINS") || (result2.code === "S_AI_DRAW")) {
                    	sendCommand(session, getSessionGameId(session), "closeGame", "", "", function callbackFunc(result3) {
	                    	clearSessionData(session);
	                    	speech.goodbye(intent.name, result2.code, response, result2.slot);
                    	});
                    }
                    else {
                    	console.log("### "+intent.name +"/"+ result2.code +"/"+ result2.slot);
                    	var msg = speech.createMsg(intent.name, result2.code, result2.slot);
                    	execRespondWithDisplay(msg, session, response);
                    }
            	});
            }
            else if ((result.code === "S_PLAYER_WINS") || (result.code === "S_DRAW")) {
            	sendCommand(session, getSessionGameId(session), "closeGame", "", "", function callbackFunc(result2) {
                	clearSessionData(session);
                	speech.goodbye(intent.name, result.code, response);
            	});
            }
            else {
            	if (result.code === "E_UNKNOWN_GAMEID") {
	            	clearSessionData(session);
	            	setPhase("init", session);
            	}
            	speech.respond(intent.name, result.code, response);
            }
        });
    },

    "SetAILevelIntent": function (intent, session, response) {
    	if (!checkPhase("play", session, response)) {
    		return;
    	}
    	var aiLevel = getAILevel(intent);
        console.log("AILEVEL1=" + aiLevel);
    	sendCommand(session, getSessionGameId(session), "setAILevel", aiLevel, "", function callbackFunc(result) {
            console.log("AILEVEL2=" + aiLevel);
            console.log(intent.name+": aiLevel: " + aiLevel + " sessionId: " + session.sessionId+", res: "+result.code);
            speech.respond(intent.name, result.code, response, aiLevel);
        });
    },

    "GetAILevelIntent": function (intent, session, response) {
    	if (!checkPhase("play", session, response)) {
    		return;
    	}
    	sendCommand(session, getSessionGameId(session), "getGameData", "", "", function callbackFunc(result) {
            console.log(intent.name+": " + " sessionId: " + session.sessionId+", res: "+result.code);
            console.log("AILEVEL3=" + result.aiLevel);
            speech.respond(intent.name, result.code, response, result.aiLevel);
        });
    },

    "AMAZON.StartOverIntent": function (intent, session, response) {
    	setConfirmation(intent.name, session);
        speech.respond(intent.name, "CONFIRM", response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
//    	setConfirmation(intent.name, session);
//        speech.respond(intent.name, "CONFIRM", response);
    	sendCommand(session, getSessionGameId(session), "closeGame", "", "", function callbackFunc(result) {
            console.log(intent.name + session.sessionId+", result: "+result.code);
            clearSessionData(session);
            speech.goodbye(intent.name, "*", response);
        });
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
    	setLongHelp(session);
    	phaseHelp("", session, response);
    },
    

    "AMAZON.YesIntent": function (intent, session, response) {
    	var confirmation = getConfirmation(session, "?");
    	if (confirmation === "?") {
    		setShortHelp(session);
    		phaseHelp("Ich hatte keine Ja Nein Frage gestellt. ", session, response);
    		return;
    	}
    	clearConfirmation(session)
    	if (confirmation === "AMAZON.StopIntent") {
        	sendCommand(session, getSessionGameId(session), "newGame", "", "", function callbackFunc(result) {
                console.log("CONFIRMED-"+confirmation + ": sessionId: " + session.sessionId+", result: "+result.code);
                response.tellWithCard("Auf wiederhören, bis zum nächsten Mal.", "Vier-Gewinnt Skill", "Auf wiederhören, bis zum nächsten Mal.");
                clearSessionData(session);
            });
    	}
    	else if (confirmation === "AMAZON.StartOverIntent") {
	    	sendCommand(session, getSessionGameId(session), "newGame", "", "", function callbackFunc(result) {
	            console.log("CONFIRMED-"+confirmation + ": sessionId: " + session.sessionId+", result: "+result.code);
	            speech.respond(confirmation, result.code, response);
	        });
    	}
    	else {
    		response.tellWithCard("Das sollte nicht passieren, unbekannte Bestätigung! Das Spiel wird beendet, sorry.", "Vier-Gewinnt Skill", "Das sollte nicht passieren, unbekannte Bestätigung '"+confirmation+"'! Das Spiel wird beendet, sorry.");
    	}
    },
    
    "AMAZON.NoIntent": function (intent, session, response) {
    	var confirmation = getConfirmation(session, "?");
    	if (confirmation === "?") {
    		setShortHelp(session);
    		phaseHelp("Ich hatte keine Ja Nein Frage gestellt. ", session, response);
    		return;
    	}
        response.askWithCard("Okay, weiter gehts!", "Vier-Gewinnt Skill", "OK, weiter gehts!");
    }

    
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the ConnectFourSkill skill.
    var connectFourSkill = new ConnectFourSkill();
    connectFourSkill.execute(event, context);
};

//initialize tests
exports.initTests = function (url, param, callback) {
	endpoint = url;
	sendCommand([], "?", "initTests", param, "", function callbackFunc(result) {
		console.log(result);
		callback();
	});
}


function checkPhase(comparePhase, session, response) {
	var confirmation = getConfirmation(session, "?");
	clearConfirmation(session);
	if (confirmation !== "?") {
	    response.askWithCard("Ich werte das als Nein, weiter gehts!", "Vier-Gewinnt Skill", "ich werte das als Nein, weiter gehts!");
	    return false;
	}
	if (!isInPhase(comparePhase, session)) {
		wrongPhaseResponse(session, response);
		return false;
	}
	return true;
}

function clearSessionData(session) {
	session.attributes = {};
}

function wrongPhaseResponse(session, response) {
	phaseHelp("Ich habe dein Kommando nicht verstanden. ", session, response);
}

function phaseHelp(prefix, session, response) {
	var phase = getPhaseFromSession(session, "?");
	var speechOutput = "";
	var display = "";
	if (phase === "init") {
		speechOutput = prefix + " Öffne die Webseite Kalk Box Punkt D E in einem Browser und nennen mir die angezeigte Spiel Ei Di, um das Spiel auf dem Monitor zu verfolgen oder sage: Starte ein Blindspiel.";
		display = prefix + " Öffne die Webseite http://calcbox.de/alexalink in einem Browser und nennen mir die angezeigte Spiel-ID um das Spiel auf dem Monitor zu verfolgen oder sage: 'Starte ein Blindspiel'.";
	}
	else if (phase === "name") {
		speechOutput = prefix + " Bitte sage mir deinen Namen und verwende dazu die Floskel: Mein Name ist";
		display = prefix + " Bitte sage mir deinen Namen und verwende dazu die Floskel: 'Mein Name ist ...'";
	}
	else if (phase === "play") {
		if (isLongHelp(session)) {
			speechOutput = prefix + " Du kannst einen Zug machen, indem du das Schlüsselwort Reihe und eine Nummer von eins bis sieben sagst, zum Beispiel Reihe vier. Mit dem Schlüsselwort Spielstärke kannst du die Spielstärke auf einen Wert von eins bis sieben ändern. Mit Neu Starten wird ein neues Spiel gestartet. Mit Stop beendest du den Vier Gewinnt Skill.";
			display = prefix + " Du kannst einen Zug machen, indem du das Schlüsselwort 'Reihe' und eine Nummer von 1-7 sagst, zum Beispiel 'Reihe 4'. Mit dem Schlüsselwort 'Spielstärke' kannst du die Spielstärke auf einen Wert von 1..7 ändern. Mit 'Neu Starten' wird ein neues Spiel gestartet. Mit 'Stop' beendest du den Vier-Gewinnt Skill.";
			// give the long version only once. 
			setShortHelp(session);
		}
		else {
			speechOutput = prefix + " Mit Hilfe bekommst du eine Liste der möglichen Kommandos.";
			display = prefix + " Mit 'Hilfe' bekommst du eine Liste der möglichen Kommandos.";
		}
	}
	else {
		speechOutput = " Ich befinde mich in einer unbekannten Phase und beende mich jetzt lieber, sorry.";
		display = " Ich befinde mich in einer unbekannten Phase und beende mich jetzt lieber, sorry.";
		response.tellWithCard(speechOutput, "Vier-Gewinnt Skill", display);
	    return;
	}
    response.askWithCard(speechOutput, "Vier-Gewinnt Skill", display);	
}



function execRespondWithDisplay(msg, session, response) {
	sendCommand(session, getSessionGameId(session), "getGameData", "", "", function callbackFunc(result) {
		var title = "Vier-Gewinnt-Brett";
        console.log("getGameData: " + result.code);
        if (result.code === "S_OK") {
        	var fieldText = createFieldText(result.field);
        	console.log("fieldText="+fieldText);
        	var directives = [
	        	{
		          "type": "Display.RenderTemplate",
		          "template": {
		            "type": "BodyTemplate1",
		            "title": title,
		            "textContent": {
		              "primaryText": {
		                "type": "RichText",
		                "text": "<font size = '2'>"+msg.display+"<br/>"
		                  + fieldText + "</font>"
		              }
		            },
		            "backButton": "HIDDEN"
		          }
		        }
	        ];
            speech.respondMsgWithDirectives(response, msg, directives);
        }
        else {
        	speech.respondMsg(response, msg);
        }
	});
}

function createFieldText(field) {
	var result = "";
//	result = result + addImage("space_3", 3);
	result = result + addImage("frameset_top", 7);
	result = result + "<br/>";
	for (var y = 0; y < 6; y++) {
//		result = result + addImage("space_3", 3);
		for (var x = 0; x < 7; x++) {
			var col = field[y][x];   // col = 0..4
			result = result + addImage("circle-"+col, 1);
		}
		result = result + "<br/>";
	}
	return result;
}

function addImage(imgName, size) {
	var result = "<img src='"+imgBaseUrl+imgName+".png' width='"+(size*imgBaseSize)+"' height='"+imgBaseSize+"'/>";
	return result;
}


function setConfirmation(newConfirmation, session)  {
	session.attributes.confirmation = newConfirmation;
}
function getConfirmation(session, defaultValue)  {
	if (!session || (!session.attributes) || (!session.attributes.confirmation)) {
		return defaultValue;
	}
	return session.attributes.confirmation;
}
function clearConfirmation(session)  {
	setConfirmation(null, session);
}

function setPhase(newPhase, session)  {
	session.attributes.phase = newPhase;
}
function isInPhase(comparePhase, session)  {
	return getPhaseFromSession(session, "?") === comparePhase;
}
function getPhaseFromSession(session, defaultValue)  {
	if (!session || (!session.attributes) || (!session.attributes.phase)) {
		return defaultValue;
	}
	return session.attributes.phase;
}

function setShortHelp(session)  {
	session.attributes.shortHelp = true;
}
function setLongHelp(session)  {
	session.attributes.shortHelp = false;
}
function isShortHelp(session)  {
	if (!session || (!session.attributes) || (!session.attributes.shortHelp)) {
		return false;
	}
	return session.attributes.shortHelp === true;
}
function isLongHelp(session)  {
	return !isShortHelp(session);
}



function getPlayerName(intent) {
	return getFromIntent(intent, "player_name", "?");
}

function getAILevel(intent) {
	return getFromIntent(intent, "ai_level", "?");
}

function getSlot(intent) {
	return getFromIntent(intent, "slot", "?");
}

function setSessionGameId(session, gameId) {
	session.attributes.gameId = gameId;
}
function getSessionGameId(session) {
	return session.attributes.gameId;
}

function setSessionPlayername(session, playername) {
	session.attributes.playername = playername;
}
function getSessionPlayername(session) {
	return session.attributes.playername;
}



function getGameId(intent) {
	return getGameIdLetter(intent, "?") + getGameIdNumber(intent, "?");
}


function getGameIdLetter(intent, defaultValue) {
	return getFromIntent(intent, "gameid_letter", defaultValue);
}

function getGameIdNumber(intent, defaultValue) {
	return getFromIntent(intent, "gameid_number", defaultValue);
}

function getFromIntent(intent, attribute_name, defaultValue) {
	var result = intent.slots[attribute_name];
	if (!result || !result.value) {
		return defaultValue;
	}
	return result.value;
}


function sendCommand(session, gameId, cmd, param1, param2, callback) {

	var result = "";
	
	var query = querystring.stringify({
		"gameId": gameId,
		"cmd": cmd,
		"param1": param1,
		"param2": param2
	});
    var url = getSessionEndpoint(session) + "?" + query;
    console.log('CALL: ' + url);
    
    var urlObj = URL.parse(url);
    var options = {
    		protocol: urlObj.protocol,
    		host: urlObj.hostname,
    	    port: urlObj.port,
    	    path: urlObj.path,
    		auth: authUsername+':'+authPassword
    };
    
    http.get(options, function (res) {
        var responseString = '';
        if (res.statusCode != 200) {
            console.log("ERROR HTTP STATUS " + res.statusCode);
            result = {code:"E_CONNECT", errmsg: "h.t.t.p. Status "+res.statusCode};
            callback(result);
        }
        res.on('data', function (data) {
        	responseString += data;
        });
        res.on('end', function () {
            console.log("get-end: " + responseString);
            var responseObject;
            try {
                responseObject = JSON.parse(responseString);
            } catch(e) {
                console.log("E_CONNECT INVALID JSON-FORMAT: " + e.message);
                responseObject = {
                		code: "E_CONNECT", errmsg: "Die Serverantwort ist nicht valide."
                };
            }
            callback(responseObject);
            
        });
    }).on('error', function (e) {
        console.log("E_CONNECT: " + e.message);
        result = {
        		code: "E_CONNECT", errmsg: e.message
        };
        callback(result);
    });
}


function sendDBCommand(session, cmd, param1, param2, callback) {

	var result = "";
	
	var query = querystring.stringify({
		"cmd": cmd,
		"param1": param1,
		"param2": param2
	});
    var url = dbEndpoint + "?" + query;
    console.log('CALL: ' + url);
    
    var urlObj = URL.parse(url);
    var options = {
    		protocol: urlObj.protocol,
    		host: urlObj.hostname,
    	    port: urlObj.port,
    	    path: urlObj.path,
    		auth: authUsername+':'+authPassword
    };
    
    http.get(options, function (res) {
        var responseString = '';
        if (res.statusCode != 200) {
            console.log("ERROR HTTP STATUS " + res.statusCode);
            result = {code:"E_CONNECT", errmsg: "h.t.t.p. Status "+res.statusCode};
            callback(result);
        }
        res.on('data', function (data) {
        	responseString += data;
        });
        res.on('end', function () {
            console.log("get-end: " + responseString);
            var responseObject;
            try {
                responseObject = JSON.parse(responseString);
            } catch(e) {
                console.log("E_CONNECT INVALID JSON-FORMAT: " + e.message);
                responseObject = {
                		code: "E_CONNECT", errmsg: "Die Serverantwort ist nicht valide."
                };
            }
            callback(responseObject);
            
        });
    }).on('error', function (e) {
        console.log("E_CONNECT: " + e.message);
        result = {
        		code: "E_CONNECT", errmsg: e.message
        };
        callback(result);
    });
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
    	var data = JSON.parse(dbUser.data);
        dbUser.data = data; 
        return true;
    } catch(e) {
    	return false;
    }
}

function saveUserData(session, response, callbackSuccess) {
	if (!hasUserDataChanged(session)) {
		callbackSuccess();
	}
	else {
		clearUserDataChanged(session);
		updateUserDataInDB();
		
	}
}

function updateUserDataInDB(session, response, callbackSuccess) {
	var userDataString = getMarshalledUserData(session);
	var userId = get
}

function getMarshalledUserData(session) {
	var data = getUserDataFromSession(session);
	if (!data) {
		return undefined;
	}
	var result = JSON.stringify(data);
	return result;
}


function setDBUserInSession(session, dbUser) {
	session.attributes.dbuser = dbUser;
}
function hasDBUserInSession(session)  {
	if (!session || (!session.attributes) || (!session.attributes.dbuser)) {
		return false;
	}
	return true;
}

function getDBUserFromSession(session)  {
	if (!session || (!session.attributes) || (!session.attributes.dbuser)) {
		return undefined;
	}
	return session.attributes.dbuser;
}

function getDBUserIdFromSession(session)  {
	if (!session || (!session.attributes) || (!session.attributes.dbuser) || (!session.attributes.dbuser.userId)) {
		return undefined;
	}
	return session.attributes.dbuser.userId;
}


function setGameIdInUserData(session, gameId) {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return false;
	}
	userData.gameId = gameId;
	userData.changed = true;
}

function getUserDataFromSession(session)  {
	if (!session || (!session.attributes) || (!session.attributes.dbuser) || (!session.attributes.dbuser.data)) {
		return undefined;
	}
	return session.attributes.dbuser.data;
}

function getPhaseFromUserData(session, defaultValue)  {
	var userData = getUserDataFromSession(session);
	if (!userData || (!userData.phase)) {
		return defaultValue;
	}
	return userData.phase;
}

function getAmzUserIdFromSession(session) {
	if (!session || (!session.user) || (!session.user.userId)) {
		return undefined;
	}
	return session.user.userId;
}


function hasUserDataChanged(session)  {
	var userData = getUserDataFromSession(session);
	if (!userData || (!userData.changed)) {
		return false;
	}
	return true;
}

function setUserDataChanged(session)  {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return;
	}
	userData.changed = true;
}

function clearUserDataChanged(session)  {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return;
	}
	delete userData.changed;
}


