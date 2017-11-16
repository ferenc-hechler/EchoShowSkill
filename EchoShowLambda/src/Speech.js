/**
 * Diese Datei ist Teil des Echo Show Skills.
 * Copyright (C) 2017 Ferenc Hechler (github@fh.anderemails.de)
 *
 * Der Echo Show Skills ist Freie Software: 
 * Sie koennen es unter den Bedingungen
 * der GNU General Public License, wie von der Free Software Foundation,
 * Version 3 der Lizenz oder (nach Ihrer Wahl) jeder spaeteren
 * veroeffentlichten Version, weiterverbreiten und/oder modifizieren.
 *
 * Der Echo Show Skills wird in der Hoffnung, 
 * dass es nuetzlich sein wird, aber
 * OHNE JEDE GEWAEHRLEISTUNG, bereitgestellt; sogar ohne die implizite
 * Gewaehrleistung der MARKTFAEHIGKEIT oder EIGNUNG FUER EINEN BESTIMMTEN ZWECK.
 * Siehe die GNU General Public License fuer weitere Details.
 * 
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
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
					
				"LAUNCH": {
					S_OK: { 
						speechOut: "Erfolgreich gestartetet.",
						display:   "Erfolgreich gestartetet." 
					},
					E_CONNECT: { 
						speechOut: "Es gibt Verbindungsprobleme zum Server: %1 .",
						display:   "Es gibt Verbindungsprobleme zum Server: '%1'." 
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
					E_UNKNOWN_GAMEID: { 
						speechOut: "Dein Spiel wurde beendet. Eventuell gab es ein Timeout nach einer Stunde.",
						display:   "Dein Spiel wurde beendet. Eventuell gab es ein Timeout nach einer Stunde." 
					}
				}
			}
			
		}
		
	}
}

function respond(intentName, resultCode, response, param1, param2, param3) {
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
	msg = setParams(msg, param1, param2, param3);
	respondMsg(msg, response)
}

function respondMsg(msg, response) {
	if (msg.speechOut) {
		response.askWithCard(msg.speechOut, "Show Skill", msg.display);
	}
	else {
		response.askWithCard(msg, "Show Skill", msg);
	}
}

function addMsg(prefixMsg, intentName, resultCode, param1, param2, param3) {
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
	msg = setParams(msg, param1, param2, param3);
	return concatMsgs(prefixMsg, msg);
}

function concatMsgs(msg1, msg2) {
	if (msg1.speechOut) {
		if (msg2.speechOut) {
			return {
				speechOut: msg1.speechOut + " " + msg2.speechOut,
				display: msg1.display + " " + msg2.display
			}
		}
		else {
			return {
				speechOut: msg1.speechOut + " " + msg2,
				display: msg1.display + " " + msg2
			}
		}
	}
	else {
		if (msg2.speechOut) {
			return {
				speechOut: msg1 + " " + msg2.speechOut,
				display: msg1 + " " + msg2.display
			}
		}
		else {
			return msg1 + msg2;
		}
	}
}

function getMsg(intentName, resultCode, param1, param2, param3) {
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
	msg = setParams(msg, param1, param2, param3);
	return msg;
}

function hasMsg(intentName, resultCode) {
	if (!messages[intentName]) {
		return false;
	}
	if (!messages[intentName][resultCode]) {
		return false;
	}
	return true;
}

function goodbye(intentName, resultCode, response, param1, param2, param3) {
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
	msg = setParams(msg, param1, param2, param3);
	goodbyeMsg(msg, response);
}

function goodbyeMsg(msg, response) {
	response.tellWithCard(msg.speechOut, "Show Skill", msg.display);
}

function setParams(msg, param1, param2, param3) {
	var result = msg;
	if (msg) {
		result = replace(result, "%1", param1);
		result = replace(result, "%2", param2);
		result = replace(result, "%3", param3);
	}
	return result;
}

function replace(msg, varName, param) {
	if (!param) {
		return msg;
	}
	if (param.speechOut) {
		return {
			speechOut: msg.speechOut.replace(varName, param.speechOut).trim(),
			display:   msg.display.replace(varName, param.display).trim()
		}
	}
	return {
		speechOut: msg.speechOut.replace(varName, param).trim(),
		display:   msg.display.replace(varName, param).trim()
	}
}


function ask(msg, response) {
	var speakMsg = makeSpeakable(msg);
	var readMsg = makeReadable(msg);
	response.askWithCard(speakMsg, "Show Skill", "Show Skill", readMsg);
}

function tell(msg, response) {
	var speakMsg = makeSpeakable(msg);
	var readMsg = makeReadable(msg);
	response.tellWithCard(speakMsg, "Show Skill", "Show Skill", readMsg);
}


var RX_AUDIO = /AUDIO\(([^\)|]+)([|][^\)]+)?\)/g;
var RX_PHONEM = /PHONEM\(([^=]+)[=]([^\)]+)\)/g;
var RX_VOICE = /VOICE\(([^\)|]+)[|]([^\)]+)?\)/g;

function makeSpeakable(msg) {
	var result = msg.replace(/'|"|„|“/g, "");
	var phonemResult = result.replace(RX_PHONEM, "<phoneme alphabet=\"x-sampa\" ph=\"$2\">$1</phoneme>");
	var audioResult = phonemResult.replace(RX_AUDIO, "<audio src=\"$1\" />");
	var voiceResult = audioResult.replace(RX_VOICE, "<p><prosody $1>$2</prosody></p>");
//    console.log("SPEAK: " + voiceResult);
	if (voiceResult !== result) {
		voiceResult = voiceResult.replace(/[&]QUOT[;]/g, "\"");
		voiceResult = voiceResult.replace(/[*]( [*]){2,}/g, "<break time=\"1s\"/>");
		voiceResult = "<speak>" + voiceResult + "</speak>";
//	    console.log("SPEAK2: " + voiceResult);
		result = {
				type: "SSML",
				speech: voiceResult
		};
	}
	return result; 
}

function makeReadable(msg) {
	var result = msg.replace(RX_PHONEM, "$1");
	result = result.replace(RX_VOICE, "$2");
	return result; 
}

module.exports = {init_messages, respond, goodbye, ask, tell, addMsg, respondMsg};
