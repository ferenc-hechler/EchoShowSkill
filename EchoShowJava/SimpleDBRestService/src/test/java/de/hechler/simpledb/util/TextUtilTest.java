package de.hechler.simpledb.util;

import static org.junit.Assert.*;

import org.junit.Test;

public class TextUtilTest {

	@Test
	public void testUmlaut() {
		String hoehle_lowerCase = "h"+TextUtil.UML_oe+"hle";
		String hoehle_upCase = "H"+TextUtil.UML_OE+"HLE";
		String normAnswer = TextUtil.normalizeAnswer(hoehle_lowerCase);
		assertEquals(hoehle_upCase, normAnswer);
		String normComp = TextUtil.normalizeForCompare(hoehle_lowerCase);
		assertEquals(hoehle_upCase, normComp);
	}

	@Test
	public void testPos2Line() {
		String text = 
				"abcd\n" + 
				"efgh\n" +
				"\n" +
				"ijkl\n";
		assertEquals(-1, TextUtil.pos2line(text, -1));
		assertEquals(1, TextUtil.pos2line(text, 0));
		assertEquals(1, TextUtil.pos2line(text, 3));
		assertEquals(1, TextUtil.pos2line(text, 4));
		assertEquals(2, TextUtil.pos2line(text, 5));
		assertEquals(2, TextUtil.pos2line(text, 9));
		assertEquals(3, TextUtil.pos2line(text, 10));
		assertEquals(4, TextUtil.pos2line(text, 11));
		assertEquals(4, TextUtil.pos2line(text, 15));
		assertEquals(-1, TextUtil.pos2line(text, 16));
	}
	
	@Test
	public void testLine2Pos() {
		String text = 
				"abcd\n" + 
				"efgh\n" +
				"\n" +
				"ijkl\n";
		assertEquals(-1, TextUtil.line2pos(text, 0));
		assertEquals(0, TextUtil.line2pos(text, 1));
		assertEquals(5, TextUtil.line2pos(text, 2));
		assertEquals(10, TextUtil.line2pos(text, 3));
		assertEquals(11, TextUtil.line2pos(text, 4));
		assertEquals(-1, TextUtil.line2pos(text, 5));
	}
	
}
