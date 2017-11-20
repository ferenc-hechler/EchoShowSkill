/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';

var messages;

function init_messages(language) {

	if (!messages) {
		if (!language) {
			language = "DE";
		}
		if (language === "DE") {

			messages = {
					
				SEND_getOrCreateUserByAppAndName: {
					E_DB_ERROR: {
						speechOut: "Bei der Abfrage der Benutzerdatenbank ist ein Fehler aufgetreten.",
						display: "Bei der Abfrage der Benutzerdatenbank ist ein Fehler aufgetreten."
					}
				},
				
				SEND_createSessionlessGame: {
					S_OK: { 
						speechOut: "Blindspiel wird gestartet, sage mir jetzt in wleche Reihe du wirfst",
						display :  "Blindspiel wird gestartet, sage mir jetzt in wleche Reihe du wirfst."
					}
				},
				
				INTERN: {
					NO_AMZ_USERID: {
						speechOut: "Der Request enthält keine User-ID.",
						display: "Der Request enthält keine User-ID."
					},
					INVALID_USERDATA: {
						speechOut: "Die Benutzerdaten sind nicht lesbar.",
						display: "Die Benutzerdaten sind nicht lesbar."
					},
					YOUR_MOVE: {
						speechOut: "In welche Reihe wirfst Du?",
						display: "In welche Reihe wirfst Du?"
					},
					WELCOME: {
						speechOut: "Willkommen zum Vier-Gewinnt Skill mit Anzeige Du beginnst. In welche Reihe wirfst Du?",
						display: "In welche Reihe wirfst Du?"
					}					
				},
				
				ConnectGameIntent: {
					S_OK: { 
						speechOut: "Erfolgreich mit Spiel Verbunden, sage mir jetzt Deinen Namen und verwende dabei die Floskel: Mein Name ist",
						display:   "Erfolgreich mit Spiel Verbunden, sage mir jetzt Deinen Namen und verwende dabei die Floskel: 'Mein Name ist ...''."
					},
					E_UNKNOWN_GAMEID: { 
						speechOut: "Die genannte Spiel Ei Di ist nicht bekannt, bitte versuche es noch einmal.",
						display:   "Die genannte Spiel-ID ist nicht bekannt, bitte versuche es noch einmal." 
					}
				},
				
				BlindGameIntent: {
					S_OK: { 
						speechOut: "Blindspiel wird gestartet, sage mir jetzt in wleche Reihe du wirfst",
						display :  "Blindspiel wird gestartet, sage mir jetzt in wleche Reihe du wirfst."
					},
					E_UNKNOWN_GAMEID: { 
						speechOut: "Es gab ein Problem beim Erstellen der Spiel Ei Di, bitte versuche es noch einmal.",
						display:   "Es gab ein Problem beim Erstellen der Spiel-ID, bitte versuche es noch einmal." 
					}
				},
	
				SetPlayerNameIntent: {
					S_OK: { 
						speechOut: "Hallo %1, mache Deinen Zug.",
						display :  "Hallo %1, mache Deinen Zug."
					}
				},
				
				PlayerMoveIntent: {
					S_PLAYER_WINS: { 
						speechOut: "Herzlichen Glückwunsch, du hast gewonnen.",
						display :  "Herzlichen Glückwunsch, du hast gewonnen."
					},
					S_DRAW: { 
						speechOut: "Das Spiel endet unentschieden.",
						display :  "Das Spiel endet unentschieden."
					},
					S_OK: { 
						speechOut: "Ich werfe in Reihe %1.",
						display :  "Ich werfe in Reihe %1."
					},
					S_AI_PLAYER_WINS: { 
						speechOut: "Ich werfe in Reihe %1 und gewinne.",
						display :  "Ich werfe in Reihe %1 und gewinne."
					},
					S_AI_DRAW: { 
						speechOut: "Ich werfe in Reihe %1 und es ist unentschieden.",
						display :  "Ich werfe in Reihe %1 und es ist unentschieden."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Ich habe die Reihe nicht verstanden. Sage eine Zahl von eins bis sieben.",
						display :  "Ich habe die Reihe nicht verstanden. Sage eine Zahl von 1-7."
					},
					E_INVALID_MOVE: {
						speechOut: "In diese Reihe kann kein Stein mehr geworfen werden",
						display :  "In diese Reihe kann kein Stein mehr geworfen werden."
					},
					E_GAME_FINISHED: { 
						speechOut: "Das Spiel ist zu ende. Um ein neues Spiel zu starten sage: Neues Spiel.",
						display :  "Das Spiel ist zu ende. Um ein neues Spiel zu starten sage: 'Neues Spiel'"
					}

				},
				
				SetAILevelIntent: {
					S_OK: { 
						speechOut: "Die Spielstärke wurde auf %1 gesetzt.",
						display :  "Die Spielstärke wurde auf %1 gesetzt."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Ich habe die Spielstärke nicht verstanden. Sage eine Zahl von eins bis sieben.",
						display :  "Ich habe die Spielstärke nicht verstanden. Sage eine Zahl von 1-7."
					},
				}, 
				
				GetAILevelIntent: {
					S_OK: { 
						speechOut: "Die Spielstärke steht auf %1.",
						display :  "Die Spielstärke steht auf %1."
					}
				},
				
			    "AMAZON.StartOverIntent": {
			    	"CONFIRM": {
				    	speechOut: "Bitte bestätige mit ja, dass du ein neues Spiel starten möchtest.", 
				    	display :  "Bitte bestätige mit 'JA', dass du ein neues Spiel starten möchtest."
			    	},
			    	"S_OK": {
				    	speechOut: "Neues Spiel, neues Glück.", 
				    	display :  "Neues Spiel, neues Glück."
			    	}
			    },
			    
			    "AMAZON.StopIntent": {
			    	"CONFIRM": {
				    	speechOut: "Bitte bestätige mit ja, dass du das Spiel beenden möchtest.", 
				    	display :  "Bitte bestätige mit ja, dass du das Spiel beenden möchtest."
			    	},
			    	"*": {
			    		speechOut: "Auf wiederhören, bis zum nächsten Mal.", 
			    		display :  "Auf wiederhören, bis zum nächsten Mal."
			    	}
			    },
			    
				Generic: {
					E_UNKNOWN_ERROR: {
						speechOut: "Es ist ein unerwarteter Fehler aufgetreten.",
						display: "Es ist ein unerwarteter Fehler aufgetreten.",
					},
					E_CONNECT: { 
						speechOut: "Es gibt Verbindungsprobleme zum Server.",
						display:   "Es gibt Verbindungsprobleme zum Server." 
					}

				}
			}
			
		}
		
	}
}

