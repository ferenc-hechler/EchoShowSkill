/**
 * Diese Datei ist Teil des Alexa Skills Rollenspiel Soloabenteuer.
 * Copyright (C) 2016-2017 Ferenc Hechler (github@fh.anderemails.de)
 *
 * Der Alexa Skills Rollenspiel Soloabenteuer ist Freie Software: 
 * Sie koennen es unter den Bedingungen
 * der GNU General Public License, wie von der Free Software Foundation,
 * Version 3 der Lizenz oder (nach Ihrer Wahl) jeder spaeteren
 * veroeffentlichten Version, weiterverbreiten und/oder modifizieren.
 *
 * Der Alexa Skills Rollenspiel Soloabenteuer wird in der Hoffnung, 
 * dass es nuetzlich sein wird, aber
 * OHNE JEDE GEWAEHRLEISTUNG, bereitgestellt; sogar ohne die implizite
 * Gewaehrleistung der MARKTFAEHIGKEIT oder EIGNUNG FUER EINEN BESTIMMTEN ZWECK.
 * Siehe die GNU General Public License fuer weitere Details.
 * 
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
 */
package de.hechler.aigames.rest;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class ImageRegistry {

	
	public enum ImageEnum {
		  AFFE(			"einen", "Affen", 		"a",	"monkey"),
		  AMEISE(		"eine",	 "Ameise", 		"an",	"ant"),
		  BAER(			"einen", "Bären",		"a",	"bear"),
		  BIENE(		"eine",  "Biene",		"a",	"bee"),
		  DACHS(		"einen", "Dachs",		"a", 	"badger"),
		  DELFIN(		"einen", "Delfin",		"a", 	"dolphin"),
		  EICHHOERNCHEN("ein", "Eichhörnchen",	"a", 	"squirrel"),
		  ELEFANT(		"einen", "Elefanten",	"an", 	"elephant"),
		  ENTE(			"eine", "Ente",			"a", 	"duck"),
		  ESEL(			"einen", "Esel",		"a", 	"donkey"),
		  FISCH(		"einen", "Fisch",		"a", 	"fish"),
		  FLIEGE(		"eine", "Fliege",		"a", 	"fly"),
		  FROSCH(		"einen", "Frosch",		"a", 	"frog"),
		  GANS(			"eine", "Gans",			"a", 	"goose"),
		  GIRAFFE(		"eine", "Giraffe",		"a", 	"giraffe"),
		  HAHN(			"einen", "Hahn",		"a", 	"cock"),
		  HAI(			"einen", "Hai",			"a", 	"shark"),
		  HASE(			"einen", "Hasen",		"a", 	"rabbit"),
		  HIRSCH(		"einen", "Hirsch",		"a", 	"deer"),
		  HUND(			"einen", "Hund",		"a", 	"dog"),
		  IGEL(			"einen", "Igel",		"a", 	"hedgehog"),
		  KAMEL(		"ein", "Kamel",			"a", 	"camel"),
		  KATZE(		"eine", "Katze",		"a", 	"cat"),
		  KROKODIL(		"ein", "Krokodil",		"a", 	"crocodile"),
		  KUH(			"eine", "Kuh",			"a", 	"cow"),
		  LOEWE(		"einen", "Löwen",		"a", 	"lion"),
		  MARIENKAEFER(	"einen", "Marienkäfer",	"a", 	"ladybug"),
		  MAUS(			"eine", "Maus",			"a", 	"mouse"),
		  MOEWE(		"eine", "Möwe",			"a", 	"gull"),
		  NASHORN(		"ein", "Nashorn",		"a", 	"rhino"),
		  PANDA(		"einen", "Panda",		"a", 	"panda"),
		  PAPAGEI(		"einen", "Papagei",		"a", 	"parrot"),
		  PFAU(			"einen", "Pfau",		"a", 	"peacock"),
		  PFERD(		"ein", "Pferd",			"a", 	"horse"),
		  PINGUIN(		"einen", "Pinguin",		"a", 	"penguin"),
		  RAUPE(		"eine", "Raupe",		"a", 	"caterpillar"),
		  SCHAF(		"ein", "Schaf",			"a", 	"sheep"),
		  SCHILDKROETE(	"eine", "Schildkröte",	"a", 	"turtle"),
		  SCHLANGE(		"eine", "Schlange",		"a", 	"snake"),
		  SCHMETTERLING("einen", "Schmetterling","a", 	"butterfly"),
		  SCHNECKE(		"eine", "Schnecke",		"a", 	"snail"),
		  SCHWAN(		"einen", "Schwan",		"a", 	"swan"),
		  SCHWEIN(		"ein", "Schwein",		"a", 	"pig"),
		  SPINNE(		"eine", "Spinne",		"a", 	"spider"),
		  STORCH(		"einen", "Storch",		"a", 	"stork"),
		  TIGER(		"einen", "Tiger",		"a", 	"tiger"),
		  WAL(			"einen", "Wal",			"a", 	"whale"),
		  WOLF(			"einen", "Wolf",		"a", 	"wolf"),
		  WURM(			"einen", "Wurm",		"a", 	"worm"),
		  ZEBRA(		"ein", "Zebra",			"a", 	"zebra"),
		  
		  FRAGEZEICHEN(	"ein", "?",				"a", 	"?");
		String einText_DE;
		String imageText_DE;
		String aText_EN;
		String imageText_EN;
		ImageEnum(String einText_DE, String imageText_DE, String aText_EN, String imageText_EN) {
			this.einText_DE = einText_DE;
			this.imageText_DE = imageText_DE;
			this.aText_EN = aText_EN;
			this.imageText_EN = imageText_EN;
		}
	}	
	
	public class SessionEntry {
		public String sessionId;
		public ImageEnum image;
		public String gameId;
		public long creationTime;
		public SessionEntry(String sessionId, ImageEnum image) {
			this.sessionId = sessionId;
			this.image = image;
			this.creationTime = System.currentTimeMillis();
		}
		@Override
		public String toString() {
			return "SESS["+image+ ": "+ sessionId+"->"+gameId+"]";
		}
	}
	
	private static ImageRegistry instance;
	public static ImageRegistry getInstance() {
		if (instance == null) {
			instance = new ImageRegistry();
		}
		return instance;
	}

	private List<ImageEnum> freeImages;
	private Map<ImageEnum, SessionEntry> image2entryMap;
	private Map<String, SessionEntry> session2entryMap;
	
	private ImageRegistry() {
		freeImages = new ArrayList<>(Arrays.asList(ImageEnum.values()));
		freeImages.remove(ImageEnum.FRAGEZEICHEN);
		Collections.shuffle(freeImages);
		image2entryMap = new HashMap<>();
		session2entryMap = new HashMap<>();
	}
	
	public synchronized SessionEntry getSessionEntry(String session) {
		SessionEntry entry = session2entryMap.get(session);
		if (entry != null) {
			return entry;
		}
		ImageEnum result = findFreeImage();
		freeImages.remove(result);
		entry = new SessionEntry(session, result);
		session2entryMap.put(session, entry);
		image2entryMap.put(result, entry);
		return entry;
	}

	public synchronized SessionEntry getSessionEntry(ImageEnum image) {
		SessionEntry entry = image2entryMap.get(image);
		return entry;
	}

	private ImageEnum findFreeImage() {
		if (freeImages.isEmpty()) {
			SessionEntry entry = findOldestSession();
			session2entryMap.remove(entry.sessionId);
			image2entryMap.remove(entry.image);
			freeImages.add(entry.image);
		}
		return freeImages.get(0);
	}

	private SessionEntry findOldestSession() {
		SessionEntry oldestEntry = null;
		for (SessionEntry entry:session2entryMap.values()) {
			if ((oldestEntry == null) || (entry.creationTime < oldestEntry.creationTime)) {
				oldestEntry = entry;
			}
		}
		return oldestEntry;
	}

	public synchronized void freeSession(String sessionId) {
		SessionEntry entry = session2entryMap.get(sessionId);
		if (entry != null) {
			session2entryMap.remove(entry.sessionId);
			image2entryMap.remove(entry.image);
			freeImages.add(entry.image);
		}
	}
	
}
