/**
 * Diese Datei ist Teil des Alexa Skills Vier-Gewinnt.
 * Copyright (C) 2016-2017 Ferenc Hechler (github@fh.anderemails.de)
 *
 * Der Alexa Skills Rollenspiel Soloabenteuer ist Freie Software: 
 * Sie koennen es unter den Bedingungen
 * der GNU General Public License, wie von der Free Software Foundation,
 * Version 3 der Lizenz oder (nach Ihrer Wahl) jeder spaeteren
 * veroeffentlichten Version, weiterverbreiten und/oder modifizieren.
 *
 * Der Alexa Skills Vier-Gewinnt wird in der Hoffnung, 
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

var endpoint = process.env.ENDPOINT;            // 'https://calcbox.de/connfour/rest/c4'; 

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

ConnectFourSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("ConnectFourSkill onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
    clearSessionData(session);
};


ConnectFourSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
	doLaunch(session, response);
};


ConnectFourSkill.prototype.intentHandlers = {
		
    "NewGameIntent": function (intent, session, response) {
    	doNewGame(intent, session, response);
    },

    "PlayerMoveIntent": function (intent, session, response) {
    	doPlayerMove(intent, session, response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        clearSessionData(session);
        speech.goodbye(intent.name, "*", response);
    },

    
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



/* ============== */
/* ENTRY METHODEN */
/* ============== */


function doLaunch(session, response) {
	connect(session, response, function successFunc() {
		execDisplayField(session, response);
	});
}

function doNewGame(intent, session, response) {
	connect(session, response, function successFunc() {
		execDoNewGame(intent, session, response);
	});
}

function doPlayerMove(intent, session, response) {
	connect(session, response, function successFunc() {
		execDoMove(intent, session, response);
	});
}

/* ============= */
/* SEND METHODEN */
/* ============= */


function connect(session, response, successCallback) {
	if (isConnectedToGame(session)) {
		successCallback();
	}
	else {
		var amzUserId = getAmzUserIdFromSession(session);
		send(session, response, "", "connect", amzUserId, "", function callbackFunc(result) {
            console.log("Connectet with GameId: " + result.gameId);
        	setSessionGameId(session, result.gameId);
        	successCallback();
	    });
	}
}

function execDoNewGame(intent, session, response) {
	var gameId = getSessionGameId(session);
	send(session, response, gameId, "closeGame", "", "", function callbackFunc(result) {
    	clearSessionData(session);
    	doLaunch(session, response);
	});
}

function execDoMove(intent, session, response) {
	send(session, response, getSessionGameId(session), "doMove", getSlot(intent), "", function successFunc(result) {
	    if (result.code === "S_OK") {
	    	execDoAIMove(session, response);
	    }
	    else {
            execDisplayField(session, response);
	    }
	});
}

function execDoAIMove(session, response) {
	send(session, response, getSessionGameId(session), "doAIMove", "", "", function successFunc(result) {
	    execDisplayField(session, response);
	});
}


function execDisplayField(session, response) {
	var gameId = getSessionGameId(session);
	send(session, response, gameId, "getGameData", "", "", function callbackFunc(result) {
    	respondField(session, response, result);
    	speech.respondMsg(response, msg);
	});
}

/* ============= */
/* FIELD DISPLAY */
/* ============= */


function respondField(session, response, gameData) {
	var statusMsg = createStatusMsg(gameData.winner);
	var fieldText = createFieldText(gameData.field);
	console.log("fieldText="+fieldText);
	var directives = [
    	{
          "type": "Display.RenderTemplate",
          "template": {
            "type": "BodyTemplate1",
//            "title": "Vier-Gewinnt-Brett",
            "textContent": {
              "primaryText": {
                "type": "RichText",
                "text": "<font size = '2'>"+statusMsg.display+"<br/>"
                  + fieldText + "</font>"
              }
            },
            "backButton": "HIDDEN"
          }
        }
    ];
    speech.respondMsgWithDirectives(response, msg, directives);
}

function createStatusMsg(gameData) {
	var msg;
	if (gameData.winner == 1) {
    	msg = speech.createMsg("STATUS", "PLAYER_WINS");
	}
	else if (gameData.winner == 2) {
    	msg = speech.createMsg("STATUS", "AI_PLAYER_WINS");
	}
	else if (gameData.winner == -1) {
    	msg = speech.createMsg("STATUS", "DRAW");
	}
	else {
    	msg = speech.createMsg("STATUS", "MAKE_YOUR_MOVE");
	}
	return msg;
}

function createFieldText(field) {
	var result = "";
	result = result + addImage("frameset_top", 7);
	result = result + "<br/>";
	for (var y = 0; y < 6; y++) {
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


/* ============= */
/* INTENT-ACCESS */
/* ============= */


function getSlot(intent) {
	return getFromIntent(intent, "slot", "?");
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
		return undefined;
	}
	session.attributes.gameId = gameId;
}
function getSessionGameId(session) {
	if (!session || (!session.attributes)) {
		return undefined;
	}
	return session.attributes.gameId;
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


/* ========= */
/* REST CALL */
/* ========= */


function send(session, respond, gameId, cmd, param1, param2, successCallback) {
	sendCommand(session, gameId, cmd, param1, param2, function callbackFunc(result) {
		var code = ((!result) || (!result.code)) ? "?" : result.code;
		if (code.startsWith("S_")) {
			successCallback(result);
		}
		else {
			speech.respond("SEND_"+cmd, code, response);
		}
	});
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
        		code: "E_CONNECT", 
        		errmsg: e.message
        };
        callback(result);
    });
}


/* ===================== */
/* USER DB (deactivated) */
/* ===================== */

/*

var dbEndpoint = process.env.DBENDPOINT;        // 'https://calcbox.de/simdb/rest/db';   


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

*/