function respond(intentName, resultCode, response, param1) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = {
				speechOut: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode,
				display: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode
		}
	}
	msg = setParams(msg, param1);
	response.askWithCard(msg.speechOut, "Vier-Gewinnt Skill", msg.display);
}

function createMsg(intentName, resultCode, param1) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = {
				speechOut: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode,
				display: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode
		}
	}
	msg = setParams(msg, param1);
	return msg;
}

function respondMsg(response, msg) {
	response.askWithCard(msg.speechOut, "Vier-Gewinnt Skill", msg.display);
}

function respondMsgWithDirectives(response, msg, directives) {
	response.askWithDirectives(msg.speechOut, "Vier-Gewinnt Skill", msg.display, undefined, directives);
}


function goodbye(intentName, resultCode, response, param1) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = {
				speechOut: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode,
				display: "Sorry, Es fehlt die Sprachausgabe für Intent "+intentName+" mit dem Code "+resultCode
		}
	}
	msg = setParams(msg, param1);
	response.tellWithCard(msg.speechOut, "Vier-Gewinnt Skill", msg.display);
}

function setParams(msg, param1) {
	if (!param1) {
		return msg;
	}
	var result = {
			speechOut: msg.speechOut.replace("%1", param1),
			display:   msg.display.replace("%1", param1)
	}
	return result;
}


module.exports = {init_messages, respond, createMsg, respondMsg, respondMsgWithDirectives, goodbye};
