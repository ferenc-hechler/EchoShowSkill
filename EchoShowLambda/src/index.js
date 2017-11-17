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

/**
 * App ID for the skill
 */
// Echo Show Skills
var APP_ID = "amzn1.ask.skill.46c8454a-d474-4e38-a75e-c6c8017b1fe1"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

// // SOLO
var endpoint = 'http://calcbox.de/echoshow/rest/echo';

var URL = require('url');
var authUsername = 'rest';
var authPassword = 'geheim';

// LOG environment variables
console.log("APP_ID="+APP_ID);
console.log("ENDPOINT="+endpoint);
console.log("AUTH_USERNAME="+authUsername);
console.log("AUTH_PASSWORD="+(authPassword.replace(/./g, '*')));


/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var speech = require('./Speech');
speech.init_messages("DE");

var http = require('http');
var querystring = require("querystring");



/**
 * EchoShowSkill is a child of AlexaSkill.
 */
var EchoShowSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
EchoShowSkill.prototype = Object.create(AlexaSkill.prototype);
EchoShowSkill.prototype.constructor = EchoShowSkill;

EchoShowSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
	console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
    clearSessionData(session);
    setPhase("init", session);
};

EchoShowSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
	console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
	return execReconnectGame(session, response);
};

EchoShowSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("EchoShowSkill onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
    clearSessionData(session);
};

EchoShowSkill.prototype.intentHandlers = {
		
    "AnswerIntent": execAnswerIntent,

    "AMAZON.StopIntent": function (intent, session, response, event, context) {
        clearSessionData(session);
    	speech.goodbye(intent.name, "*", response);
    },

    "AMAZON.HelpIntent": function (intent, session, response, event, context) {
    	setPhase("help", session);
    	
        var skillname = "Show Skill";
        var title = "Das ist der Titel";
        var speechOutput = "Das ist der Text. Der kann auch mal etwas länger werden.";
        var contentText = speechOutput;

        //check to see if the device we're working with supports display directives
        //enable the simulator if you're testing
        if(supportsDisplay(event)||isSimulator(event)) {
        	
          console.log("has display:"+ supportsDisplay(event));
          console.log("is simulator:"+isSimulator(event));
          var content = {
             "hasDisplaySpeechOutput" : speechOutput,
             "hasDisplayRepromptText" : contentText,
             "simpleCardTitle" : skillname,
             "simpleCardContent" : contentText,
             "bodyTemplateTitle" : title,
             "bodyTemplateContent" : contentText,
             "templateToken" : "factBodyTemplate",
             "askOrTell" : ":tell",
             "sessionAttributes": {}
          };
          renderTemplate(content, response, event, context);
          
        } else {
          // Just use a card if the device doesn't support a card.
          speech.tell(speechOutput, response);
        }
        
    },
    
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the EchoShowSkill skill.
    var echoShowSkill = new EchoShowSkill();
    echoShowSkill.execute(event, context);
};


function execReconnectGame(session, response) {
// DEBUG:
//	console.log("EXECRECONNECTGAME: "+JSON.stringify(session));    	
    console.log("reconnect");
	setPhase("init", session);
	speech.ask("Sage Hilfe um ein Display Template zu sehen.", response);
}



function execAnswerIntent(intent, session, response, event, context) {
	var answer = getAnswer(intent);
    console.log("answer: " + answer);
	if (isInPhase("init", session)) {
		var text = "Ich habe gehört "+answer;
    	setPhase("answer", session);
    	if (answer === "test") {
        	setPhase("test", session);
    	}
    	speech.ask(text, response);
	}		
    else if (isInPhase("answer", session)) {
		var text = "antwort ist "+answer;
        console.log("text: " + text);
    	setPhase("init", session);
    	speech.ask(text, response);
    }
    else {
		var text = "unbekannte phase "+getPhaseFromSession(session, "?");
        console.log("text: " + text);
    	setPhase("init", session);
    	speech.tell(text, response);
    }
}


function clearSessionData(session) {
	session.attributes = {};
}


function setPhase(newPhase, session)  {
	session.attributes.phase = newPhase;
}
function isInPhase(comparePhase, session)  {
	var phase = getPhaseFromSession(session, "?");
	return phase.startsWith(comparePhase);
}
function getPhaseFromSession(session, defaultValue)  {
	if (!session || (!session.attributes) || (!session.attributes.phase)) {
		return defaultValue;
	}
	return session.attributes.phase;
}

function getAnswer(intent) {
	return getFromIntent(intent, "answer", "?");
}

function getFromIntent(intent, attribute_name, defaultValue) {
	if (!intent.slots) {
		return defaultValue;
	}
	var result = intent.slots[attribute_name];
	if (!result || !result.value) {
		return defaultValue;
	}
	return result.value;
}

//==============================================================================
//=========================== Helper Functions  ================================
//==============================================================================

function supportsDisplay(event) {
  var hasDisplay =
    event.context &&
    event.context.System &&
    event.context.System.device &&
    event.context.System.device.supportedInterfaces &&
    event.context.System.device.supportedInterfaces.Display
  return hasDisplay;
}

function isSimulator(event) {
  var isSimulator = !event.context; //simulator doesn't send context
  return isSimulator;
}

function renderTemplate (content, response, event, context) {

//create a template for each screen you want to display.
//This example has one that I called "factBodyTemplate".
//define your templates using one of several built in Display Templates
//https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/display-interface-reference#display-template-reference


 switch(content.templateToken) {
     case "factBodyTemplate":
        // for reference, here's an example of the content object you'd
        // pass in for this template.
        //  var content = {
        //     "hasDisplaySpeechOutput" : "display "+speechOutput,
        //     "hasDisplayRepromptText" : randomFact,
        //     "simpleCardTitle" : this.t('SKILL_NAME'),
        //     "simpleCardContent" : randomFact,
        //     "bodyTemplateTitle" : this.t('GET_FACT_MESSAGE'),
        //     "bodyTemplateContent" : randomFact,
        //     "templateToken" : "factBodyTemplate",
        //     "sessionAttributes": {}
        //  };

         var response = {
           "version": "1.0",
           "response": {
             "directives": [
               {
                 "type": "Display.RenderTemplate",
                 "template": {
                   "type": "BodyTemplate1",
                   "title": content.bodyTemplateTitle,
                   "token": content.templateToken,
                   "textContent": {
                     "primaryText": {
                       "type": "RichText",
                       "text": "<font size = '5'>"+content.bodyTemplateContent+"</font> <font size = '3'> und nun in klein: "+content.bodyTemplateContent+"</font>"
                     }
                   },
                   "backButton": "HIDDEN"
                 }
               }
             ],
             "outputSpeech": {
               "type": "SSML",
               "ssml": "<speak>"+content.hasDisplaySpeechOutput+"</speak>"
             },
             "reprompt": {
               "outputSpeech": {
                 "type": "SSML",
                 "ssml": "<speak>"+content.hasDisplayRepromptText+"</speak>"
               }
             },
             "shouldEndSession": content.askOrTell==":tell",
             "card": {
               "type": "Simple",
               "title": content.simpleCardTitle,
               "content": content.simpleCardContent
             }
           },
           "sessionAttributes": content.sessionAttributes
         }
         context.succeed(response);
         break;

     default:
        speech.tell("Thanks for chatting, goodbye", response);
 	}

}


