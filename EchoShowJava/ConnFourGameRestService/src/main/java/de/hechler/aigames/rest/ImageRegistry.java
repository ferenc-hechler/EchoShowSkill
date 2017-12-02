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
		  AFFE("einen", "Affen"),
		  AMEISE("eine", "Ameise"),
		  BAER("einen", "Bären"),
		  BIENE("eine", "Biene"),
		  DACHS("einen", "Dachs"),
		  DELFIN("einen", "Delfin"),
		  EICHHOERNCHEN("ein", "Eichhörnchen"),
		  ELEFANT("einen", "Elefanten"),
		  ENTE("eine", "Ente"),
		  ESEL("einen", "Esel"),
		  FISCH("einen", "Fisch"),
		  FLIEGE("eine", "Fliege"),
		  FROSCH("einen", "Frosch"),
		  GANS("eine", "Gans"),
		  GIRAFFE("eine", "Giraffe"),
		  HAHN("einen", "Hahn"),
		  HAI("einen", "Hai"),
		  HASE("einen", "Hasen"),
		  HIRSCH("einen", "Hirsch"),
		  HUND("einen", "Hund"),
		  IGEL("einen", "Igel"),
		  KAMEL("ein", "Kamel"),
		  KATZE("eine", "Katze"),
		  KROKODIL("ein", "Krokodil"),
		  KUH("eine", "Kuh"),
		  LOEWE("einen", "Löwen"),
		  MARIENKAEFER("einen", "Marienkäfer"),
		  MAUS("eine", "Maus"),
		  MOEWE("eine", "Möwe"),
		  NASHORN("ein", "Nashorn"),
		  PANDA("einen", "Panda"),
		  PAPAGEI("einen", "Papagei"),
		  PFAU("einen", "Pfau"),
		  PFERD("ein", "Pferd"),
		  PINGUIN("einen", "Pinguin"),
		  RAUPE("eine", "Raupe"),
		  SCHAF("ein", "Schaf"),
		  SCHILDKROETE("eine", "Schildkröte"),
		  SCHLANGE("eine", "Schlange"),
		  SCHMETTERLING("einen", "Schmetterling"),
		  SCHNECKE("eine", "Schnecke"),
		  SCHWAN("einen", "Schwan"),
		  SCHWEIN("ein", "Schwein"),
		  SPINNE("eine", "Spinne"),
		  STORCH("einen", "Storch"),
		  TIGER("einen", "Tiger"),
		  WAL("einen", "Wal"),
		  WOLF("einen", "Wolf"),
		  WURM("einen", "Wurm"),
		  ZEBRA("ein", "Zebra"),
		  
		  FRAGEZEICHEN("ein", "?");
		String einText;
		String imageText;
		ImageEnum(String einText, String imageText) {
			this.einText = einText;
			this.imageText = imageText;
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
