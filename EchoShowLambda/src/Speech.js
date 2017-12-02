/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

 
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
				
				SEND_connect: {
					S_OK: { 
						speechOut: "Du bist am Zug. In welche Reihe wirfst Du?",
						display :  "Du bist am Zug. In welche Reihe wirfst Du?"
					}
				},
				
				SEND_doMove: {
					"E_INVALID_PARAMETER": { 
						speechOut: "Bitte wiederhole die Reihe, ich habe das nicht richtig verstanden.",
						display :  "Bitte wiederhole die Reihe, ich habe das nicht richtig verstanden."
					},
					"E_INVALID_RANGE": { 
						speechOut: "Bitte wiederhole die Reihe, sie muss einen Wert von 1 bis 7 haben.",
						display :  "Bitte wiederhole die Reihe, sie muss einen Wert von 1 bis 7 haben."
					}
				},
				
				SEND_setAILevel: {
					"E_INVALID_PARAMETER": { 
						speechOut: "Ich habe die Spielstärke nicht richtig verstanden. Du bist am Zug.",
						display :  "Ich habe die Spielstärke nicht richtig verstanden. Du bist am Zug."
					},
					"E_INVALID_RANGE": { 
						speechOut: "Die Spielstärke muss eine Zahl von 1 bis 7 sein. Du bist am Zug.",
						display :  "Die Spielstärke muss eine Zahl von 1 bis 7 sein. Du bist am Zug."
					}
				},
				
				TEXT: {
					HELP: {
						title:     	"Vier in einer Reihe Schnellhilfe",
						richText:   "Hier die Kurzhilfe: <br/><br/>" +
									"Du kannst eines der Kommandos <br/>" +
									" * 'Hilfe', <br/>" +
									" * 'Starte ein neues Spiel', <br/>" +
									" * 'Ich werfe in Reihe ...', <br/>" +
									" * 'Du darfst anfangen', <br/>" +
									" * 'Setze die Spielstärke auf ...' oder <br/>" +
									" * 'Stop' verwenden. <br/><br/>" + 
									"Möchtest Du eine ausführliche Anleitung?",
						speechOut: "Hier die Kurzhilfe: " +
						   			"Du kannst eines der Kommandos 'Hilfe', 'Starte ein neues Spiel', 'Ich werfe in Reihe', 'Du darfst anfangen', 'Setze die Spielstärke auf' oder Stop verwenden. " + 
						   			"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Hier die Kurzhilfe: " +
									"Du kannst eines der Kommandos 'Hilfe', 'Starte ein neues Spiel', 'Ich werfe in Reihe ...', 'Du darfst anfangen', 'Setze die Spielstärke auf ...' oder 'Stop' verwenden. " + 
									"Möchtest Du eine ausführliche Anleitung?"
					},
					
					ActionHELP: {
						title:     	"Vier in einer Reihe Hilfe",
						richText:   "<font size='5'>Wähle ein Thema:<br/>" +
									"<br/>" +
									"<action token='ActionHELP_REGELN'>Regeln</action><br/>" +
									"<action token='ActionHELP_SPRACHSTEUERUNG'>Sprachsteuerung</action><br/>" +
									"<action token='ActionHELP_KOMMANDOS'>Kommandos</action><br/>" +
									"<action token='ActionHELP_WEITERES'>Weiteres</action><br/>" +
									"<br/>" +
									"Zurück zum <action token='ActionHOME'>Spiel</action></font>",
						speechOut: ""
					},
					ActionHELP_REGELN: {
						title:     	"Vier in einer Reihe Regeln",
						richText:   "<font size='3'>" +
									"Beim Spiel Vier in einer Reihe spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								    "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								    "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden.<br/></font>" +
									"<font size='2'><br/>" +
									"Zurück zur <action token='ActionHELP'>Themenwahl</action> oder zum <action token='ActionHOME'>Spiel</action></font>",
						speechOut: ""
					},
					ActionHELP_SPRACHSTEUERUNG: {
						title:     "Vier in einer Reihe Sprachsteuerung",
						richText:  "<font size='2'>" +
									"Zurück zur <action token='ActionHELP'>Themenwahl</action> oder zum <action token='ActionHOME'>Spiel</action></font><br/>" +
									"<br/>" +
								    "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								    "Sage dazu entweder 'Ich werfe in Reihe ...' oder 'Du darfst anfangen'. " +
								    "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								    "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe ...' sagen. " +
								    "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								    "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								    "Also  zum Beispiel 'Alexa, Reihe ...'. " +
								    "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit 'Alexa starte Vier in einer Reihe' zuerst wieder gestartet werden. " +
								    "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								    "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet.",
						speechOut: ""
					},
					ActionHELP_KOMMANDOS: {
						title:     "Vier in einer Reihe Sprachkommandos",
						richText:  "<font size='3'>" +
								   "'Hilfe': Starte die Hilfe.<br/>" +
								   "'Starte ein neues Spiel': bricht das aktuelle Spiel ab und startet ein neues.<br/>" +
								   "'Setze die Spielstärke auf ...': ändert die Spielstärke (AI) von Alexa. 1 ist am leichtesten und 7 am schwersten.<br/>" +
								   "'Du darfst anfangen': lässt Alexa den ersten Zug machen.<br/></font>" +
									"<font size='2'><br/>" +
									"Zurück zur <action token='ActionHELP'>Themenwahl</action> oder zum <action token='ActionHOME'>Spiel</action></font>",
						speechOut: ""
					},
					ActionHELP_WEITERES: {
						title:     "Vier in einer Reihe Regeln",
						richText:  "<font size='3'>" +
								   "Links oben in der Anzeige wird die aktulle Zugzahl und die Spielstärke (AI) angezeigt.<br/>" +
								   "<br/>" +
								   "Ein Hinweis noch zum Schluss: <br/>" +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com.<br/></font>" +
									"<font size='2'><br/>" +
									"Zurück zur <action token='ActionHELP'>Themenwahl</action> oder zum <action token='ActionHOME'>Spiel</action></font>",
						speechOut: ""
					},
					
					INTRO: {
						title:     	"Willkommen zum Spiel 'Vier in einer Reihe'",
						richText:   "Das Spiel kann mit den folgenden Kommandos gesteuert werden: <br/><br/>" +
									" * 'Hilfe', <br/>" +
									" * 'Starte ein neues Spiel', <br/>" +
									" * 'Ich werfe in Reihe ...', <br/>" +
									" * 'Du darfst anfangen', <br/>" +
									" * 'Setze die Spielstärke auf ...' oder <br/>" +
									" * 'Stop'. <br/><br/>" + 
									"Möchtest Du eine ausführliche Anleitung?",
						speechOut: "Willkommen zum Spiel Vier in einer Reihe: " +
									"Das Spiel kann mit folgenden Kommandos gesteuert werden: 'Hilfe', 'Starte ein neues Spiel', 'Ich werfe in Reihe', 'Du darfst anfangen', 'Setze die Spielstärke auf' oder 'Stop'. " + 
									"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Willkommen zum Spiel 'Vier in einer Reihe': " +
									"Das Spiel kann mit folgenden Kommandos gesteuert werden: 'Hilfe', 'Starte ein neues Spiel', 'Ich werfe in Reihe ...', 'Du darfst anfangen', 'Setze die Spielstärke auf ...' oder 'Stop'. " + 
									"Möchtest Du eine ausführliche Anleitung?"
					},
					
					WELCOME: {
						title:     	"Willkommen zum Spiel 'Vier in einer Reihe'",
						richText:   "Das Spiel kann mit den folgenden Kommandos gesteuert werden: <br/><br/>" +
									" * 'Hilfe', <br/>" +
									" * 'Starte ein neues Spiel', <br/>" +
									" * 'Ich werfe in Reihe ...', <br/>" +
									" * 'Du darfst anfangen', <br/>" +
									" * 'Setze die Spielstärke auf ...' oder <br/>" +
									" * 'Stop'. <br/><br/>" + 
									"Möchtest Du eine ausführliche Anleitung?",
						speechOut: "Willkommen zum Spiel Vier in einer Reihe: " +
									"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Willkommen zum Spiel 'Vier in einer Reihe': " +
									"Möchtest Du eine ausführliche Anleitung?"
					},
					
					HELP_REGELN: {
						title:     "Vier in einer Reihe Hilfe",
						richText:  "Zuerst die Regeln: <br/>" +
								   "Beim Spiel Vier in einer Reihe spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. <br/><br/>" +
								   
								   "Jetzt zur Sprachsteuerung: <br/>" +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder 'Ich werfe in Reihe ...' oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe ...' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								   "Also  zum Beispiel 'Alexa, Reihe ...'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit 'Alexa starte Vier in einer Reihe' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. <br/><br/>" +
								   
								   "Und nun zu den weiteren Kommandos: <br/>" +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfetext anzeigen lassen. <br/>" +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. <br/>" +
								   "Mit dem Kommando 'Setze die Spielstärke auf ...' kannst Du die Spielstärke von Alexa ändern. 1 ist am leichtesten und 7 am schwersten. <br/><br/>" +
								   
								   "Ein Hinweis noch zum Schluss: <br/>" +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. <br/><br/>" +
								   
								   "Soll ich den Text nochmal wiederholen?",
						speechOut: "Zuerst die Regeln: " +
								   "Beim Spiel Vier in einer Reihe spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder: 'Ich werfe in Reihe punkt punkt punkt' oder: 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe punkt punkt punkt' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								   "Also zum Beispiel: 'Alexa, Reihe punkt punkt punkt'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit: 'Alexa starte Vier in einer Reihe' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfe Text anzeigen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf punkt punkt punkt' kannst Du die Spielstärke von Alexa ändern. 1 ist dabei am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?",
								   
						display:   "Zuerst die Regeln: " +
								   "Beim Spiel Vier in einer Reihe spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder 'Ich werfe in Reihe ...' oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe ...' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								   "Also  zum Beispiel 'Alexa, Reihe ...'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit 'Alexa starte Vier in einer Reihe' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfetext anzeigen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf ...' kannst Du die Spielstärke von Alexa ändern. 1 ist am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?"
					},
					HELP_REGELN_NOGUI: {
						speechOut: "Zuerst die Regeln: " +
								   "Beim Spiel Vier in einer Reihe spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder: 'Ich werfe in Reihe punkt punkt punkt' oder: 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe punkt punkt punkt' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort. " +
								   "Das macht aber nichts, Du kannst das Spiel fortsetzen indem Du den Skill neu startest mit 'Alexa starte Vier in einer Reihe'. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfe Text vorlesen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf punkt punkt punkt' kannst Du die Spielstärke von Alexa ändern. 1 ist dabei am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?",
								   
						display:   "Zuerst die Regeln: " +
								   "Beim Spiel Vier in einer Reihe spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder 'Ich werfe in Reihe ...' oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe ...' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort. " +
								   "Das macht aber nichts, Du kannst das Spiel fortsetzen indem Du den Skill neu startest mit 'Alexa starte Vier in einer Reihe'. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfetext vorlesen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf ...' kannst Du die Spielstärke von Alexa ändern. 1 ist am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?"
					},
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
					AI_LEVEL_CHANGED: {
						speechOut: "Die Spielstärke wurde auf %1 gesetzt. In welche Reihe wirfst Du?",
						display: "Die Spielstärke wurde auf %1 gesetzt. In welche Reihe wirfst Du?"
					},
					NEW_GAME_STARTED: {
						speechOut: "Es wurde ein neues Spiel gestartet. In welche Reihe wirfst Du?",
						display: "Es wurde ein neues Spiel gestartet. In welche Reihe wirfst Du?"
					},
					GAME_CONTINUED: {
						speechOut: "Dein letztes Spiel wird fortgesetzt, in welche Reihe wirfst Du?",
						display: "Dein letztes Spiel wird fortgesetzt, in welche Reihe wirfst Du?"
					},
					HELP: {
						speechOut: "Hier die Kurzhilfe: " +
						   			"Du kannst eines der Kommandos 'Hilfe', 'Starte ein neues Spiel', 'Ich werfe in Reihe', 'Du darfst Anfangen', 'Setze die Spielstärke auf' oder 'Stop' verwenden. " + 
						   			"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Hier die Kurzhilfe: " +
									"Du kannst eines der Kommandos 'Hilfe', 'Starte ein neues Spiel', 'Ich werfe in Reihe', 'Du darfst Anfangen', 'Setze die Spielstärke auf' oder 'Stop' verwenden. " + 
									"Möchtest Du eine ausführliche Anleitung?",
					},
					INTRO: {
						speechOut: 	"Willkommen zum Vier in einer Reihe Skill. Möchtest Du eine Einleitung zur Verwendung dieses Skills bekommen?",
						display: 	"Möchtest Du eine Einleitung zur Verwendung dieses Skills bekommen?"
					},
					HELP_REGELN: {
						speechOut: "Zuerst die Regeln: " +
								   "Beim Spiel Vier in einer Reihe spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder: 'Ich werfe in Reihe punkt punkt punkt' oder: 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe punkt punkt punkt' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								   "Also zum Beispiel: 'Alexa, Reihe punkt punkt punkt'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit: 'Alexa starte Vier in einer Reihe' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfe Text anzeigen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf punkt punkt punkt' kannst Du die Spielstärke von Alexa ändern. 1 ist dabei am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?",
								   
						display:   "Zuerst die Regeln: " +
								   "Beim Spiel Vier in einer Reihe spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder 'Ich werfe in Reihe ...' oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe ...' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								   "Also  zum Beispiel 'Alexa, Reihe ...'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit 'Alexa starte Vier in einer Reihe' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfetext anzeigen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf ...' kannst Du die Spielstärke von Alexa ändern. 1 ist am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?",
					},
					DID_NOT_UNDERSTAND: {
						speechOut: "Ich verstehe Deine Antwort nicht, Sage Hilfe um die Steuerung dieses Skills kennen zu lernen.",
						display: "Sage 'Hilfe' um eine Hilfe zu erhalten. "
					},
					CHANGE_SETTINGS: {
						speechOut: "Du kannst die Spielstärke mit dem Kommando 'Setze die Spielstärke auf' und der Angabe eines Wertes von 1 bis 7 ändern.",
						display: "Sage 'Setze die Spielstärke auf ... (1..7)'. "
					},
					AI_STARTS_NOT_ALLOWED: {
						speechOut: "Die Seiten können nur vor dem ersten Zug gewechselt werden. In welche Reihe wirfst Du?",
						display: "Die Seiten können nur vor dem ersten Zug gewechselt werden. In welche Reihe wirfst Du?"
					},
					NOT_YES_NO_ANSWER: {
						speechOut: "Das war keine Antwort auf meine Frage, ich werte das jetzt mal als 'Nein'. In welche Reihe wirfst Du?",
						display: "Das war keine Antwort auf meine Frage, ich werte das jetzt mal als 'Nein'. In welche Reihe wirfst Du?"
					},
					NO_QUESTION_ASKED: {
						speechOut: "Ich hatte keine Ja/Nein Frage gestellt. In welche Reihe wirfst Du?",
						display: "Ich hatte keine Ja/Nein Frage gestellt. In welche Reihe wirfst Du?"
					}
				},
				
				STATUS: {
					PLAYER_WINS: { 
						speechOut: "Herzlichen Glückwunsch, Du hast gewonnen.",
						display :  "Herzlichen Glückwunsch, Du hast gewonnen."
					},
					DRAW: { 
						speechOut: "Das Spiel endet unentschieden.",
						display :  "Das Spiel endet unentschieden."
					},
					AI_PLAYER_WINS: { 
						speechOut: "Ich habe gewonnen.",
						display :  "Ich habe gewonnen."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "In welche Reihe wirfst Du?",
						display :  "In welche Reihe wirfst Du?"
					}
				},
				
				STATUS_AIMOVE: {
					PLAYER_WINS: { 
						speechOut: "Herzlichen Glückwunsch, Du hast gewonnen.",
						display :  "Herzlichen Glückwunsch, Du hast gewonnen."
					},
					DRAW: { 
						speechOut: "Ich werfe in Reihe %1, das Spiel endet unentschieden.",
						display :  "Ich werfe in Reihe %1, das Spiel endet unentschieden."
					},
					AI_PLAYER_WINS: { 
						speechOut: "Ich werfe in Reihe %1 und habe gewonnen.",
						display :  "Ich werfe in Reihe %1 und habe gewonnen."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "Ich werfe in Reihe %1, in welche Reihe wirfst Du?",
						display :  "Ich werfe in Reihe %1, in welche Reihe wirfst Du?"
					}
				},
				
				HINT: {
					PLAYER_WINS: { 
						speechOut: "starte ein neues Spiel.",
						display :  "starte ein neues Spiel."
					},
					DRAW: { 
						speechOut: "starte ein neues Spiel.",
						display :  "starte ein neues Spiel."
					},
					AI_PLAYER_WINS: { 
						speechOut: "starte ein neues Spiel.",
						display :  "starte ein neues Spiel."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "ich werfe in Reihe ...",
						display :  "ich werfe in Reihe ..."
					}
				},
				
				ConnectGameIntent: {
					S_OK: { 
						speechOut: "Erfolgreich mit Spiel Verbunden, sage mir jetzt Deinen Namen und verwende dabei die Floskel: Mein Name ist",
						display:   "Erfolgreich mit Spiel Verbunden, sage mir jetzt Deinen Namen und verwende dabei die Floskel: 'Mein Name ist ...''."
					}
				},
				
				BlindGameIntent: {
					S_OK: { 
						speechOut: "Blindspiel wird gestartet, sage mir jetzt in wleche Reihe du wirfst",
						display :  "Blindspiel wird gestartet, sage mir jetzt in wleche Reihe du wirfst."
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
						speechOut: "Das Spiel ist zu ende. Um ein neues Spiel zu starten sage: Starte ein neues Spiel.",
						display :  "Das Spiel ist zu ende. Um ein neues Spiel zu starten sage: 'Starte ein neues Spiel'"
					}

				},
				
				SetAILevelIntent: {
					S_OK: { 
						speechOut: "Die Spielstärke wurde auf %1 gesetzt. Du bist am Zug.",
						display :  "Die Spielstärke wurde auf %1 gesetzt. Du bist am Zug."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Die Spielstärke muss eine Zahl von 1 bis 7 sein. In welche Reihe wirfst Du?",
						display :  "Die Spielstärke muss eine Zahl von 1 bis 7 sein. In welche Reihe wirfst Du?"
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
					E_UNKNOWN_GAMEID: { 
						speechOut: "Das Spiel wurde auf dem Server beendet. Starte bitte ein neues Spiel.",
						display:   "Das Spiel wurde auf dem Server beendet. Starte bitte ein neues Spiel." 
					},
					E_GAME_FINISHED: { 
						speechOut: "Das Spiel wurde auf dem Server beendet. Starte bitte ein neues Spiel.",
						display:   "Das Spiel wurde auf dem Server beendet. Starte bitte ein neues Spiel." 
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
	response.askWithCard(msg.speechOut, "Vier in einer Reihe Skill", msg.display);
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
	response.askWithCard(msg.speechOut, undefined, "Vier in einer Reihe Skill", msg.display);
}

function respondMsgWithDirectives(response, msg, directives) {
	response.askWithDirectives(msg.speechOut, undefined, msg.display, undefined, directives);
}
         
function outputMsgWithDirectives(response, msg, directives) {
	response.tellWithDirectives(msg.speechOut, msg.display, undefined, directives);
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
	response.tellWithCard(msg.speechOut, "Vier in einer Reihe Skill", msg.display);
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


module.exports = {init_messages, respond, createMsg, respondMsg, respondMsgWithDirectives, outputMsgWithDirectives, goodbye};
