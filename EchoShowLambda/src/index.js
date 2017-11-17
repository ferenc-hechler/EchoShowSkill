/**
    Copyright 2016 Ferenc Hechler
*/

/**
 * This example shows how to link your amazon echo to an WebSite as a display, without any input possibility.
 * This skill needs the rest service alexalink to manage the actions.
 *
 * Examples:
 *  open a browser showing the link-page https://calcbox.de/alexalink
 *  User:  "Alexa start fourwins"
 *  Alexa: "Please say the Alexa-Link-Code you can see"
 *  User:  "E37"
 *  Alexa: "Established connection to your display, please tell me your name"
 *  User:  "feri"
 *  Alexa: "Hello feri, I open the game with a move to slot 3"
 *  User:  "I select slot 5"
 *  Alexa: ...
 *  
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.46c8454a-d474-4e38-a75e-c6c8017b1fe1"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

var endpoint = 'http://calcbox.de/conn4/rest';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var speech = require('./Speech');
speech.init_messages("DE");

var http = require('http');




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
    setPhase("init", session);
};

ConnectFourSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("ConnectFourSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Willkommen zum Vier Gewinnt Spiel. Zuerst musst du eine Verbindung mit der Webseite Kalk Box Punkt D E aufbauen, damit du das Spiel auf deinem Monitor mitverfolgen kannst. Um ein Spiel ohne Monitor zu starten sage: Starte ein Blindspiel.";
    var repromptText = "Bitte sage mir die Spiel Ei Di, die du auf der Webseite Kalk Box Punkt D E siehst. Verwende dazu die folgende Floskel: Meine Spiel Ei Di ist";
    var display = "Willkommen zum Vier Gewinnt Spiel. Zuerst musst Du eine Verbindung mit der Webseite http://calcbox.de/conn4 aufbauen, damit Du das Spiel auf dem Monitor mitverfolgen kannst. Um ein Spiel ohne Monitor zu starten sage: 'Starte ein Blindspiel'.";
    response.askWithCard(speechOutput, repromptText, "Vier-Gewinnt Skill", display);
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
            	setPhase("name", session);
            }
            speech.respond(intent.name, result.code, response);
        });
    },
    
    "BlindGameIntent": function (intent, session, response) {
    	console.log(intent);
    	if (!checkPhase("init", session, response)) {
    		return;
    	}
    	sendCommand(session, "", "createSessionlessGame", "", "", function callbackFunc(result) {
            console.log(intent.name+": sessionId: " + session.sessionId+", res: "+result.code);
            if (result.code === "S_OK") {
	            console.log("Start BlindGame with GameId: " + result.gameId);
	            setSessionGameId(session, result.gameId);
            	setPhase("name", session);
            }
            speech.respond(intent.name, result.code, response);
        });
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
                    	console.log("### "+intent.name +"/"+ result2.code +"/"+ response +"/"+ result2.slot);
                    	speech.respond(intent.name, result2.code, response, result2.slot);
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
	
    var queryString = '?gameId=' + gameId + '&cmd=' + cmd+ '&param1=' + param1+ '&param2=' + param2; 
    var url = endpoint + queryString;
    
    console.log('CALL: ' + url);
    http.get(url, function (res) {
        var responseString = '';
        if (res.statusCode != 200) {
            result = {"speechOut": "Verbindungsproblem, H T T P Status "+res.statusCode, "display": "Verbindungsproblem, HTTP Status "+res.statusCode};
            callback(result);
        }
        res.on('data', function (data) {
        	responseString += data;
        });
        res.on('end', function () {
            console.log("get-end: " + responseString);
            var responseObject = JSON.parse(responseString);
            callback(responseObject);
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        result = {"speechOut": "Ausnahmefehler", "display": "Ausnahmefehler: " + e.message};
        callback(result);
    });
}




