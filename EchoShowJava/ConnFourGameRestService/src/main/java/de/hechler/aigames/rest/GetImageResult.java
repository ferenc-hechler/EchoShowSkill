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

import de.hechler.aigames.api.GenericResult;
import de.hechler.aigames.api.ResultCodeEnum;
import de.hechler.aigames.rest.ImageRegistry.ImageEnum;

public class GetImageResult extends GenericResult {

	
	public String imageName;
	public String einText;
	public String imageText;
	
	public GetImageResult(ResultCodeEnum resultCode, ImageEnum image, boolean english) {
		super(resultCode);
		this.imageName = image.name();
		if (english) {
			this.einText = image.aText_EN;
			this.imageText = image.imageText_EN;
		}
		else {
			this.einText = image.einText_DE;
			this.imageText = image.imageText_DE;
		}
	}

}
